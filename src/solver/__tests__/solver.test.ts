import { solveSim } from '../index';
import type { SimCondition } from '../../types';

console.log('--- Testing Solver: 抜刀術 + 集中 + 斬れ味レベル+1 ---');

const condition1: SimCondition = {
  targetSkills: {
    '匠': 10,
    '抜刀': 10,
    '溜め短縮': 10,
  },
  hunterType: 'blade',
  sex: 'male',
  rankLimit: 'G級',
  weaponSlots: 0,
};

const result1 = solveSim(condition1, 5);
console.log(`Found ${result1.solutions.length} solutions in ${result1.durationMs.toFixed(2)}ms (checked ${result1.totalChecked} combos)`);

if (result1.solutions.length > 0) {
  const top = result1.solutions[0];
  console.log('Top solution:');
  console.log(`  Head:  ${top.head.name} (${top.head.slots} slots)`);
  console.log(`  Body:  ${top.body.name} (${top.body.slots} slots)`);
  console.log(`  Arm:   ${top.arm.name} (${top.arm.slots} slots)`);
  console.log(`  Waist: ${top.waist.name} (${top.waist.slots} slots)`);
  console.log(`  Leg:   ${top.leg.name} (${top.leg.slots} slots)`);
  console.log(`  Defense: ${top.totalDefense}`);
  console.log(`  Torso Multiplier: x${top.torsoMultiplier}`);
  console.log(`  Active skills:`, top.activeSkills);
  console.log(`  Remaining slots: ${top.remainingSlots.total}`);
  console.log(`  Body decos:`, top.decorations.body.map(d => d.name));
  console.log(`  Other decos:`, [
    ...top.decorations.head,
    ...top.decorations.arm,
    ...top.decorations.waist,
    ...top.decorations.leg,
  ].map(d => d.name));
}

console.log('\n--- Testing Solver: 高級耳栓 (聴覚保護 15) + 斬れ味レベル+1 (匠 10) ---');
const condition2: SimCondition = {
  targetSkills: {
    '聴覚保護': 15,
    '匠': 10,
  },
  hunterType: 'blade',
  sex: 'male',
  rankLimit: 'G級',
  weaponSlots: 1,
};

const result2 = solveSim(condition2, 5);
console.log(`Found ${result2.solutions.length} solutions in ${result2.durationMs.toFixed(2)}ms (checked ${result2.totalChecked} combos)`);
if (result2.solutions.length > 0) {
  const top = result2.solutions[0];
  console.log('Top solution:');
  console.log(`  Equip: ${top.head.name} / ${top.body.name} / ${top.arm.name} / ${top.waist.name} / ${top.leg.name}`);
  console.log(`  Defense: ${top.totalDefense}`);
  console.log(`  Active skills:`, top.activeSkills);
}
