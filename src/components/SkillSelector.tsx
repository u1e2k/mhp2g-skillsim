import React, { useState, useEffect, useMemo } from 'react';
import skillsData from '../data/skills.json';
import type { SkillTree, HunterType } from '../types';
import { matchSkillTree } from '../utils/skillSearch';
import { Search, Plus, X, Check, Sparkles } from 'lucide-react';

const allSkillsMap = skillsData as unknown as Record<string, SkillTree>;
const allSkillTrees = Object.values(allSkillsMap);

const BLADE_QUICK_SKILLS = [
  { tree: '匠', label: '斬れ味レベル+1 (+10)', points: 10 },
  { tree: '抜刀', label: '抜刀術 (+10)', points: 10 },
  { tree: '溜め短縮', label: '集中 (+10)', points: 10 },
  { tree: '斬れ味', label: '業物 (+10)', points: 10 },
  { tree: '聴覚保護', label: '高級耳栓 (+15)', points: 15 },
  { tree: '達人', label: '見切り+2 (+15)', points: 15 },
  { tree: '攻撃', label: '攻撃力UP【大】 (+20)', points: 20 },
  { tree: '研ぎ師', label: '砥石使用高速化 (+10)', points: 10 },
  { tree: '回避性能', label: '回避性能+2 (+15)', points: 15 },
  { tree: 'ガード性能', label: 'ガード性能+1 (+10)', points: 10 },
];

const GUNNER_QUICK_SKILLS = [
  { tree: '通常弾強化', label: '通常弾・連射矢威力UP (+10)', points: 10 },
  { tree: '貫通弾強化', label: '貫通弾・貫通矢威力UP (+10)', points: 10 },
  { tree: '散弾強化', label: '散弾・拡散矢威力UP (+10)', points: 10 },
  { tree: '自動装填', label: '自動装填 (+10)', points: 10 },
  { tree: '装填数', label: '装填数UP (+10)', points: 10 },
  { tree: '反動', label: '反動軽減+2 (+15)', points: 15 },
  { tree: '装填', label: '装填速度+2 (+15)', points: 15 },
  { tree: '属性攻撃', label: '属性攻撃強化 (+10)', points: 10 },
  { tree: '聴覚保護', label: '高級耳栓 (+15)', points: 15 },
  { tree: '弾調合', label: '最大数弾生産 (+10)', points: 10 },
  { tree: '根性', label: '根性 (+10)', points: 10 },
  { tree: '回避距離', label: '回避距離UP (+10)', points: 10 },
  { tree: '回避性能', label: '回避性能+2 (+15)', points: 15 },
];

interface SkillSelectorProps {
  hunterType: HunterType;
  selectedSkills: Record<string, number>;
  onAddSkill: (tree: string, points: number) => void;
  onRemoveSkill: (tree: string) => void;
  onChangePoints: (tree: string, points: number) => void;
}

