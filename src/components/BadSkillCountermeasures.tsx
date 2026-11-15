import React from 'react';
import type { BadSkillCountermeasure } from '../utils/badSkills';
import { AlertTriangle, CheckCircle2, HelpCircle } from 'lucide-react';

interface BadSkillCountermeasuresProps {
  counters: BadSkillCountermeasure[];
}

export const BadSkillCountermeasures: React.FC<BadSkillCountermeasuresProps> = ({
  counters,
}) => {
  if (counters.length === 0) return null;

  return (
    <div className="bg-red-950/20 border border-red-500/30 rounded-lg p-2.5 text-xs flex flex-col gap-2">
      <div className="flex items-center gap-1.5 text-red-400 font-semibold">
        <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
        <span>マイナス（バッド）スキル打ち消しヒント ({counters.length}件)</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {counters.map((c) => (
          <div
            key={c.skillName}
            className="bg-[#0d1117]/80 border border-[#30363d] rounded p-2 flex flex-col gap-1"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-red-300">
                {c.skillName} ({c.currentPoints}pt)
              </span>
              {c.canCancelWithRemainingSlots ? (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  空きスロで相殺可
                </span>
              ) : (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <HelpCircle className="w-2.5 h-2.5" />
                  追加スロ必要
                </span>
              )}
            </div>

            <div className="text-[11px] text-gray-300">
              {c.counterDeco ? (
                <span>
                  相殺に必要なポイント: <strong className="text-white">+{c.pointsNeeded}pt</strong>
                  <br />
                  推奨装飾品:{' '}
                  <strong className="text-amber-300">
                    {c.counterDeco.name} [{c.counterDeco.slots}]
                  </strong>
                  {' × '}
                  <span className="text-white font-bold">{c.decosNeeded}個</span>
                  <span className="text-gray-400"> (計 {c.slotsRequired} スロ消費)</span>
                </span>
              ) : (
                <span className="text-gray-400">該当する打ち消し装飾品がありません</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
