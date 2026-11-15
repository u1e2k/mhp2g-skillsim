export type ArmorPart = 'head' | 'body' | 'arm' | 'waist' | 'leg';
export type HunterType = 'blade' | 'gunner' | 'both';
export type Sex = 'male' | 'female' | 'all';
export type Rank = '下位' | '上位' | 'G級';

export interface ActivatedSkill {
  points: number;
  name: string;
  description: string;
}

export interface SkillTree {
  id: string;
  name: string;
  category: string;
  skills: ActivatedSkill[];
}

export interface Decoration {
  id: string;
  name: string;
  slots: number;
  skills: Record<string, number>;
  rank: Rank;
}

export interface Resistances {
  fire: number;
  water: number;
  thunder: number;
  ice: number;
  dragon: number;
}

export interface Armor {
  id: string;
  name: string;
  part: ArmorPart;
  hunterType: HunterType;
  sex: Sex;
  defense: number;
  resistances: Resistances;
  slots: number;
  torsoUp: boolean;
  skills: Record<string, number>;
  rank: Rank;
}

export interface DecoAssignment {
  decoration: Decoration;
  count: number;
  location?: 'weapon' | 'head' | 'body' | 'arm' | 'waist' | 'leg';
}

export interface SimCondition {
  targetSkills: Record<string, number>; // skillTreeId -> minPoints
  hunterType: 'blade' | 'gunner';
  sex: 'male' | 'female';
  rankLimit: '下位' | '上位' | 'G級';
  weaponSlots: number; // 0..3
  pinnedArmors?: Partial<Record<ArmorPart, string>>; // part -> armorId
  excludedArmors?: string[]; // armorId[]
}

export interface SimSolution {
  head: Armor;
  body: Armor;
  arm: Armor;
  waist: Armor;
  leg: Armor;
  decorations: {
    weapon: Decoration[];
    head: Decoration[];
    body: Decoration[];
    arm: Decoration[];
    waist: Decoration[];
    leg: Decoration[];
  };
  totalDefense: number;
  resistances: Resistances;
  torsoMultiplier: number;
  finalSkills: Record<string, number>;
  activeSkills: string[];
  remainingSlots: {
    slot1: number;
    slot2: number;
    slot3: number;
    total: number;
  };
  extraActivations?: { skillName: string; points: number; remainingPointsNeeded: number }[];
}

export interface WorkerMessageRequest {
  type: 'SIMULATE';
  condition: SimCondition;
  maxResults?: number;
}

export interface WorkerMessageResponse {
  type: 'PROGRESS' | 'DONE' | 'ERROR';
  progress?: number;
  solutions?: SimSolution[];
  error?: string;
  durationMs?: number;
  totalCombinationsChecked?: number;
}