export const SkillSelector: React.FC<SkillSelectorProps> = ({
  hunterType,
  selectedSkills,
  onAddSkill,
  onRemoveSkill,
  onChangePoints,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    hunterType === 'gunner' ? 'ガンナー系' : '剣士系'
  );

  // Automatically update category filter when hunter type changes
  useEffect(() => {
    if (hunterType === 'gunner') {
      setSelectedCategory('ガンナー系');
    } else {
      setSelectedCategory('剣士系');
    }
  }, [hunterType]);

  const categories = useMemo(() => {
    if (hunterType === 'gunner') {
      return ['ガンナー系', 'すべて', '攻撃系', 'ステータス系', '防御系', 'アイテム・マップ系', '剣士系'];
    }
    return ['剣士系', 'すべて', '攻撃系', '防御系', 'ステータス系', 'アイテム・マップ系', 'ガンナー系'];
  }, [hunterType]);

  const quickSkills = useMemo(() => {
    return hunterType === 'gunner' ? GUNNER_QUICK_SKILLS : BLADE_QUICK_SKILLS;
  }, [hunterType]);

  const filteredTrees = useMemo(() => {
    return allSkillTrees.filter((tree) => {
      // If user typed a search query, search broadly
      if (searchQuery.trim()) {
        return matchSkillTree(tree, searchQuery);
      }

      // Hide opposite type skills when in "すべて" mode to keep view clean
      if (selectedCategory === 'すべて') {
        if (hunterType === 'gunner' && tree.category === '剣士系') return false;
        if (hunterType === 'blade' && tree.category === 'ガンナー系') return false;
        return true;
      }

      if (tree.category !== selectedCategory) {
        return false;
      }

      return matchSkillTree(tree, searchQuery);
    });
  }, [searchQuery, selectedCategory, hunterType]);

  const selectedCount = Object.keys(selectedSkills).length;

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          発動希望スキル選択
          <span className="text-xs font-normal text-gray-400">
            ({selectedCount}個選択中)
          </span>
        </h2>
      </div>

      {/* Selected Skills Chips */}
      {selectedCount > 0 ? (
        <div className="flex flex-wrap gap-2 p-3 bg-[#0d1117] rounded-xl border border-[#30363d]">
          {Object.entries(selectedSkills).map(([treeName, points]) => {
            const tree = allSkillsMap[treeName];
            const activeSkill = tree?.skills.find((s) => s.points === points) ?? tree?.skills[0];

            return (
              <div
                key={treeName}
                className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs shadow-sm"
              >
                <div className="flex flex-col">
                  <span className="font-bold text-white">
                    {activeSkill?.name ?? treeName}
                  </span>
                  <span className="text-[10px] text-emerald-400">
                    {treeName} ({points > 0 ? `+${points}` : points}pt)
                  </span>
                </div>

                {tree && tree.skills.length > 1 && (
                  <select
                    value={points}
                    onChange={(e) => onChangePoints(treeName, parseInt(e.target.value, 10))}
                    className="bg-[#161b22] border border-emerald-500/30 text-emerald-300 text-xs rounded px-1.5 py-0.5 focus:outline-none"
                  >
                    {tree.skills
                      .filter((s) => s.points > 0)
                      .map((s) => (
                        <option key={s.points} value={s.points}>
                          +{s.points} ({s.name})
                        </option>
                      ))}
                  </select>
                )}

                <button
                  type="button"
                  onClick={() => onRemoveSkill(treeName)}
                  className="p-1 hover:bg-emerald-800/50 rounded-md text-emerald-400 hover:text-white transition-colors"
                  title="削除"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-xs text-gray-500 italic bg-[#0d1117] p-3 rounded-xl border border-dashed border-[#30363d] text-center">
          下のクイック追加または検索から発動させたいスキルを選択してください
        </div>
      )}

      {/* Quick Access Popular Skills */}
      <div>
        <div className="text-[11px] font-semibold text-gray-400 mb-1.5 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" />
          人気・定番スキル（{hunterType === 'gunner' ? 'ガンナー' : '剣士'}クイック追加）
        </div>
        <div className="flex flex-wrap gap-1.5">
          {quickSkills.map((qs) => {
            const isSelected = selectedSkills[qs.tree] !== undefined;
            return (
              <button
                key={qs.tree}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    onRemoveSkill(qs.tree);
                  } else {
                    onAddSkill(qs.tree, qs.points);
                  }
                }}
                className={`text-xs px-2.5 py-1 rounded-md border transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-600 border-emerald-500 text-white font-medium shadow-sm'
                    : 'bg-[#21262d] border-[#30363d] text-gray-300 hover:text-white hover:border-gray-500'
                }`}
              >
                {isSelected ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3 text-gray-400" />}
                {qs.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Input & Category Filter */}
      <div className="flex flex-col gap-2 pt-1 border-t border-[#30363d]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="スキル名、系統名、またはひらがなで検索 (例: 匠、こうきゅう、抜刀、わざもの)..."
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg pl-9 pr-8 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Categories */}
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-2.5 py-1 rounded-md whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-gray-700 text-white font-medium'
                  : 'bg-[#0d1117] text-gray-400 hover:text-gray-200 border border-[#30363d]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Skill List Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
        {filteredTrees.map((tree) => {
          const isSelected = selectedSkills[tree.name] !== undefined;
          const topSkill = tree.skills.find((s) => s.points > 0) ?? tree.skills[0];

          return (
            <div
              key={tree.name}
              onClick={() => {
                if (isSelected) {
                  onRemoveSkill(tree.name);
                } else if (topSkill) {
                  onAddSkill(tree.name, topSkill.points);
                }
              }}
              className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all flex items-start justify-between gap-2 ${
                isSelected
                  ? 'bg-emerald-950/40 border-emerald-500/60 shadow-sm'
                  : 'bg-[#0d1117] border-[#30363d] hover:border-gray-500'
              }`}
            >
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-white truncate">
                    {topSkill?.name ?? tree.name}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-gray-800 text-gray-400 font-mono">
                    {tree.name}
                  </span>
                </div>
                <div className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">
                  {topSkill?.description ?? ''}
                </div>
              </div>

              <div className="shrink-0 mt-0.5">
                {isSelected ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-[#21262d] text-gray-400 flex items-center justify-center hover:bg-gray-700 hover:text-white">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredTrees.length === 0 && (
          <div className="col-span-full py-8 text-center text-xs text-gray-500">
            該当するスキルが見つかりませんでした
          </div>
        )}
      </div>
    </div>
  );
};
