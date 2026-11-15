# Test deco solver for needed skills: {'抜刀': 10} with 5 2-slots (c1=0, c2=5, c3=0)
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

# Available decos for 抜刀:
# 抜刀珠: 1 slot -> 1 pt
# 抜撃珠: 2 slots -> 3 pt

# For needed 10 pts of 抜刀:
# Possible deco sets:
# 3 x 抜撃珠(2s, 3pt) + 1 x 抜刀珠(1s, 1pt) => 10 pt. decos: d1=1, d2=3, d3=0.
# Can pack in (c1=0, c2=5, c3=0)?
print("Can pack (d1=1, d2=3, d3=0) in (c1=0, c2=5, c3=0):", can_pack(1, 3, 0, 0, 5, 0))
# rem_c2 = 5 - 3 = 2. avail_1 = 0 + 2*2 + 0 = 4. 1 <= 4 -> True!
