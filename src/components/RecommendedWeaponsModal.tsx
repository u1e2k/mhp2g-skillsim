import React, { useMemo } from 'react';
import type { SimSolution } from '../types';
import { getMatchingWeapons } from '../data/weapons';
import { X, Sword } from 'lucide-react';

interface RecommendedWeaponsModalProps {
  isOpen: boolean;
  onClose: () => void;
  solution: SimSolution | null;
  hunterType: 'blade' | 'gunner';
}

export const RecommendedWeaponsModal: React.FC<RecommendedWeaponsModalProps> = ({
  isOpen,
  onClose,
  solution,
  hunterType,
}) => {
  if (!isOpen || !solution) return null;

  const matchingWeapons = useMemo(() => {
    return getMatchingWeapons(solution.activeSkills, hunterType);
  }, [solution, hunterType]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#30363d] flex items-center justify-between bg-[#0d1117]">
          <div className="flex items-center gap-2">
            <Sword className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                この装備セットに合うおすすめ武器
              </h2>
              <p className="text-xs text-gray-400">
                発動スキル（{solution.activeSkills.slice(0, 3).join('・')}など）と相性抜群の名器
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-4 overflow-y-auto flex flex-col gap-3">
          {matchingWeapons.length > 0 ? (
            matchingWeapons.map((w) => (
              <div
                key={w.id}
                className="bg-[#0d1117] border border-[#30363d] rounded-xl p-3.5 flex flex-col gap-2 hover:border-gray-500 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                      {w.type}
                    </span>
                    <span className="text-sm font-bold text-white">{w.name}</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono text-gray-300">
                    <span>攻撃力: <strong className="text-white">{w.attack}</strong></span>
                    {w.affinity !== 0 && (
                      <span className={w.affinity > 0 ? 'text-emerald-400' : 'text-red-400'}>
                        会心: {w.affinity > 0 ? `+${w.affinity}%` : `${w.affinity}%`}
                      </span>
                    )}
                    {w.element && <span className="text-blue-300">{w.element}</span>}
                    <span className="text-amber-300">スロ: {w.slots}</span>
                  </div>
                </div>

                <div className="text-xs text-gray-300 leading-relaxed bg-[#161b22] p-2.5 rounded-lg border border-[#30363d]">
                  {w.description}
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                  <span className="font-mono text-gray-400">
                    特性: <strong className="text-gray-200">{w.sharpnessOrAmmo}</strong>
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">シナジースキル:</span>
                    {w.matchingSkills.slice(0, 3).map((ms) => (
                      <span
                        key={ms}
                        className="px-1.5 py-0.2 rounded bg-emerald-950/50 text-emerald-300 border border-emerald-500/30 text-[10px]"
                      >
                        {ms}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400 text-xs">
              現在の発動スキルに合致する代表的な推奨武器は見つかりませんでした。
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#30363d] bg-[#0d1117] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-white text-xs font-medium border border-[#30363d] transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
