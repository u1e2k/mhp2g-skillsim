import React, { useState, useMemo } from 'react';
import armorsData from '../data/armors.json';
import type { Armor, ArmorPart, Rank } from '../types';
import { Lock, SlidersHorizontal, ChevronDown, ChevronUp, X } from 'lucide-react';

const allArmors = armorsData as unknown as Armor[];

interface ArmorFiltersProps {
  hunterType: 'blade' | 'gunner';
  sex: 'male' | 'female';
  rankLimit: Rank;
  pinnedArmors: Partial<Record<ArmorPart, string>>;
  setPinnedArmors: React.Dispatch<React.SetStateAction<Partial<Record<ArmorPart, string>>>>;
}

export const ArmorFilters: React.FC<ArmorFiltersProps> = ({
  hunterType,
  sex,
  rankLimit,
  pinnedArmors,
  setPinnedArmors,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const rankOrder: Record<string, number> = { '下位': 1, '上位': 2, 'G級': 3 };
  const maxRankVal = rankOrder[rankLimit] ?? 3;

  const validArmorsByPart = useMemo(() => {
    const map: Record<ArmorPart, Armor[]> = {
      head: [],
      body: [],
      arm: [],
      waist: [],
      leg: [],
    };

    for (const a of allArmors) {
      if ((rankOrder[a.rank] ?? 1) > maxRankVal) continue;
      if (a.hunterType !== 'both' && a.hunterType !== hunterType) continue;
      if (a.sex !== 'all' && a.sex !== sex) continue;
      map[a.part].push(a);
    }

    for (const part of Object.keys(map) as ArmorPart[]) {
      map[part].sort((a, b) => a.name.localeCompare(b.name, 'ja'));
    }

    return map;
  }, [hunterType, sex, rankLimit]);

  const partLabels: Record<ArmorPart, string> = {
    head: '頭防具固定',
    body: '胴防具固定',
    arm: '腕防具固定',
    waist: '腰防具固定',
    leg: '脚防具固定',
  };

  const hasAnyPinned = Object.values(pinnedArmors).some(Boolean);

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[#21262d] transition-colors"
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-semibold text-gray-200">防具の部位固定・詳細設定</span>
          {hasAnyPinned && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              固定中あり
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {isOpen && (
        <div className="p-4 pt-1 border-t border-[#30363d] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {(Object.keys(partLabels) as ArmorPart[]).map((part) => {
            const currentPinnedId = pinnedArmors[part] ?? '';
            return (
              <div key={part} className="flex flex-col gap-1">
                <label className="text-xs text-gray-400 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-purple-400" />
                  {partLabels[part]}
                </label>
                <div className="relative">
                  <select
                    value={currentPinnedId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPinnedArmors((prev) => ({
                        ...prev,
                        [part]: val ? val : undefined,
                      }));
                    }}
                    className="w-full bg-[#0d1117] border border-[#30363d] text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-purple-500"
                  >
                    <option value="">指定なし (全防具から探索)</option>
                    {validArmorsByPart[part].map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.slots}スロ, 防{a.defense})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}

          {hasAnyPinned && (
            <div className="col-span-full pt-1 flex justify-end">
              <button
                type="button"
                onClick={() => setPinnedArmors({})}
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                すべての固定を解除
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
