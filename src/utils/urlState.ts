import type { SimCondition } from '../types';

export function serializeConditionToUrl(condition: SimCondition): string {
  const params = new URLSearchParams();
  params.set('type', condition.hunterType);
  params.set('sex', condition.sex);
  params.set('rank', condition.rankLimit);
  params.set('wslot', condition.weaponSlots.toString());

  const skillEntries = Object.entries(condition.targetSkills);
  if (skillEntries.length > 0) {
    // format: tree:pts,tree:pts
    const str = skillEntries.map(([t, p]) => `${encodeURIComponent(t)}:${p}`).join(',');
    params.set('skills', str);
  }

  return `${window.location.pathname}?${params.toString()}`;
}

export function parseConditionFromUrl(): Partial<SimCondition> | null {
  try {
    const params = new URLSearchParams(window.location.search);
    if (!params.has('type') && !params.has('skills')) return null;

    const condition: Partial<SimCondition> = {};

    const type = params.get('type');
    if (type === 'blade' || type === 'gunner') condition.hunterType = type;

    const sex = params.get('sex');
    if (sex === 'male' || sex === 'female') condition.sex = sex;

    const rank = params.get('rank');
    if (rank === '下位' || rank === '上位' || rank === 'G級') condition.rankLimit = rank;

    const wslot = params.get('wslot');
    if (wslot !== null) {
      const n = parseInt(wslot, 10);
      if (!isNaN(n) && n >= 0 && n <= 3) condition.weaponSlots = n;
    }

    const skillsStr = params.get('skills');
    if (skillsStr) {
      const targetSkills: Record<string, number> = {};
      const pairs = skillsStr.split(',');
      for (const pair of pairs) {
        const [rawTree, rawPts] = pair.split(':');
        if (rawTree && rawPts) {
          const tree = decodeURIComponent(rawTree);
          const pts = parseInt(rawPts, 10);
          if (!isNaN(pts)) {
            targetSkills[tree] = pts;
          }
        }
      }
      condition.targetSkills = targetSkills;
    }

    return condition;
  } catch {
    return null;
  }
}
