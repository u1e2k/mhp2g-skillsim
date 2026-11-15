def can_pack(d1, d2, d3, c1, c2, c3):
    # d1, d2, d3: number of 1-slot, 2-slot, 3-slot decorations
    # c1, c2, c3: number of 1-slot, 2-slot, 3-slot pieces
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
        # Each overflow 2-slot deco takes a 3-slot piece, leaving 1 empty slot
        rem_c3_after_2 = rem_c3 - overflow_2
        avail_1 = c1 + overflow_2 * 1 + rem_c3_after_2 * 3
        return d1 <= avail_1

# Test cases
# 1 piece of 3-slot: can fit 1 d3? yes
assert can_pack(0, 0, 1, 0, 0, 1) == True
# 1 piece of 3-slot: can fit 1 d2 and 1 d1? yes
assert can_pack(1, 1, 0, 0, 0, 1) == True
# 1 piece of 3-slot: can fit 3 d1? yes
assert can_pack(3, 0, 0, 0, 0, 1) == True
# 1 piece of 3-slot: can fit 4 d1? no
assert can_pack(4, 0, 0, 0, 0, 1) == False
# 1 piece of 3-slot: can fit 2 d2? no
assert can_pack(0, 2, 0, 0, 0, 1) == False
# 1 piece of 2-slot and 1 piece of 1-slot: can fit 1 d2 and 1 d1? yes
assert can_pack(1, 1, 0, 1, 1, 0) == True
# 1 piece of 2-slot and 1 piece of 1-slot: can fit 1 d3? no
assert can_pack(0, 0, 1, 1, 1, 0) == False

print("All packing unit tests passed!")
