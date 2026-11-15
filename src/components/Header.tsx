import React from 'react';
import { Sparkles, RotateCcw, Share2, Star } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  onOpenPresets: () => void;
  onOpenFavorites: () => void;
  onShareUrl: () => void;
  favoriteCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onReset,
  onOpenPresets,
  onOpenFavorites,
  onShareUrl,
  favoriteCount,
}) => {
  return (
    <header className="border-b border-[#30363d] bg-[#161b22]/90 backdrop-blur-md sticky top-0 z-40 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white font-bold text-xl">
            2G
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-bold text-white tracking-tight">
                MHP2G スキルシミュレーター
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                Ultra-Fast
              </span>
            </div>
            <p className="text-xs text-gray-400 hidden sm:block">
              モンスターハンターポータブル 2nd G 高速・モダン装備検索
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Favorites Button */}
          <button
            onClick={onOpenFavorites}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-amber-300 text-xs font-medium border border-[#30363d] transition-colors relative"
            title="お気に入り装備一覧"
          >
            <Star className={`w-3.5 h-3.5 ${favoriteCount > 0 ? 'fill-amber-400 text-amber-400' : 'text-gray-400'}`} />
            <span className="hidden sm:inline">お気に入り</span>
            {favoriteCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-gray-950 font-bold text-[10px]">
                {favoriteCount}
              </span>
            )}
          </button>

          {/* Presets Button */}
          <button
            onClick={onOpenPresets}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-medium border border-amber-500/30 transition-colors"
            title="定番テンプレ構成"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">定番テンプレ</span>
          </button>

          {/* Share URL Button */}
          <button
            onClick={onShareUrl}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-gray-200 text-xs font-medium border border-[#30363d] transition-colors"
            title="構成URLをコピー"
          >
            <Share2 className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">共有</span>
          </button>

          {/* Reset Button */}
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-gray-300 hover:text-white text-xs font-medium border border-[#30363d] transition-colors"
            title="条件リセット"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
