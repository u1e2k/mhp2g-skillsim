import React from 'react';
import type { Rank } from '../types';
import { Sword, Crosshair } from 'lucide-react';

interface ConditionSettingsProps {
  hunterType: 'blade' | 'gunner';
  setHunterType: (type: 'blade' | 'gunner') => void;
  sex: 'male' | 'female';
  setSex: (sex: 'male' | 'female') => void;
  weaponSlots: number;
  setWeaponSlots: (slots: number) => void;
  rankLimit: Rank;
  setRankLimit: (rank: Rank) => void;
}

export const ConditionSettings: React.FC<ConditionSettingsProps> = ({
  hunterType,
  setHunterType,
  sex,
  setSex,
  weaponSlots,
  setWeaponSlots,
  rankLimit,
  setRankLimit,
}) => {
  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-200 mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
        基本条件設定
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Hunter Type */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">職別タイプ</label>
          <div className="grid grid-cols-2 bg-[#0d1117] p-1 rounded-lg border border-[#30363d]">
            <button
              type="button"
              onClick={() => setHunterType('blade')}
              className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-all ${
                hunterType === 'blade'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Sword className="w-3.5 h-3.5" />
              剣士
            </button>
            <button
              type="button"
              onClick={() => setHunterType('gunner')}
              className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-all ${
                hunterType === 'gunner'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Crosshair className="w-3.5 h-3.5" />
              ガンナー
            </button>
          </div>
        </div>

        {/* Sex */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">ハンター性別</label>
          <div className="grid grid-cols-2 bg-[#0d1117] p-1 rounded-lg border border-[#30363d]">
            <button
              type="button"
              onClick={() => setSex('male')}
              className={`py-1.5 text-xs font-medium rounded-md transition-all ${
                sex === 'male'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              男 ♂
            </button>
            <button
              type="button"
              onClick={() => setSex('female')}
              className={`py-1.5 text-xs font-medium rounded-md transition-all ${
                sex === 'female'
                  ? 'bg-pink-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              女 ♀
            </button>
          </div>
        </div>

        {/* Weapon Slots */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">武器スロット</label>
          <div className="grid grid-cols-4 bg-[#0d1117] p-1 rounded-lg border border-[#30363d]">
            {[0, 1, 2, 3].map((slots) => (
              <button
                key={slots}
                type="button"
                onClick={() => setWeaponSlots(slots)}
                className={`py-1.5 text-xs font-medium rounded-md transition-all ${
                  weaponSlots === slots
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {slots === 0 ? '無' : `${slots}スロ`}
              </button>
            ))}
          </div>
        </div>

        {/* Rank Limit */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">進行度・ランク制限</label>
          <div className="grid grid-cols-3 bg-[#0d1117] p-1 rounded-lg border border-[#30363d]">
            {(['G級', '上位', '下位'] as Rank[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRankLimit(r)}
                className={`py-1.5 text-xs font-medium rounded-md transition-all ${
                  rankLimit === r
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
