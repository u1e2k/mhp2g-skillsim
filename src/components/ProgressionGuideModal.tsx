import React, { useState } from 'react';
import { PROGRESSION_GUIDES } from '../data/templatesAndGuides';
import { X, BookOpen, Sparkles, ArrowRight, Sword } from 'lucide-react';

interface ProgressionGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySkills: (targetSkills: Record<string, number>, hunterType: 'blade' | 'gunner') => void;
}

export const ProgressionGuideModal: React.FC<ProgressionGuideModalProps> = ({
  isOpen,
  onClose,
  onApplySkills,
}) => {
  const [selectedWeapon, setSelectedWeapon] = useState<string>('大剣');

  if (!isOpen) return null;

  const currentGuide = PROGRESSION_GUIDES.find((g) => g.weaponType === selectedWeapon) ?? PROGRESSION_GUIDES[0];
  const isGunnerWeapon = ['ライトボウガン', 'ヘビィボウガン', '弓'].includes(currentGuide.weaponType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#30363d] flex items-center justify-between bg-[#0d1117]">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                武器別ストーリー攻略・おすすめ防具ロードマップ
              </h2>
              <p className="text-xs text-gray-400">
                下位・上位・G級の各進行度で「何を作れば詰まらず攻略できるか」を完全網羅
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

        {/* Weapon Tabs */}
        <div className="flex gap-1.5 p-3 bg-[#161b22] border-b border-[#30363d] overflow-x-auto scrollbar-none">
          {PROGRESSION_GUIDES.map((g) => (
            <button
              key={g.weaponType}
              type="button"
              onClick={() => setSelectedWeapon(g.weaponType)}
              className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedWeapon === g.weaponType
                  ? 'bg-amber-500 text-black font-bold shadow-md'
                  : 'bg-[#21262d] text-gray-300 hover:text-white hover:border-gray-500 border border-[#30363d]'
              }`}
            >
              <Sword className="w-3.5 h-3.5" />
              {g.weaponType}
            </button>
          ))}
        </div>

        {/* Weapon intro */}
        <div className="px-5 py-3 bg-[#0d1117]/60 border-b border-[#30363d] text-xs text-gray-300 flex items-center gap-2">
          <span className="text-amber-400 font-bold">【{currentGuide.weaponType}の立ち回り・特徴】</span>
          <span>{currentGuide.roleDescription}</span>
        </div>

        {/* Steps Content */}
        <div className="p-4 overflow-y-auto flex flex-col gap-4">
          {currentGuide.steps.map((step, idx) => {
            const phaseBadgeColor =
              idx === 0
                ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                : idx === 1
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-purple-500/20 text-purple-300 border-purple-500/30';

            return (
              <div
                key={step.phase}
                className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4 flex flex-col gap-3 hover:border-gray-500 transition-all"
              >
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2.5 py-0.5 rounded font-bold border ${phaseBadgeColor}`}>
                      {step.phase}
                    </span>
                    <span className="text-sm font-bold text-white">
                      推奨装備: <span className="text-amber-300">{step.recommendedArmor}</span>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onApplySkills(step.targetSkills, isGunnerWeapon ? 'gunner' : 'blade');
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    この段階のスキルでシミュレート
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs bg-[#161b22] p-3 rounded-lg border border-[#30363d]">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1 text-gray-400">
                      <Sword className="w-3.5 h-3.5 text-amber-400" />
                      <span>相性の良い推奨武器:</span>
                      <strong className="text-white">{step.recommendedWeapon}</strong>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap mt-1">
                      <span className="text-gray-400">キー発動スキル:</span>
                      {step.keySkills.map((k) => (
                        <span
                          key={k}
                          className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium"
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col justify-center text-gray-300 border-t md:border-t-0 md:border-l border-[#30363d] pt-2 md:pt-0 md:pl-3">
                    <span className="text-gray-400 text-[11px]">主なキー素材・採取先:</span>
                    <span className="text-amber-200/90 font-mono text-[11px]">{step.keyMaterials}</span>
                  </div>
                </div>

                <div className="text-xs text-gray-300 leading-relaxed pl-1 border-l-2 border-amber-500/50">
                  <span className="font-semibold text-gray-200">攻略ポイント: </span>
                  {step.reason}
                </div>
              </div>
            );
          })}
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
