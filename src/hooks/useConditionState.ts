import { useState, useMemo, useCallback } from 'react';
import type { ArmorPart, Rank, SimCondition } from '../types';
import { parseConditionFromUrl, serializeConditionToUrl } from '../utils/urlState';
import { getLastCondition, saveLastCondition } from '../utils/storage';
import type { SkillPreset } from '../utils/skillSearch';

function getInitialCondition(): {
  hunterType: 'blade' | 'gunner';
  sex: 'male' | 'female';
  weaponSlots: number;
  rankLimit: Rank;
  targetSkills: Record<string, number>;
  pinnedArmors: Partial<Record<ArmorPart, string>>;
} {
  // 1. URL condition priority
  const urlCond = parseConditionFromUrl();
  if (urlCond && Object.keys(urlCond).length > 0) {
    return {
      hunterType: urlCond.hunterType ?? 'blade',
      sex: urlCond.sex ?? 'male',
      weaponSlots: urlCond.weaponSlots ?? 0,
      rankLimit: urlCond.rankLimit ?? 'G級',
      targetSkills: urlCond.targetSkills ?? { '匠': 10, '抜刀': 10, '溜め短縮': 10 },
      pinnedArmors: urlCond.pinnedArmors ?? {},
    };
  }

  // 2. LocalStorage condition
  const lastCond = getLastCondition();
  if (lastCond) {
    return {
      hunterType: lastCond.hunterType ?? 'blade',
      sex: lastCond.sex ?? 'male',
      weaponSlots: lastCond.weaponSlots ?? 0,
      rankLimit: lastCond.rankLimit ?? 'G級',
      targetSkills: lastCond.targetSkills ?? { '匠': 10, '抜刀': 10, '溜め短縮': 10 },
      pinnedArmors: lastCond.pinnedArmors ?? {},
    };
  }

  // 3. Default preset (抜刀アーティ)
  return {
    hunterType: 'blade',
    sex: 'male',
    weaponSlots: 0,
    rankLimit: 'G級',
    targetSkills: {
      '匠': 10,
      '抜刀': 10,
      '溜め短縮': 10,
    },
    pinnedArmors: {},
  };
}

export function useConditionState(onNotify?: (msg: string) => void) {
  const initial = useMemo(() => getInitialCondition(), []);

  const [hunterType, setHunterType] = useState<'blade' | 'gunner'>(initial.hunterType);
  const [sex, setSex] = useState<'male' | 'female'>(initial.sex);
  const [weaponSlots, setWeaponSlots] = useState<number>(initial.weaponSlots);
  const [rankLimit, setRankLimit] = useState<Rank>(initial.rankLimit);
  const [targetSkills, setTargetSkills] = useState<Record<string, number>>(initial.targetSkills);
  const [pinnedArmors, setPinnedArmors] = useState<Partial<Record<ArmorPart, string>>>(initial.pinnedArmors);

  const currentCondition: SimCondition = useMemo(
    () => ({
      hunterType,
      sex,
      weaponSlots,
      rankLimit,
      targetSkills,
      pinnedArmors,
    }),
    [hunterType, sex, weaponSlots, rankLimit, targetSkills, pinnedArmors]
  );

  const handleAddSkill = useCallback((tree: string, points: number) => {
    setTargetSkills((prev) => ({ ...prev, [tree]: points }));
  }, []);

  const handleRemoveSkill = useCallback((tree: string) => {
    setTargetSkills((prev) => {
      const next = { ...prev };
      delete next[tree];
      return next;
    });
  }, []);

  const handleChangePoints = useCallback((tree: string, points: number) => {
    setTargetSkills((prev) => ({ ...prev, [tree]: points }));
  }, []);

  const handleReset = useCallback(() => {
    setTargetSkills({});
    setPinnedArmors({});
    onNotify?.('条件をリセットしました');
  }, [onNotify]);

  const handleApplyPreset = useCallback(
    (preset: SkillPreset) => {
      setHunterType(preset.type);
      setWeaponSlots(preset.weaponSlots);
      setTargetSkills(preset.skills);
      setPinnedArmors({});
      onNotify?.(`テンプレ「${preset.name}」を読み込みました`);
    },
    [onNotify]
  );

  const handleApplyCondition = useCallback(
    (cond: SimCondition, name?: string) => {
      setHunterType(cond.hunterType);
      setSex(cond.sex);
      setWeaponSlots(cond.weaponSlots);
      setRankLimit(cond.rankLimit);
      setTargetSkills(cond.targetSkills);
      setPinnedArmors(cond.pinnedArmors ?? {});
      if (name) {
        onNotify?.(`お気に入り「${name}」を読み込みました`);
      }
    },
    [onNotify]
  );

  const getShareUrl = useCallback(() => {
    return `${window.location.origin}${serializeConditionToUrl(currentCondition)}`;
  }, [currentCondition]);

  const persistCondition = useCallback((cond: SimCondition) => {
    saveLastCondition(cond);
  }, []);

  return {
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
  };
}
