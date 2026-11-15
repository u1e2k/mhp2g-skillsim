import type { Armor, Decoration } from '../types';

export interface EquivalenceClass {
  torsoUp: boolean;
  slots: number;
  skills: Record<string, number>;
  armors: Armor[];
  bestArmor: Armor;
}

export interface TorsoDecoOption {
  decoList: Decoration[];
  skills: Record<string, number>;
  slotsUsed: number;
}
