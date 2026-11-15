import json
import time

with open('src/data/skills.json', encoding='utf-8') as f:
    skills_db = json.load(f)
with open('src/data/decorations.json', encoding='utf-8') as f:
    decos_db = json.load(f)
with open('src/data/armors.json', encoding='utf-8') as f:
    armors_db = json.load(f)

target_skills = {
    '匠': 10,
    '抜刀': 10,
    '溜め短縮': 10
}

# Relevant decorations
relevant_decos = []
for d in decos_db:
    if any(tree in target_skills and pts > 0 for tree, pts in d['skills'].items()):
        relevant_decos.append(d)

# For a given slot size (1, 2, 3), what decorations can fit?
# Deco fits in size S if deco.slots <= S
# In MHP2G:
# 1 slot decos can fit in 1, 2, or 3
# 2 slot decos can fit in 2 or 3
# 3 slot decos can fit only in 3

# Precompute slot patterns:
# A single piece or weapon has 0, 1, 2, or 3 slots.
# Non-torso slots can be represented as count of 3-slots, 2-slots, 1-slots.

# Let's filter armors:
parts = ['head', 'body', 'arm', 'waist', 'leg']
filtered_armors = {p: [] for p in parts}

for a in armors_db:
    if a['hunterType'] not in ('blade', 'both'):
        continue
    if a['sex'] not in ('male', 'all'):
        continue
    # Check if armor has relevant skills or torso up or slots
    has_rel_skill = any(tree in target_skills for tree in a['skills'])
    is_torso_up = a.get('torsoUp', False)
    slots = a['slots']
    
    # We keep it if it has rel skill or torso up or is a slot holder
    filtered_armors[a['part']].append(a)

# Now apply dominance filtering on each part:
# For armor A and B:
# If B has same or better skills on ALL target_skills, same or better slots, same or better defense,
# then A is dominated by B (unless A has other benefits, but for target skills satisfaction, B is superior).
# Even simpler: For armors with NO target skills and NO torsoUp, only keep the ONE with maximum defense for each slot count (0, 1, 2, 3).
pruned_armors = {p: [] for p in parts}
for p in parts:
    slot_bests = {} # slots -> max defense armor
    for a in filtered_armors[p]:
        rel_skills = {k: v for k, v in a['skills'].items() if k in target_skills}
        if not rel_skills and not a.get('torsoUp'):
            s = a['slots']
            if s not in slot_bests or a['defense'] > slot_bests[s]['defense']:
                slot_bests[s] = a
        else:
            pruned_armors[p].append(a)
    for s_armor in slot_bests.values():
        pruned_armors[p].append(s_armor)
    print(f"Part {p}: {len(filtered_armors[p])} -> pruned to {len(pruned_armors[p])}")

# Let's test search speed
t0 = time.time()
solutions = []

# DFS or direct loops
head_list = pruned_armors['head']
body_list = pruned_armors['body']
arm_list = pruned_armors['arm']
waist_list = pruned_armors['waist']
leg_list = pruned_armors['leg']

print("Exploring combinations...")
# Deco checker for a specific needed skill vector and slot counts (n1, n2, n3)
# For this target: 匠 10, 抜刀 10, 溜め短縮 10
# Relevant decos:
# 匠: 名匠珠(3slot->4pt), 匠珠(1slot->1pt)
# 抜刀: 抜撃珠(2slot->3pt), 抜刀珠(1slot->1pt)
# 溜め短縮: 圧縮珠(3slot->4pt), 短縮珠(1slot->1pt)

count_checked = 0
for b in body_list:
    # Body sets the base for torso up
    b_skills = {k: b['skills'].get(k, 0) for k in target_skills}
    b_slots = b['slots']
    
    # Check head
    for h in head_list:
        h_mult = 1 if h.get('torsoUp') else 0
        h_skills = {} if h_mult else {k: h['skills'].get(k, 0) for k in target_skills}
        
        for a in arm_list:
            a_mult = 1 if a.get('torsoUp') else 0
            a_skills = {} if a_mult else {k: a['skills'].get(k, 0) for k in target_skills}
            
            for w in waist_list:
                w_mult = 1 if w.get('torsoUp') else 0
                w_skills = {} if w_mult else {k: w['skills'].get(k, 0) for k in target_skills}
                
                for l in leg_list:
                    l_mult = 1 if l.get('torsoUp') else 0
                    l_skills = {} if l_mult else {k: l['skills'].get(k, 0) for k in target_skills}
                    
                    count_checked += 1
                    torso_mult = 1 + h_mult + a_mult + w_mult + l_mult
                    
                    # Total base skill points
                    total_pts = {}
                    for k in target_skills:
                        total_pts[k] = (b_skills[k] * torso_mult +
                                        h_skills.get(k, 0) +
                                        a_skills.get(k, 0) +
                                        w_skills.get(k, 0) +
                                        l_skills.get(k, 0))
                    
                    # Remaining needed
                    needed = {k: max(0, target_skills[k] - total_pts[k]) for k in target_skills}
                    if all(v == 0 for v in needed.values()):
                        solutions.append((h['name'], b['name'], a['name'], w['name'], l['name']))
                        if len(solutions) >= 10:
                            break
                if len(solutions) >= 10: break
            if len(solutions) >= 10: break
        if len(solutions) >= 10: break
    if len(solutions) >= 10: break

t1 = time.time()
print(f"Checked {count_checked} combos in {(t1-t0)*1000:.2f} ms")
print(f"Found {len(solutions)} exact base matches (before decorations!):")
for s in solutions[:5]:
    print(" ", s)
