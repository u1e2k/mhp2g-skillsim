import React from 'react';
import { RotateCcw, Share2, Star, Award, BookOpen } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  onOpenTemplates: () => void;
  onOpenProgressionGuide: () => void;
  onOpenFavorites: () => void;
  onShareUrl: () => void;
  favoriteCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onReset,
  onOpenTemplates,
  onOpenProgressionGuide,
  onOpenFavorites,
  onShareUrl,
  favoriteCount,
}) => {
  return (
    <header className="border-b border-[#30363d] bg-[#161b22]/90 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-4 py-2.5 sm:py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 overflow-x-auto scrollbar-none">
        {/* Left: Logo & Title */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white font-bold text-lg sm:text-xl shrink-0">
            2G
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg md:text-xl font-bold text-white tracking-tight whitespace-nowrap">
                MHP2G スキルシミュレーター
              </h1>
              <span className="hidden xl:inline-block text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono whitespace-nowrap">
                Ultra-Fast
              </span>
            </div>
            <p className="text-[11px] text-gray-400 hidden lg:block whitespace-nowrap">
              モンスターハンターポータブル 2nd G 高速・モダン装備検索
            </p>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Progression Guide Button */}
          <button
            type="button"
            onClick={onOpenProgressionGuide}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 text-xs font-medium border border-blue-500/30 transition-colors whitespace-nowrap shrink-0"
            title="武器別ストーリー攻略おすすめ防具チャート"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="hidden lg:inline">ストーリー攻略防具</span>
            <span className="lg:hidden">攻略ガイド</span>
          </button>

          {/* Templates Button */}
          <button
            type="button"
            onClick={onOpenTemplates}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs font-medium border border-purple-500/30 transition-colors whitespace-nowrap shrink-0"
            title="攻略サイトの名作テンプレ防具一覧"
          >
            <Award className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span className="hidden lg:inline">おすすめテンプレ</span>
            <span className="lg:hidden">テンプレ</span>
          </button>

          {/* Favorites Button */}
          <button
            type="button"
            onClick={onOpenFavorites}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-amber-300 text-xs font-medium border border-[#30363d] transition-colors whitespace-nowrap shrink-0 relative"
            title="お気に入り装備一覧"
          >
            <Star className={`w-3.5 h-3.5 shrink-0 ${favoriteCount > 0 ? 'fill-amber-400 text-amber-400' : 'text-gray-400'}`} />
            <span className="hidden sm:inline">お気に入り</span>
            {favoriteCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-gray-950 font-bold text-[10px]">
                {favoriteCount}
              </span>
            )}
          </button>

          {/* Share URL Button */}
          <button
            type="button"
            onClick={onShareUrl}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-gray-200 text-xs font-medium border border-[#30363d] transition-colors whitespace-nowrap shrink-0"
            title="構成URLをコピー"
          >
            <Share2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="hidden sm:inline">共有</span>
          </button>

          {/* Reset Button */}
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-gray-300 hover:text-white text-xs font-medium border border-[#30363d] transition-colors shrink-0"
            title="条件リセット"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
          </button>
        </div>
      </div>
    </header>
  );
};
