import type { Decoration } from '../types';

/**
 * Check if (d1, d2, d3) decorations can be packed into (c1, c2, c3) slot containers
 */
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

/**
 * Find actual assignment of decorations into slot containers
 */
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

/**
 * Solve fitting needed skill points into (c1, c2, c3)
 */
export function solveDecoFitting(
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
