import React from 'react';
import type { SimSolution } from '../types';
import { SolutionCard } from './SolutionCard';
import { ArrowUpDown, AlertCircle, Info } from 'lucide-react';

interface SearchResultsProps {
  hasSearched: boolean;
  solutions: SimSolution[];
  simDuration: number | null;
  totalChecked: number | null;
  sortBy: 'defense' | 'slots';
  setSortBy: (sort: 'defense' | 'slots') => void;
  maxLimit: number;
  isFavorited: (solution: SimSolution) => boolean;
  onToggleFavorite: (solution: SimSolution) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  hasSearched,
  solutions,
  simDuration,
  totalChecked,
  sortBy,
  setSortBy,
  maxLimit,
  isFavorited,
  onToggleFavorite,
}) => {
  if (!hasSearched) return null;

  const sortedSolutions = [...solutions].sort((a, b) => {
    if (sortBy === 'defense') {
      return b.totalDefense - a.totalDefense;
    } else {
      return b.remainingSlots.total - a.remainingSlots.total;
    }
  });

  return (
    <section className="flex flex-col gap-3 pt-2">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>検索結果</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
              {solutions.length} 件発見
            </span>
          </h2>
          {solutions.length >= maxLimit && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30 flex items-center gap-1">
              <Info className="w-3 h-3" />
              上位{maxLimit}件を表示中
            </span>
          )}
          {simDuration !== null && (
            <span className="text-xs text-gray-500">
              ({simDuration.toFixed(1)}ms / {totalChecked?.toLocaleString()} 通り検証)
            </span>
          )}
        </div>

        {/* Sort selector */}
        {solutions.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>並び替え:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'defense' | 'slots')}
              className="bg-[#161b22] border border-[#30363d] text-white text-xs rounded-md px-2 py-1 focus:outline-none"
            >
              <option value="defense">防御力が高い順</option>
              <option value="slots">余りスロットが多い順</option>
            </select>
          </div>
        )}
      </div>

      {/* Results Grid */}
      {sortedSolutions.length > 0 ? (
        <div className="flex flex-col gap-3">
          {sortedSolutions.map((sol, i) => (
            <SolutionCard
              key={i}
              solution={sol}
              index={i}
              isFavorited={isFavorited(sol)}
              onToggleFavorite={() => onToggleFavorite(sol)}
            />
          ))}
        </div>
      ) : (
        <div className="p-8 rounded-xl bg-[#161b22] border border-dashed border-[#30363d] text-center flex flex-col items-center gap-2 text-gray-400 text-xs">
          <AlertCircle className="w-8 h-8 text-amber-500/70" />
          <p className="font-semibold text-gray-300">
            指定されたスキルの組み合わせは見つかりませんでした
          </p>
          <p className="text-gray-500">
            武器スロット数を増やしたり、スキルの優先順位を見直してみてください。
          </p>
        </div>
      )}
    </section>
  );
};
