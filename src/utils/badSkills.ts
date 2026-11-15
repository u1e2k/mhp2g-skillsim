import skillsData from '../data/skills.json';
import decosData from '../data/decorations.json';
import type { SkillTree, Decoration, SimSolution } from '../types';

const allSkills = skillsData as unknown as Record<string, SkillTree>;
const allDecos = decosData as unknown as Decoration[];

export interface BadSkillCountermeasure {
  skillName: string;
  treeName: string;
  currentPoints: number;
  pointsNeeded: number; // e.g. +1
  counterDeco: Decoration | null;
  decosNeeded: number;
  slotsRequired: number;
  canCancelWithRemainingSlots: boolean;
}

export function detectBadSkillsAndCounters(solution: SimSolution): BadSkillCountermeasure[] {
  const results: BadSkillCountermeasure[] = [];

  for (const [treeName, currentPoints] of Object.entries(solution.finalSkills)) {
    const tree = allSkills[treeName];
    if (!tree) continue;

    // Check if a negative skill is triggered
    const activeNegative = tree.skills.find((s) => s.points < 0 && currentPoints <= s.points);
    if (!activeNegative) continue;

    // Target threshold to negate the bad skill (points needed to become > activeNegative.points)
    const threshold = activeNegative.points + 1; // e.g. -10 -> -9
    const pointsNeeded = threshold - currentPoints; // e.g. -9 - (-10) = 1

    if (pointsNeeded <= 0) continue;

    // Find the best decoration that gives positive points for this tree with lowest slots
    const suitableDecos = allDecos
      .filter((d) => (d.skills[treeName] ?? 0) > 0)
      .sort((a, b) => {
        // Prefer smaller slot first, then higher points
        if (a.slots !== b.slots) return a.slots - b.slots;
        return (b.skills[treeName] ?? 0) - (a.skills[treeName] ?? 0);
      });

    const bestDeco = suitableDecos[0] ?? null;

    if (bestDeco) {
      const ptsPerDeco = bestDeco.skills[treeName] ?? 1;
      const decosNeeded = Math.ceil(pointsNeeded / ptsPerDeco);
      const slotsRequired = decosNeeded * bestDeco.slots;
      const canCancelWithRemainingSlots = solution.remainingSlots.total >= slotsRequired;

      results.push({
        skillName: activeNegative.name,
        treeName,
        currentPoints,
        pointsNeeded,
        counterDeco: bestDeco,
        decosNeeded,
        slotsRequired,
        canCancelWithRemainingSlots,
      });
    } else {
      results.push({
        skillName: activeNegative.name,
        treeName,
        currentPoints,
        pointsNeeded,
        counterDeco: null,
        decosNeeded: 0,
        slotsRequired: 0,
        canCancelWithRemainingSlots: false,
      });
    }
  }

  return results;
}
