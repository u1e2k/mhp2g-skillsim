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
import { type SkillPreset } from './utils/skillSearch';
import { parseConditionFromUrl, serializeConditionToUrl } from './utils/urlState';
import { Search, Loader2, AlertCircle, ArrowUpDown, Check } from 'lucide-react';

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

  // Modal & Toast
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const workerRef = useRef<Worker | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

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

  // Run simulation
  const handleSimulate = useCallback(() => {
    if (Object.keys(targetSkills).length === 0) {
      showToast('発動させたいスキルを1つ以上選択してください');
      return;
    }

    setIsSimulating(true);
    setErrorMsg(null);

    const condition: SimCondition = {
      hunterType,
      sex,
      weaponSlots,
      rankLimit,
      targetSkills,
      pinnedArmors,
    };

    const req: WorkerMessageRequest = {
      type: 'SIMULATE',
      condition,
      maxResults: 100,
    };

    workerRef.current?.postMessage(req);
  }, [hunterType, sex, weaponSlots, rankLimit, targetSkills, pinnedArmors]);

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
        onShareUrl={handleShareUrl}
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

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            disabled={isSimulating}
            onClick={handleSimulate}
            className={`w-full sm:w-auto flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm shadow-lg transition-all ${
              isSimulating
                ? 'bg-amber-600/50 text-white cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-950 hover:shadow-amber-500/20 active:scale-[0.99]'
            }`}
          >
            {isSimulating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>超高速探索中...</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>シミュレート実行 (組み合わせ検索)</span>
              </>
            )}
          </button>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {hasSearched && (
          <section className="flex flex-col gap-3 pt-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span>検索結果</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                    {solutions.length} 件発見
                  </span>
                </h2>
                {simDuration !== null && (
                  <span className="text-xs text-gray-500">
                    ({simDuration.toFixed(1)}ms / {totalChecked?.toLocaleString()} 通り検証)
                  </span>
                )}
              </div>

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

            {sortedSolutions.length > 0 ? (
              <div className="flex flex-col gap-3">
                {sortedSolutions.map((sol, i) => (
                  <SolutionCard key={i} solution={sol} index={i} />
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

      <PresetsModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        onSelectPreset={handleSelectPreset}
      />

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
