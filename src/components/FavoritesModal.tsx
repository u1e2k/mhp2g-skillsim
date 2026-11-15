import React from 'react';
import { type FavoriteItem, removeFavorite } from '../utils/storage';
import { formatSolutionForClipboard } from '../utils/formatResult';
import { X, Star, Trash2, ArrowUpRight, Copy, Check, Shield } from 'lucide-react';

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: FavoriteItem[];
  onFavoritesChange: () => void;
  onSelectFavorite: (fav: FavoriteItem) => void;
  onShowToast: (msg: string) => void;
}

export const FavoritesModal: React.FC<FavoritesModalProps> = ({
  isOpen,
  onClose,
  favorites,
  onFavoritesChange,
  onSelectFavorite,
  onShowToast,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (fav: FavoriteItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = formatSolutionForClipboard(fav.solution);
    navigator.clipboard.writeText(text);
    setCopiedId(fav.id);
    onShowToast('構成テキストをクリップボードにコピーしました');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeFavorite(id);
    onFavoritesChange();
    onShowToast('お気に入りから削除しました');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl max-w-xl w-full p-5 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-2 border-b border-[#30363d]">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <h2 className="text-base font-bold text-white">
              お気に入り登録済みの装備 ({favorites.length}件)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-[#21262d]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {favorites.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-xs flex flex-col items-center gap-2">
            <Star className="w-8 h-8 text-gray-600" />
            <p>お気に入りに登録された装備はまだありません。</p>
            <p className="text-[11px] text-gray-600">
              検索結果カードの「★ お気に入り」ボタンを押すと保存できます。
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-1">
            {favorites.map((fav) => (
              <div
                key={fav.id}
                onClick={() => {
                  onSelectFavorite(fav);
                  onClose();
                }}
                className="p-3 bg-[#0d1117] border border-[#30363d] hover:border-amber-500/50 rounded-xl cursor-pointer transition-all hover:bg-[#1a1f29] flex flex-col gap-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{fav.name}</span>
                    <span className="text-[11px] text-gray-400 flex items-center gap-1 font-mono">
                      <Shield className="w-3 h-3 text-amber-400" />
                      防{fav.solution.totalDefense}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => handleCopy(fav, e)}
                      className="p-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-gray-300 hover:text-white text-xs transition-colors"
                      title="構成テキストをコピー"
                    >
                      {copiedId === fav.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(fav.id, e)}
                      className="p-1.5 rounded-lg bg-[#21262d] hover:bg-red-950/60 text-gray-400 hover:text-red-400 text-xs transition-colors"
                      title="お気に入りから削除"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-1">
                  {fav.solution.activeSkills.map((s) => (
                    <span
                      key={s}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                {/* Armors Brief */}
                <div className="text-[11px] text-gray-400 line-clamp-1">
                  {fav.solution.head.name} / {fav.solution.body.name} / {fav.solution.arm.name} / {fav.solution.waist.name} / {fav.solution.leg.name}
                </div>

                <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1 border-t border-[#21262d]">
                  <span>登録日時: {new Date(fav.createdAt).toLocaleDateString('ja-JP')}</span>
                  <span className="text-amber-400 flex items-center gap-0.5 font-medium">
                    クリックして条件を呼び出し <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
