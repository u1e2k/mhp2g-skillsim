import json
import time

with open('src/data/skills.json', encoding='utf-8') as f: skills_db = json.load(f)
with open('src/data/decorations.json', encoding='utf-8') as f: decos_db = json.load(f)
with open('src/data/armors.json', encoding='utf-8') as f: armors_db = json.load(f)

# Target: 抜刀アーティテンプレ (斬れ味レベル+1, 抜刀術, 集中)
target_skills = {'匠': 10, '抜刀': 10, '溜め短縮': 10}
hunter_type = 'blade'
sex = 'all'
weapon_slots = 0 # 武器スロ0 (角王剣アーティラート)

t0 = time.time()

# 1. Filter relevant decos
relevant_decos = []
for d in decos_db:
    # We care about decos that give positive points to at least one target skill
    # and don't deduct points from other target skills (or if they do, we track it)
    pos_skills = {k: v for k, v in d['skills'].items() if k in target_skills and v > 0}
    if pos_skills:
        relevant_decos.append(d)

print("Relevant decorations:", [d['name'] for d in relevant_decos])

# Helper packing function
def can_pack(d1, d2, d3, c1, c2, c3):
    if d3 > c3:
        return False
    rem_c3 = c3 - d3
    if d2 <= c2:
        rem_c2 = c2 - d2
        avail_1 = c1 + rem_c2 * 2 + rem_c3 * 3
        return d1 <= avail_1
    else:
        overflow_2 = d2 - c2
        if overflow_2 > rem_c3:
            return False
        rem_c3_after_2 = rem_c3 - overflow_2
        avail_1 = c1 + overflow_2 * 1 + rem_c3_after_2 * 3
        return d1 <= avail_1

# Find deco combinations that can satisfy remaining needed skills
# We can precompute or branch on deco combinations for needed skills.
# Since number of target skills is small (<= 6), we can find minimum decos needed.
# For each skill tree, what decos exist:
decos_by_tree = {}
for k in target_skills:
    decos_by_tree[k] = [d for d in relevant_decos if k in d['skills']]

print("Decos by tree:", {k: [d['name'] for d in decos_by_tree[k]] for k in decos_by_tree})

# 2. Filter & Compress Armors into Equivalence Classes
parts = ['head', 'body', 'arm', 'waist', 'leg']
equiv_armors = {p: [] for p in parts}

for p in parts:
    matching = [a for a in armors_db if a['part'] == p and a['hunterType'] in (hunter_type, 'both') and (sex == 'all' or a['sex'] in (sex, 'all'))]
    
    # Group by: (torsoUp, slots, tuple(skills[k] for k in target_skills))
    groups = {}
    for a in matching:
        key = (
            a.get('torsoUp', False),
            a['slots'],
            tuple(a['skills'].get(k, 0) for k in target_skills)
        )
        if key not in groups:
            groups[key] = {
                'key': key,
                'torsoUp': key[0],
                'slots': key[1],
                'skills': {k: a['skills'].get(k, 0) for k in target_skills},
                'armors': [a]
            }
        else:
            groups[key]['armors'].append(a)
    
    # For each group, sort armors by defense descending
    for g in groups.values():
        g['armors'].sort(key=lambda x: x['defense'], reverse=True)
        g['best_armor'] = g['armors'][0]
        equiv_armors[p].append(g)
    
    print(f"Part {p}: {len(matching)} armors -> {len(equiv_armors[p])} equivalence classes")

t1 = time.time()
print(f"Preprocessed in {(t1-t0)*1000:.2f} ms")

# 3. Solver with Branch & Bound
solutions = []
search_count = 0

