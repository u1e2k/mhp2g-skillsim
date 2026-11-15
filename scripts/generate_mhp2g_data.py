import os
import re
import json
from html.parser import HTMLParser

class GridTableParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tables = []
        self.in_table = False
        self.in_cell = False
        self.cell_tag = None
        self.cell_attrs = {}
        self.cell_text = []
        self.grid = []
        self.row_idx = -1
        self.col_idx = 0

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if tag == 'table':
            self.in_table = True
            self.grid = []
            self.row_idx = -1
        elif tag == 'tr' and self.in_table:
            self.row_idx += 1
            if len(self.grid) <= self.row_idx:
                self.grid.append([])
            self.col_idx = 0
        elif tag in ('td', 'th') and self.in_table:
            self.in_cell = True
            self.cell_tag = tag
            self.cell_attrs = attrs_dict
            self.cell_text = []

    def handle_endtag(self, tag):
        if tag == 'table' and self.in_table:
            self.in_table = False
            self.tables.append(self.grid)
        elif tag in ('td', 'th') and self.in_cell:
            self.in_cell = False
            text = ''.join(self.cell_text).strip().replace('\xa0', ' ')
            rowspan = int(self.cell_attrs.get('rowspan', 1))
            colspan = int(self.cell_attrs.get('colspan', 1))

            current_row = self.grid[self.row_idx]
            while len(current_row) > self.col_idx and current_row[self.col_idx] is not None:
                self.col_idx += 1

            for r in range(rowspan):
                target_r = self.row_idx + r
                while len(self.grid) <= target_r:
                    self.grid.append([])
                target_row = self.grid[target_r]
                for c in range(colspan):
                    target_c = self.col_idx + c
                    while len(target_row) <= target_c:
                        target_row.append(None)
                    target_row[target_c] = text
            self.col_idx += colspan

    def handle_data(self, data):
        if self.in_cell:
            self.cell_text.append(data)

