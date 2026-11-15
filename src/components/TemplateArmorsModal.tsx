import React, { useState } from 'react';
import { TEMPLATE_ARMOR_SETS } from '../data/templatesAndGuides';
import { X, Award, Sparkles, ArrowRight, Sword } from 'lucide-react';

interface TemplateArmorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate: (targetSkills: Record<string, number>, hunterType: 'blade' | 'gunner') => void;
}

export const TemplateArmorsModal: React.FC<TemplateArmorsModalProps> = ({
  isOpen,
  onClose,
  onApplyTemplate,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'blade' | 'gunner'>('all');

  if (!isOpen) return null;

  const filteredSets = TEMPLATE_ARMOR_SETS.filter((s) => {
    if (filterType === 'all') return true;
    return s.hunterType === filterType;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#30363d] flex items-center justify-between bg-[#0d1117]">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                名作テンプレ・おすすめ装備セット集
              </h2>
              <p className="text-xs text-gray-400">
                攻略サイトやハンター達に愛用されたMHP2Gを代表する超定番セット
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

        {/* Filter Tabs */}
        <div className="flex gap-2 p-3 bg-[#161b22] border-b border-[#30363d]">
          {[
            { id: 'all', label: 'すべて' },
            { id: 'blade', label: '剣士テンプレ' },
            { id: 'gunner', label: 'ガンナーテンプレ' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterType(tab.id as 'all' | 'blade' | 'gunner')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                filterType === tab.id
                  ? 'bg-amber-500 text-black font-bold shadow-sm'
                  : 'bg-[#21262d] text-gray-300 hover:text-white border border-[#30363d]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List of Templates */}
        <div className="p-4 overflow-y-auto flex flex-col gap-4">
          {filteredSets.map((set) => (
            <div
              key={set.id}
              className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4 flex flex-col gap-3 hover:border-gray-500 transition-all"
            >
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                      {set.hunterType === 'blade' ? '剣士' : 'ガンナー'}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {set.rank}
                    </span>
                    <h3 className="text-sm font-bold text-white">{set.name}</h3>
                  </div>
                  <p className="text-xs text-amber-200/90 mt-1 italic">{set.tagline}</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onApplyTemplate(set.targetSkills, set.hunterType);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  このスキルでシミュレート
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Skills and weapon */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-semibold text-gray-400 mr-1">発動スキル:</span>
                {set.skills.map((s) => (
                  <span
                    key={s}
                    className="text-xs px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-medium"
                  >
                    {s}
                  </span>
                ))}
                <span className="ml-auto text-xs text-gray-400 flex items-center gap-1">
                  <Sword className="w-3.5 h-3.5 text-amber-400" />
                  おすすめ武器: <strong className="text-white">{set.recommendedWeapon}</strong>
                </span>
              </div>

              {/* Armors */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-xs bg-[#161b22] p-2.5 rounded-lg border border-[#30363d]">
                <div>
                  <span className="text-[10px] text-gray-400 block">頭:</span>
                  <span className="text-gray-200 font-medium truncate block">{set.armors.head}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">胴:</span>
                  <span className="text-gray-200 font-medium truncate block">{set.armors.body}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">腕:</span>
                  <span className="text-gray-200 font-medium truncate block">{set.armors.arm}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">腰:</span>
                  <span className="text-gray-200 font-medium truncate block">{set.armors.waist}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">脚:</span>
                  <span className="text-gray-200 font-medium truncate block">{set.armors.leg}</span>
                </div>
              </div>

              {/* Description */}
              <div className="text-xs text-gray-300 leading-relaxed">
                {set.description}
              </div>
            </div>
          ))}
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