# Sort body first, because body determines torso up multiplier
# For quick testing, let's write the solver:
def solve():
    global search_count
    # Possible torso deco configurations
    # For a given body slots (0, 1, 2, 3), generate possible deco placements on body
    body_groups = equiv_armors['body']
    head_groups = equiv_armors['head']
    arm_groups = equiv_armors['arm']
    waist_groups = equiv_armors['waist']
    leg_groups = equiv_armors['leg']

    for b in body_groups:
        b_skills = b['skills']
        b_slots = b['slots']

        # Precompute torso decos possible on body
        # e.g., if b_slots == 2, could put 1 2-slot deco, or 2 1-slot decos, etc.
        torso_deco_options = [({}, 0, 0, 0)] # (pts_dict, d1, d2, d3)
        if b_slots >= 1:
            for d in relevant_decos:
                if d['slots'] == 1:
                    pts = {k: d['skills'].get(k, 0) for k in target_skills}
                    torso_deco_options.append((pts, 1, 0, 0))
        if b_slots >= 2:
            for d in relevant_decos:
                if d['slots'] == 2:
                    pts = {k: d['skills'].get(k, 0) for k in target_skills}
                    torso_deco_options.append((pts, 0, 1, 0))
        if b_slots >= 3:
            for d in relevant_decos:
                if d['slots'] == 3:
                    pts = {k: d['skills'].get(k, 0) for k in target_skills}
                    torso_deco_options.append((pts, 0, 0, 1))

        for h in head_groups:
            h_mult = 1 if h['torsoUp'] else 0
            h_skills = {} if h_mult else h['skills']
            h_slots = 0 if h_mult else h['slots']

            for a in arm_groups:
                a_mult = 1 if a['torsoUp'] else 0
                a_skills = {} if a_mult else a['skills']
                a_slots = 0 if a_mult else a['slots']

                for w in waist_groups:
                    w_mult = 1 if w['torsoUp'] else 0
                    w_skills = {} if w_mult else w['skills']
                    w_slots = 0 if w_mult else w['slots']

                    for l in leg_groups:
                        l_mult = 1 if l['torsoUp'] else 0
                        l_skills = {} if l_mult else l['skills']
                        l_slots = 0 if l_mult else l['slots']

                        search_count += 1
                        mult = 1 + h_mult + a_mult + w_mult + l_mult

                        # Base equipment skills (excluding body decos)
                        base_pts = {}
                        for k in target_skills:
                            base_pts[k] = (b_skills[k] * mult +
                                           h_skills.get(k, 0) +
                                           a_skills.get(k, 0) +
                                           w_skills.get(k, 0) +
                                           l_skills.get(k, 0))

                        # Count non-torso slot capacities
                        c1 = (1 if weapon_slots == 1 else 0) + (1 if h_slots == 1 else 0) + (1 if a_slots == 1 else 0) + (1 if w_slots == 1 else 0) + (1 if l_slots == 1 else 0)
                        c2 = (1 if weapon_slots == 2 else 0) + (1 if h_slots == 2 else 0) + (1 if a_slots == 2 else 0) + (1 if w_slots == 2 else 0) + (1 if l_slots == 2 else 0)
                        c3 = (1 if weapon_slots == 3 else 0) + (1 if h_slots == 3 else 0) + (1 if a_slots == 3 else 0) + (1 if w_slots == 3 else 0) + (1 if l_slots == 3 else 0)

                        # Try torso deco options
                        for t_pts, td1, td2, td3 in torso_deco_options:
                            total_with_torso = {k: base_pts[k] + t_pts.get(k, 0) * mult for k in target_skills}
                            
                            needed = {k: max(0, target_skills[k] - total_with_torso[k]) for k in target_skills}
                            if all(v == 0 for v in needed.values()):
                                # Match found!
                                solutions.append({
                                    'head': h['best_armor']['name'],
                                    'body': b['best_armor']['name'],
                                    'arm': a['best_armor']['name'],
                                    'waist': w['best_armor']['name'],
                                    'leg': l['best_armor']['name'],
                                    'torso_mult': mult,
                                    'defense': h['best_armor']['defense'] + b['best_armor']['defense'] + a['best_armor']['defense'] + w['best_armor']['defense'] + l['best_armor']['defense']
                                })
                                return # found first solution

solve()
t2 = time.time()
print(f"Searched {search_count} combinations in {(t2-t1)*1000:.2f} ms")
print(f"Found solution: {solutions[0] if solutions else 'None'}")
