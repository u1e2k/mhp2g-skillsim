import skillsData from '../data/skills.json';
import decorationsData from '../data/decorations.json';
import armorsData from '../data/armors.json';
import type {
  Armor,
  ArmorPart,
  Decoration,
  SimCondition,
  SimSolution,
  SkillTree,
  Resistances
} from '../types';

const allSkills = skillsData as unknown as Record<string, SkillTree>;
const allDecorations = decorationsData as unknown as Decoration[];
const allArmors = armorsData as unknown as Armor[];

interface EquivalenceClass {
  torsoUp: boolean;
  slots: number;
  skills: Record<string, number>;
  armors: Armor[];
  bestArmor: Armor;
}

// Check if (d1, d2, d3) decos can be packed into (c1, c2, c3) slots
export function canPackDecos(
  d1: number,
  d2: number,
  d3: number,
  c1: number,
  c2: number,
  c3: number
): boolean {
  if (d3 > c3) return false;
  const remC3 = c3 - d3;
  if (d2 <= c2) {
    const remC2 = c2 - d2;
    const avail1 = c1 + remC2 * 2 + remC3 * 3;
    return d1 <= avail1;
  } else {
    const overflow2 = d2 - c2;
    if (overflow2 > remC3) return false;
    const remC3After2 = remC3 - overflow2;
    const avail1 = c1 + overflow2 * 1 + remC3After2 * 3;
    return d1 <= avail1;
  }
}

