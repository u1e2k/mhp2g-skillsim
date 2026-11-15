import React, { useState, useEffect, useRef, useCallback } from 'react';
import type {
  ArmorPart,
  Rank,
  SimCondition,
  SimSolution,
  WorkerMessageRequest,
  WorkerMessageResponse,
} from './types';
import { Header } from './components/Header';
import { ConditionSettings } from './components/ConditionSettings';
import { SkillSelector } from './components/SkillSelector';
import { ArmorFilters } from './components/ArmorFilters';
import { SolutionCard } from './components/SolutionCard';
import { PresetsModal } from './components/PresetsModal';
import { FavoritesModal } from './components/FavoritesModal';
import { type SkillPreset } from './utils/skillSearch';
import { parseConditionFromUrl, serializeConditionToUrl } from './utils/urlState';
import {
  getFavorites,
  saveFavorite,
  removeFavorite,
  isSolutionFavorited,
  type FavoriteItem,
} from './utils/storage';
import { Search, Loader2, AlertCircle, ArrowUpDown, Check, Info } from 'lucide-react';

const MAX_SOLUTIONS_LIMIT = 100;

export const App: React.FC = () => {
  // State for conditions
  const [hunterType, setHunterType] = useState<'blade' | 'gunner'>('blade');
  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [weaponSlots, setWeaponSlots] = useState<number>(0);
  const [rankLimit, setRankLimit] = useState<Rank>('G級');
  const [targetSkills, setTargetSkills] = useState<Record<string, number>>({});
  const [pinnedArmors, setPinnedArmors] = useState<Partial<Record<ArmorPart, string>>>({});

  // Solver state
  const [isSimulating, setIsSimulating] = useState(false);
  const [solutions, setSolutions] = useState<SimSolution[]>([]);
  const [simDuration, setSimDuration] = useState<number | null>(null);
  const [totalChecked, setTotalChecked] = useState<number | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'defense' | 'slots'>('defense');

  // Favorites state
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);

  // Modal & Toast
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const workerRef = useRef<Worker | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const refreshFavorites = () => {
    setFavorites(getFavorites());
  };

  // Load favorites on mount
  useEffect(() => {
    refreshFavorites();
  }, []);

  // Initialize Worker
  useEffect(() => {
    workerRef.current = new Worker(new URL('./solver/worker.ts', import.meta.url), {
      type: 'module',
    });

    workerRef.current.onmessage = (event: MessageEvent<WorkerMessageResponse>) => {
      const { type, solutions: solList, totalCombinationsChecked, durationMs, error } = event.data;
      setIsSimulating(false);

      if (type === 'DONE') {
        setSolutions(solList ?? []);
        setSimDuration(durationMs ?? 0);
        setTotalChecked(totalCombinationsChecked ?? 0);
        setHasSearched(true);
        setErrorMsg(null);
      } else if (type === 'ERROR') {
        setErrorMsg(error ?? '計算中にエラーが発生しました');
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  // Trigger Simulation with condition
  const executeSimulate = useCallback(
    (cond: SimCondition) => {
      if (Object.keys(cond.targetSkills).length === 0) {
        setSolutions([]);
        setHasSearched(false);
        setIsSimulating(false);
        return;
      }

      setIsSimulating(true);
      setErrorMsg(null);

      const req: WorkerMessageRequest = {
        type: 'SIMULATE',
        condition: cond,
        maxResults: MAX_SOLUTIONS_LIMIT,
      };

      workerRef.current?.postMessage(req);
    },
    []
  );

  // Restore condition from URL on initial load
  useEffect(() => {
    const urlCond = parseConditionFromUrl();
    if (urlCond) {
      if (urlCond.hunterType) setHunterType(urlCond.hunterType);
      if (urlCond.sex) setSex(urlCond.sex);
      if (urlCond.weaponSlots !== undefined) setWeaponSlots(urlCond.weaponSlots);
      if (urlCond.rankLimit) setRankLimit(urlCond.rankLimit);
      if (urlCond.targetSkills) setTargetSkills(urlCond.targetSkills);
      showToast('URLから装備条件を復元しました');
    } else {
      setTargetSkills({
        '匠': 10,
        '抜刀': 10,
        '溜め短縮': 10,
      });
    }
  }, []);

  // Auto-simulate on any condition changes (Debounced 250ms)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      // Initial search
      if (Object.keys(targetSkills).length > 0) {
        executeSimulate({
          hunterType,
          sex,
          weaponSlots,
          rankLimit,
          targetSkills,
          pinnedArmors,
        });
      }
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      executeSimulate({
        hunterType,
        sex,
        weaponSlots,
        rankLimit,
        targetSkills,
        pinnedArmors,
      });
    }, 250);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [hunterType, sex, weaponSlots, rankLimit, targetSkills, pinnedArmors, executeSimulate]);

  // Skill manipulations
  const handleAddSkill = (tree: string, points: number) => {
    setTargetSkills((prev) => ({ ...prev, [tree]: points }));
  };

  const handleRemoveSkill = (tree: string) => {
    setTargetSkills((prev) => {
      const next = { ...prev };
      delete next[tree];
      return next;
    });
  };

  const handleChangePoints = (tree: string, points: number) => {
    setTargetSkills((prev) => ({ ...prev, [tree]: points }));
  };

  const handleReset = () => {
    setTargetSkills({});
    setPinnedArmors({});
    setSolutions([]);
    setHasSearched(false);
    showToast('条件をリセットしました');
  };

  const handleSelectPreset = (preset: SkillPreset) => {
    setHunterType(preset.type);
    setWeaponSlots(preset.weaponSlots);
    setTargetSkills(preset.skills);
    setPinnedArmors({});
    showToast(`テンプレ「${preset.name}」を読み込みました`);
  };

  const handleSelectFavorite = (fav: FavoriteItem) => {
    setHunterType(fav.condition.hunterType);
    setSex(fav.condition.sex);
    setWeaponSlots(fav.condition.weaponSlots);
    setRankLimit(fav.condition.rankLimit);
    setTargetSkills(fav.condition.targetSkills);
    if (fav.condition.pinnedArmors) {
      setPinnedArmors(fav.condition.pinnedArmors);
    }
    showToast(`お気に入り「${fav.name}」を読み込みました`);
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
      const cond: SimCondition = {
        hunterType,
        sex,
        weaponSlots,
        rankLimit,
        targetSkills,
        pinnedArmors,
      };
      saveFavorite(solution, cond);
      refreshFavorites();
      showToast('お気に入りに登録しました！★');
    }
  };

  const handleShareUrl = () => {
    const condition: SimCondition = {
      hunterType,
      sex,
      weaponSlots,
      rankLimit,
      targetSkills,
    };
    const url = `${window.location.origin}${serializeConditionToUrl(condition)}`;
    navigator.clipboard.writeText(url);
    showToast('構成共有URLをクリップボードにコピーしました！');
  };

  // Sorted solutions
  const sortedSolutions = [...solutions].sort((a, b) => {
    if (sortBy === 'defense') {
      return b.totalDefense - a.totalDefense;
    } else {
      return b.remainingSlots.total - a.remainingSlots.total;
    }
  });

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] pb-16">
      <Header
        onReset={handleReset}
        onOpenPresets={() => setIsPresetsOpen(true)}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        onShareUrl={handleShareUrl}
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

        {/* Status / Manual Simulate Trigger */}
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
            onClick={() =>
              executeSimulate({
                hunterType,
                sex,
                weaponSlots,
                rankLimit,
                targetSkills,
                pinnedArmors,
              })
            }
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

        {/* Search Results Section */}
        {hasSearched && (
          <section className="flex flex-col gap-3 pt-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span>検索結果</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                    {solutions.length} 件発見
                  </span>
                </h2>
                {solutions.length >= MAX_SOLUTIONS_LIMIT && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    上位100件を表示中
                  </span>
                )}
                {simDuration !== null && (
                  <span className="text-xs text-gray-500">
                    ({simDuration.toFixed(1)}ms / {totalChecked?.toLocaleString()} 通り検証)
                  </span>
                )}
              </div>

              {/* Sort selector */}
              {solutions.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <span>並び替え:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'defense' | 'slots')}
                    className="bg-[#161b22] border border-[#30363d] text-white text-xs rounded-md px-2 py-1 focus:outline-none"
                  >
                    <option value="defense">防御力が高い順</option>
                    <option value="slots">余りスロットが多い順</option>
                  </select>
                </div>
              )}
            </div>

            {/* Results Grid */}
            {sortedSolutions.length > 0 ? (
              <div className="flex flex-col gap-3">
                {sortedSolutions.map((sol, i) => (
                  <SolutionCard
                    key={i}
                    solution={sol}
                    index={i}
                    isFavorited={isSolutionFavorited(sol, favorites)}
                    onToggleFavorite={() => handleToggleFavorite(sol)}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-[#161b22] border border-dashed border-[#30363d] text-center flex flex-col items-center gap-2 text-gray-400 text-xs">
                <AlertCircle className="w-8 h-8 text-amber-500/70" />
                <p className="font-semibold text-gray-300">
                  指定されたスキルの組み合わせは見つかりませんでした
                </p>
                <p className="text-gray-500">
                  武器スロット数を増やしたり、スキルの優先順位を見直してみてください。
                </p>
              </div>
            )}
          </section>
        )}
      </main>

      {/* Popular Presets Modal */}
      <PresetsModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        onSelectPreset={handleSelectPreset}
      />

      {/* Favorites Modal */}
      <FavoritesModal
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favorites}
        onFavoritesChange={refreshFavorites}
        onSelectFavorite={handleSelectFavorite}
        onShowToast={showToast}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#161b22] border border-amber-500/40 text-amber-200 px-4 py-2.5 rounded-xl shadow-2xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default App;
