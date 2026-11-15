import json
import time

with open('src/data/skills.json', encoding='utf-8') as f: skills_db = json.load(f)
with open('src/data/decorations.json', encoding='utf-8') as f: decos_db = json.load(f)
with open('src/data/armors.json', encoding='utf-8') as f: armors_db = json.load(f)

# Target: 匠 10, 抜刀 10, 溜め短縮 10 (Famous "抜刀アーティ" set)
target_skills = {'匠': 10, '抜刀': 10, '溜め短縮': 10}
target_keys = list(target_skills.keys())

# Relevant decos: positive for at least one target skill
relevant_decos = []
for d in decos_db:
    if any(k in target_skills and d['skills'].get(k, 0) > 0 for k in target_skills):
        relevant_decos.append(d)

print("Relevant decos:", [(d['name'], d['slots'], d['skills']) for d in relevant_decos])

# Deco fitting solver for (c1, c2, c3) slots and needed dict
def can_fit_decos(needed, c1, c2, c3):
    # If nothing needed, done
    if all(v <= 0 for v in needed.values()):
        return True, []
    
    # We can use recursive search or dynamic programming
    # Available slot capacities: we have c1 1-slots, c2 2-slots, c3 3-slots
    # A 3-slot can take: a 3-slot deco, or a 2-slot deco + 1 leftover 1-slot, or a 1-slot deco + 1 leftover 2-slot, etc.
    # But in MH, a single 3-slot piece can only take ONE decoration, OR up to 3 1-slot decos / 1 2-slot + 1 1-slot!
    # Wait! In MH, a piece with 3 slots has 3 slot dots. You can put:
    # - one 3-slot deco
    # - or one 2-slot deco + one 1-slot deco
    # - or three 1-slot decos!
    # That is: 3 slot dots can be partitioned!
    pass