// Find actual assignment of decorations into slots
export function assignDecosToContainers(
  decosToPack: Decoration[],
  containers: { id: string; slots: number }[]
): Record<string, Decoration[]> {
  const result: Record<string, Decoration[]> = {};
  for (const c of containers) {
    result[c.id] = [];
  }

  const sortedContainers = [...containers].sort((a, b) => b.slots - a.slots);
  const sortedDecos = [...decosToPack].sort((a, b) => b.slots - a.slots);

  const containerRemaining = new Map<string, number>();
  for (const c of containers) {
    containerRemaining.set(c.id, c.slots);
  }

  for (const deco of sortedDecos) {
    let bestContainerId: string | null = null;
    let minCapacity = 999;

    for (const c of sortedContainers) {
      const rem = containerRemaining.get(c.id) ?? 0;
      if (rem >= deco.slots && rem < minCapacity) {
        minCapacity = rem;
        bestContainerId = c.id;
      }
    }

    if (bestContainerId) {
      result[bestContainerId].push(deco);
      const cur = containerRemaining.get(bestContainerId) ?? 0;
      containerRemaining.set(bestContainerId, cur - deco.slots);
    }
  }

  return result;
}

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
  const parts: ArmorPart[] = ['body', 'head', 'arm', 'waist', 'leg']; // Put body first for torso up multiplier
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

  // Calculate maximum possible points from each part for pruning (Upper Bounds)
  // Max possible contribution from a part = max(gear points + maxDecoPts)
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

  // Torso max pts assuming torso up could multiply body
  // Maximum torso multiplier is 5 (body + 4 torsoUp parts)
  const maxTorsoMultiplier = 5;

  const solutions: SimSolution[] = [];
  let totalChecked = 0;

  // Precompute torso deco options
  const getTorsoDecoOptions = (bodySlots: number) => {
    const opts: { decoList: Decoration[]; skills: Record<string, number>; slotsUsed: number }[] = [
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

  // Precompute weapon slot max deco pts
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

  // Pre-calculate cumulative max remaining points:
  // After picking body, max remaining from [head, arm, waist, leg] + weapon
  const maxRemAfterBody: Record<string, number> = {};
  const maxRemAfterHead: Record<string, number> = {};
  const maxRemAfterArm: Record<string, number> = {};
  const maxRemAfterWaist: Record<string, number> = {};

  for (const tree of targetTrees) {
    const wPt = weaponMaxDecoPts[tree];
    const lPt = partMaxPts.leg[tree];
    const wtPt = partMaxPts.waist[tree];
    const aPt = partMaxPts.arm[tree];
    const hPt = partMaxPts.head[tree];

    maxRemAfterWaist[tree] = lPt + wPt;
    maxRemAfterArm[tree] = wtPt + maxRemAfterWaist[tree];
    maxRemAfterHead[tree] = aPt + maxRemAfterArm[tree];
    maxRemAfterBody[tree] = hPt + maxRemAfterHead[tree];
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

      // PRUNING CHECK AFTER HEAD
      let canSatisfyHead = true;
      for (const tree of targetTrees) {
        // Even with max multiplier (up to 4 more) on body:
        const maxBodyContribution = Math.max(b.skills[tree] ?? 0, 0) * maxTorsoMultiplier;
        const maxPossible = maxBodyContribution + (hSkills[tree] ?? 0) + maxRemAfterHead[tree] + 4 * 4;
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

        // PRUNING CHECK AFTER ARM
        let canSatisfyArm = true;
        for (const tree of targetTrees) {
          const maxBodyContribution = Math.max(b.skills[tree] ?? 0, 0) * maxTorsoMultiplier;
          const maxPossible = maxBodyContribution + (hSkills[tree] ?? 0) + (aSkills[tree] ?? 0) + maxRemAfterArm[tree] + 4 * 4;
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

          // PRUNING CHECK AFTER WAIST
          let canSatisfyWaist = true;
          for (const tree of targetTrees) {
            const maxBodyContribution = Math.max(b.skills[tree] ?? 0, 0) * maxTorsoMultiplier;
            const maxPossible = maxBodyContribution + (hSkills[tree] ?? 0) + (aSkills[tree] ?? 0) + (wSkills[tree] ?? 0) + maxRemAfterWaist[tree] + 4 * 4;
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

            // Non-torso slot counts
            let c1 = (condition.weaponSlots === 1 ? 1 : 0) + (hSlots === 1 ? 1 : 0) + (aSlots === 1 ? 1 : 0) + (wSlots === 1 ? 1 : 0) + (lSlots === 1 ? 1 : 0);
            let c2 = (condition.weaponSlots === 2 ? 1 : 0) + (hSlots === 2 ? 1 : 0) + (aSlots === 2 ? 1 : 0) + (wSlots === 2 ? 1 : 0) + (lSlots === 2 ? 1 : 0);
            let c3 = (condition.weaponSlots === 3 ? 1 : 0) + (hSlots === 3 ? 1 : 0) + (aSlots === 3 ? 1 : 0) + (wSlots === 3 ? 1 : 0) + (lSlots === 3 ? 1 : 0);

            // Base gear skills
            const basePts: Record<string, number> = {};
            for (const tree of targetTrees) {
              basePts[tree] =
                (b.skills[tree] ?? 0) * mult +
                (hSkills[tree] ?? 0) +
                (aSkills[tree] ?? 0) +
                (wSkills[tree] ?? 0) +
                (lSkills[tree] ?? 0);
            }

            // Quick check: can non-torso slots (at absolute best) satisfy the deficit?
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

            // Try torso deco options
            for (const tOpt of torsoDecoOpts) {
              const currentTotal: Record<string, number> = {};
              for (const tree of targetTrees) {
                currentTotal[tree] = basePts[tree] + (tOpt.skills[tree] ?? 0) * mult;
              }

              // Needed skill points from non-torso slots
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

function solveDecoFitting(
  needed: Record<string, number>,
  c1: number,
  c2: number,
  c3: number,
  decosByTree: Map<string, Decoration[]>
): Decoration[] | null {
  const neededTrees = Object.keys(needed);
  if (neededTrees.length === 0) return [];

  const treeCandidates: Decoration[][] = [];

  for (const tree of neededTrees) {
    const ptsReq = needed[tree];
    const decos = decosByTree.get(tree) ?? [];
    if (decos.length === 0) return null;

    const validCombos: Decoration[][] = [];
    findDecoCombosForTree(tree, ptsReq, decos, [], 0, 0, 5, validCombos);
    if (validCombos.length === 0) return null;

    validCombos.sort((a, b) => {
      const slotsA = a.reduce((sum, d) => sum + d.slots, 0);
      const slotsB = b.reduce((sum, d) => sum + d.slots, 0);
      return slotsA - slotsB;
    });

    treeCandidates.push(validCombos[0]);
  }

  const allDecos = treeCandidates.flat();
  let d1 = 0,
    d2 = 0,
    d3 = 0;
  for (const d of allDecos) {
    if (d.slots === 1) d1++;
    else if (d.slots === 2) d2++;
    else if (d.slots === 3) d3++;
  }

  if (canPackDecos(d1, d2, d3, c1, c2, c3)) {
    return allDecos;
  }

  return null;
}

function findDecoCombosForTree(
  tree: string,
  neededPts: number,
  decos: Decoration[],
  currentCombo: Decoration[],
  currentPts: number,
  decoIdx: number,
  maxCount: number,
  results: Decoration[][]
) {
  if (currentPts >= neededPts) {
    results.push([...currentCombo]);
    return;
  }
  if (currentCombo.length >= maxCount) return;

  for (let i = decoIdx; i < decos.length; i++) {
    const d = decos[i];
    const pts = d.skills[tree] ?? 0;
    if (pts <= 0) continue;

    currentCombo.push(d);
    findDecoCombosForTree(
      tree,
      neededPts,
      decos,
      currentCombo,
      currentPts + pts,
      i,
      maxCount,
      results
    );
    currentCombo.pop();
  }
}

function buildSolution(
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

  for (const [k, v] of Object.entries(body.skills)) {
    finalSkills[k] = (finalSkills[k] ?? 0) + v * torsoMultiplier;
  }
  for (const d of torsoDecos) {
    for (const [k, v] of Object.entries(d.skills)) {
      finalSkills[k] = (finalSkills[k] ?? 0) + v * torsoMultiplier;
    }
  }

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
