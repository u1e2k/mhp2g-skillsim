import decorationsData from '../data/decorations.json';
import armorsData from '../data/armors.json';
import type {
  Armor,
  ArmorPart,
  Decoration,
  SimCondition,
  SimSolution,
} from '../types';
import type { EquivalenceClass, TorsoDecoOption } from './types';
import { solveDecoFitting } from './packing';
import { buildSolution } from './builder';

export { canPackDecos, assignDecosToContainers, solveDecoFitting } from './packing';
export { buildSolution } from './builder';

const allDecorations = decorationsData as unknown as Decoration[];
const allArmors = armorsData as unknown as Armor[];

export function solveSim(
  condition: SimCondition,
  maxResults = 100
): { solutions: SimSolution[]; totalChecked: number; durationMs: number } {
  const startTime = performance.now();
  const targetSkills = condition.targetSkills;
  const targetTrees = Object.keys(targetSkills);

  if (targetTrees.length === 0) {
    return { solutions: [], totalChecked: 0, durationMs: 0 };
  }

  const rankOrder: Record<string, number> = { '下位': 1, '上位': 2, 'G級': 3 };
  const maxRankVal = rankOrder[condition.rankLimit] ?? 3;

  // 1. Filter relevant decorations
  const relevantDecos = allDecorations.filter((d) => {
    if ((rankOrder[d.rank] ?? 1) > maxRankVal) return false;
    return targetTrees.some((tree) => (d.skills[tree] ?? 0) > 0);
  });

  // Pre-index decos for target trees
  const decosByTree = new Map<string, Decoration[]>();
  const maxDecoPtsPerTree = new Map<string, number>();
  for (const tree of targetTrees) {
    const list = relevantDecos.filter((d) => (d.skills[tree] ?? 0) > 0);
    decosByTree.set(tree, list);
    let maxPt = 0;
    for (const d of list) {
      maxPt = Math.max(maxPt, d.skills[tree] ?? 0);
    }
    maxDecoPtsPerTree.set(tree, maxPt);
  }

  // 2. Filter & compress armors into equivalence classes per part
  const parts: ArmorPart[] = ['body', 'head', 'arm', 'waist', 'leg'];
  const equivClasses: Record<ArmorPart, EquivalenceClass[]> = {
    head: [],
    body: [],
    arm: [],
    waist: [],
    leg: [],
  };

  const excludedSet = new Set(condition.excludedArmors ?? []);

  for (const part of parts) {
    const pinnedId = condition.pinnedArmors?.[part];
    const armorsOfPart = allArmors.filter((a) => {
      if (a.part !== part) return false;
      if (pinnedId && a.id !== pinnedId) return false;
      if (excludedSet.has(a.id)) return false;
      if ((rankOrder[a.rank] ?? 1) > maxRankVal) return false;
      if (a.hunterType !== 'both' && a.hunterType !== condition.hunterType) return false;
      if (a.sex !== 'all' && a.sex !== condition.sex) return false;
      return true;
    });

    const groups = new Map<string, EquivalenceClass>();

    for (const a of armorsOfPart) {
      const skillVals = targetTrees.map((t) => a.skills[t] ?? 0).join(',');
      const key = `${a.torsoUp ? 1 : 0}_${a.slots}_${skillVals}`;

      let group = groups.get(key);
      if (!group) {
        const skillsObj: Record<string, number> = {};
        for (const t of targetTrees) {
          skillsObj[t] = a.skills[t] ?? 0;
        }
        group = {
          torsoUp: a.torsoUp,
          slots: a.slots,
          skills: skillsObj,
          armors: [],
          bestArmor: a,
        };
        groups.set(key, group);
      }
      group.armors.push(a);
      if (a.defense > group.bestArmor.defense) {
        group.bestArmor = a;
      }
    }

    for (const group of groups.values()) {
      group.armors.sort((a, b) => b.defense - a.defense);
      equivClasses[part].push(group);
    }
  }

  // Upper bound calculations for branch & bound
  const partMaxPts: Record<ArmorPart, Record<string, number>> = {
    head: {}, body: {}, arm: {}, waist: {}, leg: {}
  };
  for (const part of parts) {
    for (const tree of targetTrees) {
      let maxBase = 0;
      for (const g of equivClasses[part]) {
        maxBase = Math.max(maxBase, g.skills[tree] ?? 0);
      }
      const decoPt = maxDecoPtsPerTree.get(tree) ?? 0;
      partMaxPts[part][tree] = maxBase + decoPt;
    }
  }

  const maxTorsoMultiplier = 5;
  const solutions: SimSolution[] = [];
  let totalChecked = 0;

  // Precompute torso deco options
  const getTorsoDecoOptions = (bodySlots: number): TorsoDecoOption[] => {
    const opts: TorsoDecoOption[] = [
      { decoList: [], skills: {}, slotsUsed: 0 },
    ];
    if (bodySlots >= 1) {
      for (const d of relevantDecos) {
        if (d.slots === 1) opts.push({ decoList: [d], skills: d.skills, slotsUsed: 1 });
      }
    }
    if (bodySlots >= 2) {
      for (const d of relevantDecos) {
        if (d.slots === 2) opts.push({ decoList: [d], skills: d.skills, slotsUsed: 2 });
      }
    }
    if (bodySlots >= 3) {
      for (const d of relevantDecos) {
        if (d.slots === 3) opts.push({ decoList: [d], skills: d.skills, slotsUsed: 3 });
      }
    }
    return opts;
  };

  const weaponMaxDecoPts: Record<string, number> = {};
  for (const tree of targetTrees) {
    if (condition.weaponSlots > 0) {
      let maxPt = 0;
      for (const d of decosByTree.get(tree) ?? []) {
        if (d.slots <= condition.weaponSlots) {
          maxPt = Math.max(maxPt, d.skills[tree] ?? 0);
        }
      }
      weaponMaxDecoPts[tree] = maxPt;
    } else {
      weaponMaxDecoPts[tree] = 0;
    }
  }

  const maxRemAfterHead: Record<string, number> = {};
  const maxRemAfterArm: Record<string, number> = {};
  const maxRemAfterWaist: Record<string, number> = {};

  for (const tree of targetTrees) {
    const wPt = weaponMaxDecoPts[tree];
    const lPt = partMaxPts.leg[tree];
    const wtPt = partMaxPts.waist[tree];
    const aPt = partMaxPts.arm[tree];

    maxRemAfterWaist[tree] = lPt + wPt;
    maxRemAfterArm[tree] = wtPt + maxRemAfterWaist[tree];
    maxRemAfterHead[tree] = aPt + maxRemAfterArm[tree];
  }

  const bodyGroups = equivClasses.body;
  const headGroups = equivClasses.head;
  const armGroups = equivClasses.arm;
  const waistGroups = equivClasses.waist;
  const legGroups = equivClasses.leg;

  // Search loop with Upper-Bound Pruning
  for (const b of bodyGroups) {
    const torsoDecoOpts = getTorsoDecoOptions(b.slots);

    for (const h of headGroups) {
      const hMult = h.torsoUp ? 1 : 0;
      const hSkills = h.torsoUp ? {} : h.skills;
      const hSlots = h.torsoUp ? 0 : h.slots;

      // Prune after head
      let canSatisfyHead = true;
      for (const tree of targetTrees) {
        const maxBodyContribution = Math.max(b.skills[tree] ?? 0, 0) * maxTorsoMultiplier;
        const maxPossible = maxBodyContribution + (hSkills[tree] ?? 0) + maxRemAfterHead[tree] + 16;
        if (maxPossible < targetSkills[tree]) {
          canSatisfyHead = false;
          break;
        }
      }
      if (!canSatisfyHead) continue;

      for (const a of armGroups) {
        const aMult = a.torsoUp ? 1 : 0;
        const aSkills = a.torsoUp ? {} : a.skills;
        const aSlots = a.torsoUp ? 0 : a.slots;

        // Prune after arm
        let canSatisfyArm = true;
        for (const tree of targetTrees) {
          const maxBodyContribution = Math.max(b.skills[tree] ?? 0, 0) * maxTorsoMultiplier;
          const maxPossible = maxBodyContribution + (hSkills[tree] ?? 0) + (aSkills[tree] ?? 0) + maxRemAfterArm[tree] + 16;
          if (maxPossible < targetSkills[tree]) {
            canSatisfyArm = false;
            break;
          }
        }
        if (!canSatisfyArm) continue;

        for (const w of waistGroups) {
          const wMult = w.torsoUp ? 1 : 0;
          const wSkills = w.torsoUp ? {} : w.skills;
          const wSlots = w.torsoUp ? 0 : w.slots;

          // Prune after waist
          let canSatisfyWaist = true;
          for (const tree of targetTrees) {
            const maxBodyContribution = Math.max(b.skills[tree] ?? 0, 0) * maxTorsoMultiplier;
            const maxPossible = maxBodyContribution + (hSkills[tree] ?? 0) + (aSkills[tree] ?? 0) + (wSkills[tree] ?? 0) + maxRemAfterWaist[tree] + 16;
            if (maxPossible < targetSkills[tree]) {
              canSatisfyWaist = false;
              break;
            }
          }
          if (!canSatisfyWaist) continue;

          for (const l of legGroups) {
            const lMult = l.torsoUp ? 1 : 0;
            const lSkills = l.torsoUp ? {} : l.skills;
            const lSlots = l.torsoUp ? 0 : l.slots;

            totalChecked++;
            const mult = 1 + hMult + aMult + wMult + lMult;

            const c1 = (condition.weaponSlots === 1 ? 1 : 0) + (hSlots === 1 ? 1 : 0) + (aSlots === 1 ? 1 : 0) + (wSlots === 1 ? 1 : 0) + (lSlots === 1 ? 1 : 0);
            const c2 = (condition.weaponSlots === 2 ? 1 : 0) + (hSlots === 2 ? 1 : 0) + (aSlots === 2 ? 1 : 0) + (wSlots === 2 ? 1 : 0) + (lSlots === 2 ? 1 : 0);
            const c3 = (condition.weaponSlots === 3 ? 1 : 0) + (hSlots === 3 ? 1 : 0) + (aSlots === 3 ? 1 : 0) + (wSlots === 3 ? 1 : 0) + (lSlots === 3 ? 1 : 0);

            const basePts: Record<string, number> = {};
            for (const tree of targetTrees) {
              basePts[tree] =
                (b.skills[tree] ?? 0) * mult +
                (hSkills[tree] ?? 0) +
                (aSkills[tree] ?? 0) +
                (wSkills[tree] ?? 0) +
                (lSkills[tree] ?? 0);
            }

            let canPossiblySatisfy = true;
            for (const tree of targetTrees) {
              const maxFromSlots = (c1 + c2 + c3) * (maxDecoPtsPerTree.get(tree) ?? 0);
              const maxTorsoDecoBonus = (b.slots > 0 ? (maxDecoPtsPerTree.get(tree) ?? 0) * mult : 0);
              if (basePts[tree] + maxFromSlots + maxTorsoDecoBonus < targetSkills[tree]) {
                canPossiblySatisfy = false;
                break;
              }
            }
            if (!canPossiblySatisfy) continue;

            for (const tOpt of torsoDecoOpts) {
              const currentTotal: Record<string, number> = {};
              for (const tree of targetTrees) {
                currentTotal[tree] = basePts[tree] + (tOpt.skills[tree] ?? 0) * mult;
              }

              const needed: Record<string, number> = {};
              let hasNeeded = false;
              for (const tree of targetTrees) {
                const req = Math.max(0, targetSkills[tree] - currentTotal[tree]);
                if (req > 0) {
                  needed[tree] = req;
                  hasNeeded = true;
                }
              }

              let packedDecos: Decoration[] | null = null;
              if (!hasNeeded) {
                packedDecos = [];
              } else {
                packedDecos = solveDecoFitting(needed, c1, c2, c3, decosByTree);
              }

              if (packedDecos !== null) {
                const solution = buildSolution(
                  condition,
                  h.bestArmor,
                  b.bestArmor,
                  a.bestArmor,
                  w.bestArmor,
                  l.bestArmor,
                  mult,
                  tOpt.decoList,
                  packedDecos
                );

                solutions.push(solution);
                if (solutions.length >= maxResults) {
                  const durationMs = performance.now() - startTime;
                  return { solutions, totalChecked, durationMs };
                }
                break;
              }
            }
          }
        }
      }
    }
  }

  solutions.sort((a, b) => b.totalDefense - a.totalDefense);
  const durationMs = performance.now() - startTime;
  return { solutions, totalChecked, durationMs };
}
