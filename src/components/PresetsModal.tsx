import React from 'react';
import { POPULAR_PRESETS, type SkillPreset } from '../utils/skillSearch';
import { X, Sparkles, Sword, Crosshair } from 'lucide-react';

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: SkillPreset) => void;
}

export const PresetsModal: React.FC<PresetsModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl max-w-lg w-full p-5 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-2 border-b border-[#30363d]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">
              MHP2G 定番・人気テンプレ構成
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-[#21262d]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-gray-400">
          MHP2Gで広く愛用された名作テンプレ構成です。ワンクリックで条件を読み込めます。
        </p>

        <div className="flex flex-col gap-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {POPULAR_PRESETS.map((preset) => (
            <div
              key={preset.name}
              onClick={() => {
                onSelectPreset(preset);
                onClose();
              }}
              className="p-3 bg-[#0d1117] border border-[#30363d] hover:border-amber-500/50 rounded-xl cursor-pointer transition-all hover:bg-[#1f242c] flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">{preset.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 ${
                      preset.type === 'blade'
                        ? 'bg-red-950 text-red-300 border border-red-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {preset.type === 'blade' ? <Sword className="w-3 h-3" /> : <Crosshair className="w-3 h-3" />}
                    {preset.type === 'blade' ? '剣士' : 'ガンナー'}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">
                    武器{preset.weaponSlots}スロ
                  </span>
                </div>
              </div>

              <div className="text-xs text-gray-400">{preset.description}</div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {Object.entries(preset.skills).map(([tree, pts]) => (
                  <span
                    key={tree}
                    className="text-[11px] px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300"
                  >
                    {tree} +{pts}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
