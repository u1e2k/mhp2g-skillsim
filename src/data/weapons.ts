export interface RecommendedWeapon {
  id: string;
  name: string;
  type: string; // '大剣' | '太刀' | '片手剣' | '双剣' | 'ハンマー' | '狩猟笛' | 'ランス' | 'ガンランス' | 'ライトボウガン' | 'ヘビィボウガン' | '弓'
  attack: number;
  affinity: number; // %
  element?: string;
  slots: number;
  sharpnessOrAmmo: string;
  description: string;
  matchingSkills: string[]; // Skill tree names or activated skill names that match well
}

export const RECOMMENDED_WEAPONS: RecommendedWeapon[] = [
  // --- 大剣 ---
  {
    id: 'gs_1',
    name: '角王剣アーティラート',
    type: '大剣',
    attack: 1488,
    affinity: -15,
    slots: 0,
    sharpnessOrAmmo: '紫（匠時）',
    description: 'MHP2G最強の大剣。抜刀術（会心+100%）でマイナス会心を打ち消し、驚異の100%会心超絶火力を叩き出す絶対的エース。',
    matchingSkills: ['抜刀', '抜刀術', '溜め短縮', '集中', '匠', '斬れ味レベル+1'],
  },
  {
    id: 'gs_2',
    name: '轟大剣【王虎】',
    type: '大剣',
    attack: 1392,
    affinity: -15,
    slots: 1,
    sharpnessOrAmmo: 'デフォルト紫ゲージ',
    description: '匠不要でデフォルト紫ゲージを持つティガ大剣。匠を省いて抜刀術・集中・高級耳栓などを詰め込める優れもの。',
    matchingSkills: ['抜刀', '抜刀術', '溜め短縮', '集中', '聴覚保護', '高級耳栓'],
  },
  {
    id: 'gs_3',
    name: 'ブリュンヒルデ',
    type: '大剣',
    attack: 1296,
    affinity: 0,
    element: '龍 250',
    slots: 2,
    sharpnessOrAmmo: '紫（匠時）',
    description: 'スロット2と龍属性を備え、古龍戦や汎用大剣として非常にスキルが組みやすい優秀な名剣。',
    matchingSkills: ['抜刀', '抜刀術', '溜め短縮', '集中', '属性攻撃'],
  },

  // --- 太刀 ---
  {
    id: 'ls_1',
    name: 'ラストタキオン',
    type: '太刀',
    attack: 1296,
    affinity: 0,
    element: '龍 180',
    slots: 2,
    sharpnessOrAmmo: '紫（匠時）',
    description: '黒龍素材の太刀。高い攻撃力、龍属性、スロット2を備え、匠・業物装備と合わせることで古龍から大連続まで圧倒。',
    matchingSkills: ['匠', '斬れ味レベル+1', '斬れ味', '業物', '達人', '見切り'],
  },
  {
    id: 'ls_2',
    name: '夜刀【月影】',
    type: '太刀',
    attack: 1152,
    affinity: 50,
    slots: 2,
    sharpnessOrAmmo: 'デフォルト紫ゲージ',
    description: '素紫ゲージ、驚異の会心率50%、スロット2。匠が不要なため、見切り+3や高級耳栓、回避性能などの快適スキルをフルに盛れる名刀。',
    matchingSkills: ['達人', '見切り', '攻撃', '聴覚保護', '高級耳栓', '回避性能'],
  },
  {
    id: 'ls_3',
    name: '鬼哭斬破刀・真打',
    type: '太刀',
    attack: 1200,
    affinity: 0,
    element: '雷 540',
    slots: 1,
    sharpnessOrAmmo: '紫（匠時）',
    description: '雷属性太刀の頂点。ティガレックスやナルガクルガ、金銀火竜を圧倒的スピードで狩猟できる必携武器。',
    matchingSkills: ['匠', '斬れ味レベル+1', '属性攻撃', '業物'],
  },

  // --- ハンマー ---
  {
    id: 'hm_1',
    name: 'マグニチュード',
    type: 'ハンマー',
    attack: 1612,
    affinity: -15,
    slots: 1,
    sharpnessOrAmmo: '紫（匠時）',
    description: '全武器中トップクラスの攻撃力1612を誇る圧倒的破壊力の鎚。見切りや攻撃UP、匠とのシナジーで敵を瞬殺する。',
    matchingSkills: ['匠', '斬れ味レベル+1', '達人', '見切り', '攻撃', '聴覚保護'],
  },
  {
    id: 'hm_2',
    name: '角王鎚カオスオーダー',
    type: 'ハンマー',
    attack: 1508,
    affinity: 0,
    slots: 0,
    sharpnessOrAmmo: '長い紫（匠時）',
    description: 'マイナス会心がなく安定した高火力と、匠発動時の非常に長い紫ゲージが最大の武器。安定感No.1のG級ハンマー。',
    matchingSkills: ['匠', '斬れ味レベル+1', '攻撃', '耳栓', '高級耳栓', '回避性能'],
  },

  // --- 双剣 ---
  {
    id: 'db_1',
    name: '双影剣G',
    type: '双剣',
    attack: 350,
    affinity: 0,
    element: '氷 400',
    slots: 3,
    sharpnessOrAmmo: '紫（匠時）',
    description: '氷属性特化＋驚異のスロット3。ラージャンやディアブロスを粉砕するMHP2G屈指の超人気双剣。',
    matchingSkills: ['匠', '斬れ味レベル+1', '斬れ味', '業物', '強走', 'ランナー', '属性攻撃'],
  },
  {
    id: 'db_2',
    name: '双聖剣ギルドナイト',
    type: '双剣',
    attack: 350,
    affinity: 0,
    element: '水 300',
    slots: 2,
    sharpnessOrAmmo: '紫（匠時）',
    description: '美しい水属性の双剣。グラビモスやヴォルガノス、テオ・テスカトルなど強敵相手に絶大な威力を発揮。',
    matchingSkills: ['匠', '斬れ味レベル+1', '斬れ味', '業物', '研ぎ師', 'ランナー'],
  },
  {
    id: 'db_3',
    name: 'コウリュウノツガイ',
    type: '双剣',
    attack: 364,
    affinity: 0,
    element: '火 400',
    slots: 0,
    sharpnessOrAmmo: '紫（匠時）',
    description: '火属性双剣の頂点。ウカムルバスやオオナズチ、キリンなどを怒涛の乱舞で削り倒す。',
    matchingSkills: ['匠', '斬れ味レベル+1', '業物', '属性攻撃', 'ランナー'],
  },

  // --- ランス & ガンランス ---
  {
    id: 'lc_1',
    name: '暗黒槍【暗夜】',
    type: 'ランス',
    attack: 598,
    affinity: 50,
    slots: 2,
    sharpnessOrAmmo: 'デフォルト紫ゲージ',
    description: '素紫・会心50%・スロット2。回避性能や回避距離、ガード性能などのスキル構成に自由度を持たせられる神ランス。',
    matchingSkills: ['回避性能', '回避距離', 'ガード性能', '達人', '見切り'],
  },
  {
    id: 'gl_1',
    name: '大砲モロコシ',
    type: 'ガンランス',
    attack: 506,
    affinity: 0,
    slots: 3,
    sharpnessOrAmmo: '拡散型砲撃LV5',
    description: '砲撃LV5拡散型＋スロット3。砲術王＋増収などをつけて肉質無視の砲撃を乱射するだけでミラ系すら沈める伝説のネタにして最強兵器。',
    matchingSkills: ['砲術', '砲術王', 'ガード性能', 'ガード強化', '装填数'],
  },

  // --- ヘビィボウガン ---
  {
    id: 'hb_1',
    name: '夜砲【黒風】',
    type: 'ヘビィボウガン',
    attack: 372,
    affinity: 40,
    slots: 2,
    sharpnessOrAmmo: '貫通弾1~3各6発装填',
    description: '貫通ヘビィの頂点。会心率40%、リロードやや速い、反動やや小。貫通弾威力UPと最大数弾生産で超大型モンスターを瞬殺する。',
    matchingSkills: ['貫通弾強化', '貫通弾・貫通矢威力UP', '弾調合', '最大数弾生産', '達人', '回避距離'],
  },
  {
    id: 'hb_2',
    name: '老山龍砲・極',
    type: 'ヘビィボウガン',
    attack: 456,
    affinity: 0,
    slots: 1,
    sharpnessOrAmmo: '属性弾全種対応・通常LV2/3',
    description: '「自動装填ラツマツ」の代名詞。自動装填スキルと組み合わせることで、リロードなしで属性弾や通常弾を無反動で超連射する化け物銃。',
    matchingSkills: ['自動装填', '属性攻撃', '通常弾強化', '通常弾・連射矢威力UP', '回避距離'],
  },

  // --- ライトボウガン ---
  {
    id: 'lb_1',
    name: '阿武祖龍弩',
    type: 'ライトボウガン',
    attack: 360,
    affinity: 0,
    slots: 0,
    sharpnessOrAmmo: '火・水・雷・氷全属性弾速射',
    description: 'ルーツ素材で作る奇跡のボウガン。4属性弾すべてを3連速射可能。属性攻撃強化や自動装填と合わせ大連続狩猟を1挺で完全制覇。',
    matchingSkills: ['属性攻撃', '自動装填', '最大数弾生産', '連発数+1', '装填数'],
  },
  {
    id: 'lb_2',
    name: '幻獣筒【三ツ角】',
    type: 'ライトボウガン',
    attack: 348,
    affinity: 0,
    slots: 2,
    sharpnessOrAmmo: '通常弾LV2 5連速射',
    description: '通常弾LV2の5連速射を撃てるキリンライト。通常弾強化と合わせることで小型から弱点狙撃まで抜群の継続火力を誇る。',
    matchingSkills: ['通常弾強化', '通常弾・連射矢威力UP', '装填数', '攻撃'],
  },

  // --- 弓 ---
  {
    id: 'bw_1',
    name: '殲滅と破壊の剛弓',
    type: '弓',
    attack: 384,
    affinity: 0,
    element: '龍 220',
    slots: 1,
    sharpnessOrAmmo: '連射LV4（溜め3）',
    description: '通常弾・連射矢UP＋集中で弱点を正確に撃ち抜く連射弓の決定版。古龍や飛竜の頭を的確に破壊する。',
    matchingSkills: ['通常弾強化', '通常弾・連射矢威力UP', '溜め短縮', '集中', 'ランナー'],
  },
  {
    id: 'bw_2',
    name: '龍弓【天崩】',
    type: '弓',
    attack: 360,
    affinity: 0,
    element: '龍 220',
    slots: 0,
    sharpnessOrAmmo: '拡散LV5（溜め3）',
    description: '拡散矢の頂点。拡散矢強化と組み合わせ、大型の敵に密着して全弾ヒットさせることで、ウカムルバスやシェンガオレンを瞬殺可能。',
    matchingSkills: ['散弾強化', '散弾・拡散矢威力UP', '溜め短縮', '集中', '根性'],
  },
  {
    id: 'bw_3',
    name: '角王弓ゲイルホーン',
    type: '弓',
    attack: 372,
    affinity: 0,
    slots: 0,
    sharpnessOrAmmo: '貫通LV4（溜め3）',
    description: 'ディアブロス素材の強力な貫通弓。長大な体躯を持つヴォルガノスやグラビモス、ラオシャンロンを頭から尻尾まで貫く。',
    matchingSkills: ['貫通弾強化', '貫通弾・貫通矢威力UP', '溜め短縮', '集中', '装填数'],
  },
];

/**
 * Find recommended weapons that match any of the given active skills or target skill trees
 */
export function getMatchingWeapons(
  activeSkills: string[],
  hunterType?: 'blade' | 'gunner'
): RecommendedWeapon[] {
  const isGunner = hunterType === 'gunner';
  const gunnerTypes = ['ライトボウガン', 'ヘビィボウガン', '弓'];

  return RECOMMENDED_WEAPONS.filter((w) => {
    // Filter by hunter type if provided
    if (hunterType) {
      const isWeaponGunner = gunnerTypes.includes(w.type);
      if (isGunner && !isWeaponGunner) return false;
      if (!isGunner && isWeaponGunner) return false;
    }

    // Match if weapon shares any skill with activeSkills
    return w.matchingSkills.some((ms) =>
      activeSkills.some((as) => as.includes(ms) || ms.includes(as))
    );
  });
}
