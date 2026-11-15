import React, { useState, useEffect, useRef } from 'react';
import type { SimSolution } from './types';
import { Header } from './components/Header';
import { ConditionSettings } from './components/ConditionSettings';
import { SkillSelector } from './components/SkillSelector';
import { ArmorFilters } from './components/ArmorFilters';
import { SearchResults } from './components/SearchResults';
import { PresetsModal } from './components/PresetsModal';
import { FavoritesModal } from './components/FavoritesModal';
import { Toast } from './components/Toast';
import { useSimulator } from './hooks/useSimulator';
import { useConditionState } from './hooks/useConditionState';
import {
  getFavorites,
  saveFavorite,
  removeFavorite,
  isSolutionFavorited,
  type FavoriteItem,
} from './utils/storage';
import { Search, Loader2, AlertCircle, Check } from 'lucide-react';

const MAX_SOLUTIONS_LIMIT = 100;

export const App: React.FC = () => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Conditions & State management hook
  const {
    hunterType,
    setHunterType,
    sex,
    setSex,
    weaponSlots,
    setWeaponSlots,
    rankLimit,
    setRankLimit,
    targetSkills,
    pinnedArmors,
    setPinnedArmors,
    currentCondition,
    handleAddSkill,
    handleRemoveSkill,
    handleChangePoints,
    handleReset,
    handleApplyPreset,
    handleApplyCondition,
    getShareUrl,
    persistCondition,
  } = useConditionState(showToast);

  // Simulator hook
  const {
    isSimulating,
    solutions,
    simDuration,
    totalChecked,
    hasSearched,
    errorMsg,
    executeSimulate,
    resetResults,
  } = useSimulator(MAX_SOLUTIONS_LIMIT);

  // Favorites & Sort state
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'defense' | 'slots'>('defense');

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);

  const refreshFavorites = () => setFavorites(getFavorites());
  useEffect(() => {
    refreshFavorites();
  }, []);

  // Debounced Auto-simulation on condition change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (Object.keys(targetSkills).length > 0) {
        persistCondition(currentCondition);
        executeSimulate(currentCondition);
      }
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      persistCondition(currentCondition);
      executeSimulate(currentCondition);
    }, 250);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [currentCondition, executeSimulate, persistCondition, targetSkills]);

  // Handlers
  const handleFullReset = () => {
    handleReset();
    resetResults();
    showToast('条件をリセットしました');
  };

  const handleToggleFavorite = (solution: SimSolution) => {
    const favorited = isSolutionFavorited(solution, favorites);
    if (favorited) {
      const match = favorites.find(
        (f) =>
          f.solution.head.id === solution.head.id &&
          f.solution.body.id === solution.body.id &&
          f.solution.arm.id === solution.arm.id &&
          f.solution.waist.id === solution.waist.id &&
          f.solution.leg.id === solution.leg.id
      );
      if (match) {
        removeFavorite(match.id);
        refreshFavorites();
        showToast('お気に入りから削除しました');
      }
    } else {
      saveFavorite(solution, currentCondition);
      refreshFavorites();
      showToast('お気に入りに登録しました！★');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(getShareUrl());
    showToast('構成共有URLをクリップボードにコピーしました！');
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] pb-16">
      <Header
        onReset={handleFullReset}
        onOpenPresets={() => setIsPresetsOpen(true)}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        onShareUrl={handleShare}
        favoriteCount={favorites.length}
      />

      <main className="max-w-6xl mx-auto px-4 py-6 flex flex-col gap-5">
        <ConditionSettings
          hunterType={hunterType}
          setHunterType={setHunterType}
          sex={sex}
          setSex={setSex}
          weaponSlots={weaponSlots}
          setWeaponSlots={setWeaponSlots}
          rankLimit={rankLimit}
          setRankLimit={setRankLimit}
        />

        <SkillSelector
          selectedSkills={targetSkills}
          onAddSkill={handleAddSkill}
          onRemoveSkill={handleRemoveSkill}
          onChangePoints={handleChangePoints}
        />

        <ArmorFilters
          hunterType={hunterType}
          sex={sex}
          rankLimit={rankLimit}
          pinnedArmors={pinnedArmors}
          setPinnedArmors={setPinnedArmors}
        />

        {/* Auto status & manual simulate trigger */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#161b22] p-3 rounded-xl border border-[#30363d]">
          <div className="flex items-center gap-2 text-xs text-gray-300">
            {isSimulating ? (
              <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                <Loader2 className="w-4 h-4 animate-spin" />
                リアルタイム探索中...
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <Check className="w-4 h-4" />
                オートシミュレート有効 (選択と同時に自動更新)
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={isSimulating}
            onClick={() => executeSimulate(currentCondition)}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-[#21262d] hover:bg-[#30363d] text-gray-200 border border-[#30363d] transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>再検索</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <SearchResults
          hasSearched={hasSearched}
          solutions={solutions}
          simDuration={simDuration}
          totalChecked={totalChecked}
          sortBy={sortBy}
          setSortBy={setSortBy}
          maxLimit={MAX_SOLUTIONS_LIMIT}
          isFavorited={(sol) => isSolutionFavorited(sol, favorites)}
          onToggleFavorite={handleToggleFavorite}
        />
      </main>

      <PresetsModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        onSelectPreset={(preset) => {
          handleApplyPreset(preset);
          showToast(`テンプレ「${preset.name}」を読み込みました`);
        }}
      />

      <FavoritesModal
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favorites}
        onFavoritesChange={refreshFavorites}
        onSelectFavorite={(fav) => {
          handleApplyCondition(fav.condition);
          showToast(`お気に入り「${fav.name}」を読み込みました`);
        }}
        onShowToast={showToast}
      />

      <Toast message={toastMessage} />
    </div>
  );
};

export default App;
