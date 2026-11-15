import skillsData from '../data/skills.json';
import type {
  Armor,
  Decoration,
  Resistances,
  SimCondition,
  SimSolution,
  SkillTree,
} from '../types';
import { assignDecosToContainers } from './packing';

const allSkills = skillsData as unknown as Record<string, SkillTree>;

export function buildSolution(
  condition: SimCondition,
  head: Armor,
  body: Armor,
  arm: Armor,
  waist: Armor,
  leg: Armor,
  torsoMultiplier: number,
  torsoDecos: Decoration[],
  nonTorsoDecos: Decoration[]
): SimSolution {
  const armors = [head, body, arm, waist, leg];

  const containers = [
    { id: 'weapon', slots: condition.weaponSlots },
    { id: 'head', slots: head.torsoUp ? 0 : head.slots },
    { id: 'arm', slots: arm.torsoUp ? 0 : arm.slots },
    { id: 'waist', slots: waist.torsoUp ? 0 : waist.slots },
    { id: 'leg', slots: leg.torsoUp ? 0 : leg.slots },
  ];

  const assignedNonTorso = assignDecosToContainers(nonTorsoDecos, containers);

  const decos = {
    weapon: assignedNonTorso['weapon'] ?? [],
    head: assignedNonTorso['head'] ?? [],
    body: torsoDecos,
    arm: assignedNonTorso['arm'] ?? [],
    waist: assignedNonTorso['waist'] ?? [],
    leg: assignedNonTorso['leg'] ?? [],
  };

  const finalSkills: Record<string, number> = {};

  // Body skills & body decos multiplied by torsoMultiplier
  for (const [k, v] of Object.entries(body.skills)) {
    finalSkills[k] = (finalSkills[k] ?? 0) + v * torsoMultiplier;
  }
  for (const d of torsoDecos) {
    for (const [k, v] of Object.entries(d.skills)) {
      finalSkills[k] = (finalSkills[k] ?? 0) + v * torsoMultiplier;
    }
  }

  // Non-body armors & their decos
  const otherParts = [
    { a: head, d: decos.head },
    { a: arm, d: decos.arm },
    { a: waist, d: decos.waist },
    { a: leg, d: decos.leg },
  ];

  for (const { a, d } of otherParts) {
    if (!a.torsoUp) {
      for (const [k, v] of Object.entries(a.skills)) {
        finalSkills[k] = (finalSkills[k] ?? 0) + v;
      }
    }
    for (const deco of d) {
      for (const [k, v] of Object.entries(deco.skills)) {
        finalSkills[k] = (finalSkills[k] ?? 0) + v;
      }
    }
  }

  for (const d of decos.weapon) {
    for (const [k, v] of Object.entries(d.skills)) {
      finalSkills[k] = (finalSkills[k] ?? 0) + v;
    }
  }

  // Identify active skills
  const activeSkills: string[] = [];
  for (const [treeName, pts] of Object.entries(finalSkills)) {
    const tree = allSkills[treeName];
    if (!tree) continue;
    for (const s of tree.skills) {
      if (s.points > 0 && pts >= s.points) {
        activeSkills.push(s.name);
        break;
      } else if (s.points < 0 && pts <= s.points) {
        activeSkills.push(s.name);
        break;
      }
    }
  }

  const totalDefense = armors.reduce((sum, a) => sum + a.defense, 0);
  const resistances: Resistances = {
    fire: armors.reduce((sum, a) => sum + a.resistances.fire, 0),
    water: armors.reduce((sum, a) => sum + a.resistances.water, 0),
    thunder: armors.reduce((sum, a) => sum + a.resistances.thunder, 0),
    ice: armors.reduce((sum, a) => sum + a.resistances.ice, 0),
    dragon: armors.reduce((sum, a) => sum + a.resistances.dragon, 0),
  };

  const totalSlotsCapacity =
    condition.weaponSlots +
    (head.torsoUp ? 0 : head.slots) +
    body.slots +
    (arm.torsoUp ? 0 : arm.slots) +
    (waist.torsoUp ? 0 : waist.slots) +
    (leg.torsoUp ? 0 : leg.slots);

  const usedSlots =
    decos.weapon.reduce((s, d) => s + d.slots, 0) +
    decos.head.reduce((s, d) => s + d.slots, 0) +
    decos.body.reduce((s, d) => s + d.slots, 0) +
    decos.arm.reduce((s, d) => s + d.slots, 0) +
    decos.waist.reduce((s, d) => s + d.slots, 0) +
    decos.leg.reduce((s, d) => s + d.slots, 0);

  const totalRemaining = Math.max(0, totalSlotsCapacity - usedSlots);

  const remainingSlots = {
    slot1: 0,
    slot2: 0,
    slot3: 0,
    total: totalRemaining,
  };

  const extraActivations: { skillName: string; points: number; remainingPointsNeeded: number }[] = [];
  if (totalRemaining >= 1) {
    for (const [treeName, tree] of Object.entries(allSkills)) {
      if (tree.category === 'その他' || tree.category === 'オトモ系') continue;
      const curPts = finalSkills[treeName] ?? 0;
      for (const s of tree.skills) {
        if (s.points > curPts && s.points <= curPts + totalRemaining * 2) {
          const diff = s.points - curPts;
          extraActivations.push({
            skillName: s.name,
            points: curPts,
            remainingPointsNeeded: diff,
          });
          break;
        }
      }
    }
  }

  extraActivations.sort((a, b) => a.remainingPointsNeeded - b.remainingPointsNeeded);

  return {
    head,
    body,
    arm,
    waist,
    leg,
    decorations: decos,
    totalDefense,
    resistances,
    torsoMultiplier,
    finalSkills,
    activeSkills,
    remainingSlots,
    extraActivations: extraActivations.slice(0, 5),
  };
}
