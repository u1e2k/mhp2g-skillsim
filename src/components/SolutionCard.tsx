import React, { useState } from 'react';
import type { SimSolution } from '../types';
import { formatSolutionForClipboard } from '../utils/formatResult';
import { detectBadSkillsAndCounters } from '../utils/badSkills';
import { BadSkillCountermeasures } from './BadSkillCountermeasures';
import { RecommendedWeaponsModal } from './RecommendedWeaponsModal';
import {
  Copy,
  Check,
  Shield,
  Flame,
  Droplet,
  Zap,
  Snowflake,
  CircleDot,
  Sparkles,
  Star,
  Sword,
  AlertTriangle,
} from 'lucide-react';

interface SolutionCardProps {
  solution: SimSolution;
  index: number;
  hunterType?: 'blade' | 'gunner';
  isFavorited?: boolean;
  onToggleFavorite?: () => void;
}

export const SolutionCard: React.FC<SolutionCardProps> = ({
  solution,
  index,
  hunterType = 'blade',
  isFavorited = false,
  onToggleFavorite,
}) => {
  const [copied, setCopied] = useState(false);
  const [showWeaponsModal, setShowWeaponsModal] = useState(false);

  const handleCopy = () => {
    const text = formatSolutionForClipboard(solution);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const badSkillCounters = detectBadSkillsAndCounters(solution);

  const parts = [
    { label: '頭', armor: solution.head, decos: solution.decorations.head },
    { label: '胴', armor: solution.body, decos: solution.decorations.body },
    { label: '腕', armor: solution.arm, decos: solution.decorations.arm },
    { label: '腰', armor: solution.waist, decos: solution.decorations.waist },
    { label: '脚', armor: solution.leg, decos: solution.decorations.leg },
  ];

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 shadow-md hover:border-gray-500 transition-all flex flex-col gap-3">
      {/* Card Header: Rank, Defense, Resistances, Copy Button, Favorite Button */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-2.5 border-b border-[#30363d]">
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
            #{index + 1}
          </span>
          <div className="flex items-center gap-1 text-gray-200 font-bold text-sm">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>防御力: {solution.totalDefense}</span>
          </div>
          {solution.torsoMultiplier > 1 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-500/40">
              胴倍加 ×{solution.torsoMultiplier}
            </span>
          )}
        </div>

        {/* Resistances & Actions */}
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <div className="flex items-center gap-1.5 mr-1">
            <span className="flex items-center gap-0.5 text-red-400" title="火耐性">
              <Flame className="w-3 h-3" />
              {solution.resistances.fire}
            </span>
            <span className="flex items-center gap-0.5 text-blue-400" title="水耐性">
              <Droplet className="w-3 h-3" />
              {solution.resistances.water}
            </span>
            <span className="flex items-center gap-0.5 text-yellow-400" title="雷耐性">
              <Zap className="w-3 h-3" />
              {solution.resistances.thunder}
            </span>
            <span className="flex items-center gap-0.5 text-cyan-400" title="氷耐性">
              <Snowflake className="w-3 h-3" />
              {solution.resistances.ice}
            </span>
            <span className="flex items-center gap-0.5 text-purple-400" title="龍耐性">
              <CircleDot className="w-3 h-3" />
              {solution.resistances.dragon}
            </span>
          </div>

          {/* Recommended Weapons Button */}
          <button
            type="button"
            onClick={() => setShowWeaponsModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 hover:text-amber-200 border border-amber-500/30 text-xs font-semibold transition-all shadow-sm"
            title="このスキル構成に合うおすすめ武器を表示"
          >
            <Sword className="w-3.5 h-3.5 text-amber-400" />
            <span>おすすめ武器</span>
          </button>

          {/* Favorite button */}
          {onToggleFavorite && (
            <button
              type="button"
              onClick={onToggleFavorite}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium border transition-all ${
                isFavorited
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-[#21262d] hover:bg-[#30363d] text-gray-300 hover:text-white border-[#30363d]'
              }`}
              title={isFavorited ? 'お気に入りから解除' : 'お気に入りに追加'}
            >
              <Star className={`w-3.5 h-3.5 ${isFavorited ? 'fill-amber-400 text-amber-400' : 'text-gray-400'}`} />
              <span className="hidden sm:inline">{isFavorited ? '保存済' : 'お気に入り'}</span>
            </button>
          )}

          {/* Copy button */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#21262d] hover:bg-[#30363d] text-gray-200 hover:text-white border border-[#30363d] text-xs font-medium transition-all"
            title="構成テキストをコピー"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">コピー完了</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-gray-400" />
                <span>コピー</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Activated Skills */}
      <div className="flex flex-wrap gap-1.5 items-center">
        <span className="text-[11px] font-semibold text-gray-400 mr-1">発動スキル:</span>
        {solution.activeSkills.map((s) => {
          const isBad = badSkillCounters.some((bc) => bc.skillName === s);
          return (
            <span
              key={s}
              className={`text-xs px-2 py-0.5 rounded-md font-medium border flex items-center gap-1 ${
                isBad
                  ? 'bg-red-950/60 border-red-500/50 text-red-300'
                  : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
              }`}
            >
              {isBad && <AlertTriangle className="w-3 h-3 text-red-400" />}
              {s}
            </span>
          );
        })}
        {solution.remainingSlots.total > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-md bg-blue-950/60 border border-blue-500/40 text-blue-300 font-mono">
            空き {solution.remainingSlots.total}スロ
          </span>
        )}
      </div>

      {/* Bad Skill Countermeasures (if any) */}
      {badSkillCounters.length > 0 && (
        <BadSkillCountermeasures
          counters={badSkillCounters}
        />
      )}

      {/* Armors & Decos Grid */}
      <div className="grid grid-cols-1 gap-1.5 bg-[#0d1117] p-2.5 rounded-lg border border-[#30363d]">
        {/* Weapon Slots (if any) */}
        {solution.decorations.weapon.length > 0 && (
          <div className="flex items-center justify-between text-xs py-1 px-2 rounded bg-[#161b22]/60">
            <span className="font-semibold text-gray-400 w-8">武器</span>
            <span className="text-gray-300 flex-1">スロット装飾品</span>
            <div className="flex items-center gap-1">
              {solution.decorations.weapon.map((d, i) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono"
                >
                  {d.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Armor Parts */}
        {parts.map((p) => (
          <div
            key={p.label}
            className="flex items-center justify-between text-xs py-1 px-2 rounded hover:bg-[#161b22] transition-colors"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="font-bold text-gray-400 w-5">{p.label}</span>
              <span className="text-white font-medium truncate">{p.armor.name}</span>
              {p.armor.torsoUp && (
                <span className="text-[10px] px-1 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800">
                  胴倍加
                </span>
              )}
              <span className="text-gray-500 text-[10px] font-mono">
                {'○'.repeat(p.armor.slots) + '―'.repeat(Math.max(0, 3 - p.armor.slots))}
              </span>
            </div>

            {/* Decorations inside this armor */}
            <div className="flex items-center gap-1 shrink-0 ml-2">
              {p.decos.map((d, i) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-300 text-[10px] font-mono"
                >
                  {d.name}
                </span>
              ))}
              {p.decos.length === 0 && p.armor.slots > 0 && (
                <span className="text-gray-600 text-[10px] italic">空き</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Extra Skill Suggestions (if slots remaining) */}
      {solution.extraActivations && solution.extraActivations.length > 0 && (
        <div className="bg-amber-950/20 border border-amber-500/20 rounded-lg p-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-semibold">あと少しで発動可能:</span>
            <div className="flex flex-wrap gap-1">
              {solution.extraActivations.map((ex) => (
                <span
                  key={ex.skillName}
                  className="px-1.5 py-0.5 rounded bg-[#161b22] text-amber-200 text-[10px] border border-amber-500/30"
                >
                  {ex.skillName} (あと{ex.remainingPointsNeeded}pt)
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recommended Weapons Modal */}
      <RecommendedWeaponsModal
        isOpen={showWeaponsModal}
        onClose={() => setShowWeaponsModal(false)}
        solution={solution}
        hunterType={hunterType}
      />
    </div>
  );
};