def parse_html_tables(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()
    parser = GridTableParser()
    parser.feed(html)
    return parser.tables

# 1. Parse Skills
def build_skills():
    tables = parse_html_tables('data_raw/skills.html')
    categories = [
        "攻撃系", "防御系", "剣士系", "ガンナー系", 
        "特殊系", "アイテム・マップ系", "ステータス系", "オトモ系", "その他"
    ]
    skill_trees = {} # tree_name -> { name, category, skills: [{ points, name, desc }] }
    
    current_tree = None

    for t_idx, t in enumerate(tables):
        cat_name = categories[t_idx] if t_idx < len(categories) else "その他"
        if not t or len(t) < 2:
            continue
        header = t[0]
        # header typically ['スキル系統', '値', '発動スキル', 'スキル効果']
        for row in t[1:]:
            if not row or len(row) < 3:
                continue
            if len(row) == 4:
                tree_cand, val_str, act_name, desc = row
                if tree_cand:
                    current_tree = tree_cand.strip()
            elif len(row) == 3:
                val_str, act_name, desc = row
            else:
                continue

            if not current_tree:
                continue

            if current_tree == '胴系統倍加':
                continue

            # Parse points
            pts_match = re.search(r'([\+\-]?\d+)', val_str)
            if not pts_match:
                continue
            pts = int(pts_match.group(1))

            if current_tree not in skill_trees:
                skill_trees[current_tree] = {
                    "id": current_tree,
                    "name": current_tree,
                    "category": cat_name,
                    "skills": []
                }

            skill_trees[current_tree]["skills"].append({
                "points": pts,
                "name": act_name.strip(),
                "description": desc.strip()
            })

    # Sort activated skills by points descending
    for tree in skill_trees.values():
        tree["skills"].sort(key=lambda s: s["points"], reverse=True)

    print(f"Extracted {len(skill_trees)} skill trees.")
    return skill_trees

# 2. Parse Decorations
def build_decorations(skill_trees):
    tables = parse_html_tables('data_raw/decorations.html')
    decorations = []
    seen = set()

    for t in tables:
        if not t or len(t) < 2:
            continue
        header = t[0]
        if '名称' not in header or 'ｽﾛｯﾄ' not in header:
            continue
        
        name_idx = header.index('名称')
        slot_idx = header.index('ｽﾛｯﾄ')
        effect_idx = header.index('効果')
        rank_idx = header.index('作成可能') if '作成可能' in header else -1

        current_name = None
        current_effects = None

        for row in t[1:]:
            if not row or len(row) <= max(name_idx, slot_idx, effect_idx):
                continue
            name = row[name_idx]
            effect = row[effect_idx]
            slot_str = row[slot_idx]
            rank_str = row[rank_idx] if rank_idx != -1 and rank_idx < len(row) else "下位"

            if name:
                current_name = name.strip()
            if effect:
                current_effects = effect.strip()

            if not current_name or not current_effects:
                continue

            # slots: count 'O'
            slots = slot_str.count('O') if slot_str else 1
            if slots == 0 and 'O' in slot_str:
                slots = 1

            # parse effects e.g. "攻撃+1" or "攻撃+3 防御-1"
            pairs = re.findall(r'([^\+\-\d\s]+)([\+\-]\d+)', current_effects)
            skills = {}
            for tree, pts in pairs:
                skills[tree.strip()] = int(pts)

            key = (current_name, slots, tuple(sorted(skills.items())))
            if key in seen:
                continue
            seen.add(key)

            decorations.append({
                "id": f"deco_{len(decorations)+1}",
                "name": current_name,
                "slots": slots,
                "skills": skills,
                "rank": rank_str.strip() if rank_str else "下位"
            })

    print(f"Extracted {len(decorations)} decorations.")
    return decorations

# 3. Parse Armors
def build_armors(skill_trees):
    part_files = [
        ('head', 'data_raw/head.html'),
        ('body', 'data_raw/body.html'),
        ('arm', 'data_raw/arm.html'),
        ('waist', 'data_raw/waist.html'),
        ('leg', 'data_raw/leg.html'),
    ]

    all_armors = []
    seen = set()

    for part, filepath in part_files:
        tables = parse_html_tables(filepath)
        part_armors = []
        for t_idx, t in enumerate(tables):
            if not t or len(t) < 2:
                continue
            header = t[0]
            if '防具名称' not in header or 'ｽﾛｯﾄ' not in header:
                continue

            name_idx = header.index('防具名称')
            type_idx = header.index('職別') if '職別' in header else -1
            sex_idx = header.index('性別') if '性別' in header else -1
            def_idx = header.index('防御力') if '防御力' in header else -1
            slot_idx = header.index('ｽﾛｯﾄ') if 'ｽﾛｯﾄ' in header else -1
            skill_idx = header.index('スキル') if 'スキル' in header else -1
            
            # resistances
            fire_idx = header.index('火耐性') if '火耐性' in header else -1
            water_idx = header.index('水耐性') if '水耐性' in header else -1
            thunder_idx = header.index('雷耐性') if '雷耐性' in header else -1
            ice_idx = header.index('氷耐性') if '氷耐性' in header else -1
            dragon_idx = header.index('龍耐性') if '龍耐性' in header else -1

            # rank determination based on table or defense
            rank = "下位"
            if t_idx in (5, 6, 7):
                rank = "上位"
            elif t_idx in (8, 9, 10):
                rank = "G級"

            for row in t[1:]:
                if not row or len(row) <= max(name_idx, slot_idx, skill_idx):
                    continue
                name = row[name_idx].strip()
                if not name:
                    continue

                type_str = row[type_idx].strip() if type_idx != -1 and type_idx < len(row) else "剣/ガ"
                hunter_type = "both"
                if type_str == "剣":
                    hunter_type = "blade"
                elif type_str == "ガ":
                    hunter_type = "gunner"
                elif "剣" in type_str and "ガ" in type_str:
                    hunter_type = "both"

                sex_str = row[sex_idx].strip() if sex_idx != -1 and sex_idx < len(row) else ""
                sex = "all"
                if sex_str == "男":
                    sex = "male"
                elif sex_str == "女":
                    sex = "female"

                # defense
                def_str = row[def_idx].strip() if def_idx != -1 and def_idx < len(row) else "0"
                try:
                    defense = int(re.search(r'\d+', def_str).group(0))
                except:
                    defense = 0

                # resistances
                def get_res(idx):
                    if idx != -1 and idx < len(row) and row[idx]:
                        m = re.search(r'[\+\-]?\d+', row[idx])
                        if m:
                            return int(m.group(0))
                    return 0

                res = {
                    "fire": get_res(fire_idx),
                    "water": get_res(water_idx),
                    "thunder": get_res(thunder_idx),
                    "ice": get_res(ice_idx),
                    "dragon": get_res(dragon_idx),
                }

                # slots
                slot_str = row[slot_idx].strip() if slot_idx < len(row) else "---"
                slots = slot_str.count('O')

                # skills
                skill_str = row[skill_idx].strip() if skill_idx < len(row) else ""
                torso_up = ("胴系統倍加" in skill_str or "倍加" in skill_str)
                
                skills = {}
                if not torso_up and "スキルポイント無し" not in skill_str:
                    pairs = re.findall(r'([^\+\-\d\s]+)([\+\-]\d+)', skill_str)
                    for tree, pts in pairs:
                        skills[tree.strip()] = int(pts)

                # rank refinement
                final_rank = rank
                if 'X' in name or 'Z' in name or '・真' in name or defense >= 70:
                    final_rank = "G級"
                elif 'S' in name or 'U' in name or defense >= 35:
                    if final_rank != "G級":
                        final_rank = "上位"

                # unique key
                key = (part, name, hunter_type, sex)
                if key in seen:
                    continue
                seen.add(key)

                armor = {
                    "id": f"{part}_{len(all_armors)+1}",
                    "name": name,
                    "part": part,
                    "hunterType": hunter_type,
                    "sex": sex,
                    "defense": defense,
                    "resistances": res,
                    "slots": slots,
                    "torsoUp": torso_up,
                    "skills": skills,
                    "rank": final_rank
                }
                all_armors.append(armor)

    print(f"Extracted {len(all_armors)} armors.")
    return all_armors

def main():
    os.makedirs('src/data', exist_ok=True)
    skills = build_skills()
    decorations = build_decorations(skills)
    armors = build_armors(skills)

    with open('src/data/skills.json', 'w', encoding='utf-8') as f:
        json.dump(skills, f, ensure_ascii=False, indent=2)

    with open('src/data/decorations.json', 'w', encoding='utf-8') as f:
        json.dump(decorations, f, ensure_ascii=False, indent=2)

    with open('src/data/armors.json', 'w', encoding='utf-8') as f:
        json.dump(armors, f, ensure_ascii=False, indent=2)

    print("Successfully generated skills.json, decorations.json, and armors.json in src/data/")

if __name__ == '__main__':
    main()
