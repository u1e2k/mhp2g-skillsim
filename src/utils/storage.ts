import type { SimCondition, SimSolution } from '../types';

export interface FavoriteItem {
  id: string;
  name: string;
  createdAt: number;
  condition: SimCondition;
  solution: SimSolution;
}

const STORAGE_KEY = 'mhp2g_sim_favorites_v1';

export function getFavorites(): FavoriteItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load favorites from localStorage', err);
    return [];
  }
}

export function saveFavorite(solution: SimSolution, condition: SimCondition, customName?: string): FavoriteItem {
  const favorites = getFavorites();
  const name = customName || `${solution.activeSkills.slice(0, 3).join('・')}構成 (防${solution.totalDefense})`;
  const newItem: FavoriteItem = {
    id: `fav_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name,
    createdAt: Date.now(),
    condition,
    solution,
  };

  const updated = [newItem, ...favorites];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newItem;
}

export function removeFavorite(id: string): void {
  const favorites = getFavorites();
  const filtered = favorites.filter((f) => f.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function isSolutionFavorited(solution: SimSolution, favorites: FavoriteItem[]): boolean {
  return favorites.some(
    (f) =>
      f.solution.head.id === solution.head.id &&
      f.solution.body.id === solution.body.id &&
      f.solution.arm.id === solution.arm.id &&
      f.solution.waist.id === solution.waist.id &&
      f.solution.leg.id === solution.leg.id &&
      JSON.stringify(f.solution.decorations) === JSON.stringify(solution.decorations)
  );
}
