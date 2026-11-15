import { useState, useEffect } from 'react';
import type { ArmorPart, Rank, SimCondition } from '../types';
import { parseConditionFromUrl, serializeConditionToUrl } from '../utils/urlState';
import { getLastCondition, saveLastCondition } from '../utils/storage';
import type { SkillPreset } from '../utils/skillSearch';

export function useConditionState(onNotify?: (msg: string) => void) {
  const [hunterType, setHunterType] = useState<'blade' | 'gunner'>('blade');
  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [weaponSlots, setWeaponSlots] = useState<number>(0);
  const [rankLimit, setRankLimit] = useState<Rank>('G級');
  const [targetSkills, setTargetSkills] = useState<Record<string, number>>({});
  const [pinnedArmors, setPinnedArmors] = useState<Partial<Record<ArmorPart, string>>>({});

  // Restore condition from URL or localStorage on mount
  useEffect(() => {
    const urlCond = parseConditionFromUrl();
    if (urlCond) {
      if (urlCond.hunterType) setHunterType(urlCond.hunterType);
      if (urlCond.sex) setSex(urlCond.sex);
      if (urlCond.weaponSlots !== undefined) setWeaponSlots(urlCond.weaponSlots);
      if (urlCond.rankLimit) setRankLimit(urlCond.rankLimit);
      if (urlCond.targetSkills) setTargetSkills(urlCond.targetSkills);
      onNotify?.('URLから装備条件を復元しました');
      return;
    }

    const lastCond = getLastCondition();
    if (lastCond) {
      if (lastCond.hunterType) setHunterType(lastCond.hunterType);
      if (lastCond.sex) setSex(lastCond.sex);
      if (lastCond.weaponSlots !== undefined) setWeaponSlots(lastCond.weaponSlots);
      if (lastCond.rankLimit) setRankLimit(lastCond.rankLimit);
      if (lastCond.targetSkills) setTargetSkills(lastCond.targetSkills);
      if (lastCond.pinnedArmors) setPinnedArmors(lastCond.pinnedArmors);
      onNotify?.('前回の検索条件を復元しました');
      return;
    }

    // Default preset (抜刀アーティ)
    setTargetSkills({
      '匠': 10,
      '抜刀': 10,
      '溜め短縮': 10,
    });
  }, [onNotify]);

  const currentCondition: SimCondition = {
    hunterType,
    sex,
    weaponSlots,
    rankLimit,
    targetSkills,
    pinnedArmors,
  };

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
  };

  const handleApplyPreset = (preset: SkillPreset) => {
    setHunterType(preset.type);
    setWeaponSlots(preset.weaponSlots);
    setTargetSkills(preset.skills);
    setPinnedArmors({});
  };

  const handleApplyCondition = (cond: SimCondition) => {
    setHunterType(cond.hunterType);
    setSex(cond.sex);
    setWeaponSlots(cond.weaponSlots);
    setRankLimit(cond.rankLimit);
    setTargetSkills(cond.targetSkills);
    setPinnedArmors(cond.pinnedArmors ?? {});
  };

  const getShareUrl = () => {
    return `${window.location.origin}${serializeConditionToUrl(currentCondition)}`;
  };

  const persistCondition = (cond: SimCondition) => {
    saveLastCondition(cond);
  };

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
