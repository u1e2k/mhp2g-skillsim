import type { SkillTree } from '../types';

export interface SkillPreset {
  name: string;
  description: string;
  type: 'blade' | 'gunner';
  weaponSlots: number;
  skills: Record<string, number>;
}

export const POPULAR_PRESETS: SkillPreset[] = [
  {
    name: '抜刀アーティ (大剣王道)',
    description: '角王剣アーティラート用。抜刀術・斬れ味+1・集中',
    type: 'blade',
    weaponSlots: 0,
    skills: {
      '匠': 10,
      '抜刀': 10,
      '溜め短縮': 10,
    },
  },
  {
    name: '真・名刀テンプレ (太刀/ハンマー)',
    description: '斬れ味レベル+1・業物・見切り+1',
    type: 'blade',
    weaponSlots: 1,
    skills: {
      '匠': 10,
      '斬れ味': 10,
      '達人': 10,
    },
  },
  {
    name: '高耳・匠・砥石高速 (汎用剣士)',
    description: '高級耳栓・斬れ味レベル+1・砥石使用高速化',
    type: 'blade',
    weaponSlots: 0,
    skills: {
      '聴覚保護': 15,
      '匠': 10,
      '研ぎ師': 10,
    },
  },
  {
    name: '自動装填ラオ砲 (ヘビィボウガン)',
    description: '老山龍砲・極用。自動装填・通常弾威力UP・属性攻撃強化',
    type: 'gunner',
    weaponSlots: 1,
    skills: {
      '自動装填': 10,
      '通常弾強化': 10,
      '属性攻撃': 10,
    },
  },
  {
    name: '回避ランス (ランス/ガンス)',
    description: '回避性能+2・回避距離UP・斬れ味レベル+1',
    type: 'blade',
    weaponSlots: 0,
    skills: {
      '回避性能': 15,
      '回避距離': 10,
      '匠': 10,
    },
  },
];

// Helper to normalize search query (hiragana, katakana, romaji)
export function normalizeSearchString(str: string): string {
  return str
    .toLowerCase()
    .replace(/[\u30a1-\u30f6]/g, (m) => String.fromCharCode(m.charCodeAt(0) - 0x60)) // katakana to hiragana
    .trim();
}

// Check if skill tree or any of its activated skills match query
export function matchSkillTree(tree: SkillTree, query: string): boolean {
  if (!query) return true;
  const q = normalizeSearchString(query);

  const treeName = normalizeSearchString(tree.name);
  if (treeName.includes(q)) return true;

  // Check activated skill names
  for (const s of tree.skills) {
    const actName = normalizeSearchString(s.name);
    if (actName.includes(q)) return true;
  }

  // Common aliases
  const aliasMap: Record<string, string[]> = {
    '匠': ['たくみ', 'takumi', 'きれあじ', '斬れ味レベル+1', '切れ味'],
    '斬れ味': ['わざもの', 'wazamono', 'なまくら', '業物'],
    '抜刀': ['ばっとう', 'battou', '抜刀術', 'ばっとうじゅつ'],
    '溜め短縮': ['しゅうちゅう', 'syuutyuu', 'syuchu', '集中', 'ためたんしゅく'],
    '聴覚保護': ['みみせん', 'mimisen', '耳栓', 'こうきゅうみみせん', '高級耳栓'],
    '達人': ['みきり', 'mikiri', '見切り'],
    '研ぎ師': ['といし', 'toisi', 'といしこうそく', '高速砥石'],
    '自動装填': ['じどうそうてん', 'jidou', 'オートリロード'],
    '通常弾強化': ['つうじょうだん', 'tuujyou'],
    '貫通弾強化': ['かんつうだん', 'kantuu'],
    '散弾強化': ['さんだん', 'sandan'],
    '根性': ['こんじょう', 'konjyou', 'ド根性'],
  };

  for (const [key, aliases] of Object.entries(aliasMap)) {
    if (tree.name.includes(key) || key.includes(tree.name)) {
      if (aliases.some((a) => normalizeSearchString(a).includes(q) || q.includes(normalizeSearchString(a)))) {
        return true;
      }
    }
  }

  return false;
}
