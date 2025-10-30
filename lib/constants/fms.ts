// 7つの基礎動作の定義
export const FMS_CATEGORIES = {
  run: {
    label: '走る',
    key: 'run',
    description: '基本的な走行動作',
    icon: '🏃',
  },
  balance_beam: {
    label: '平均台移動',
    key: 'balance_beam',
    description: 'バランスを保ちながらの移動',
    icon: '🤸',
  },
  jump: {
    label: '跳ぶ',
    key: 'jump',
    description: '垂直・水平ジャンプ',
    icon: '🦘',
  },
  throw: {
    label: '投げる',
    key: 'throw',
    description: 'オーバーハンドスロー',
    icon: '⚾',
  },
  catch: {
    label: '捕る',
    key: 'catch',
    description: 'ボールキャッチング',
    icon: '🥎',
  },
  dribble: {
    label: 'つく',
    key: 'dribble',
    description: 'ボールドリブル',
    icon: '⛹️',
  },
  roll: {
    label: '転がる',
    key: 'roll',
    description: '前転・後転',
    icon: '🤾',
  },
} as const

export type FMSCategory = keyof typeof FMS_CATEGORIES

// 到達段階の説明（1-5スケール）
export const FMS_STAGE_DESCRIPTIONS = {
  1: '初期段階：動作の基本形がまだ確立されていない',
  2: '発展段階：動作の基本形が現れ始めている',
  3: '成熟段階：動作の基本形が確立されている',
  4: '洗練段階：動作が滑らかで効率的になっている',
  5: '習熟段階：動作が自動化され、応用が可能',
} as const

// レーダーチャート用の順序配列
export const FMS_ORDER: FMSCategory[] = [
  'run',
  'balance_beam',
  'jump',
  'throw',
  'catch',
  'dribble',
  'roll',
]

// FMSスコアのカラースキーム
export const FMS_COLORS = {
  primary: '#0ea5e9',
  secondary: '#06b6d4',
  tertiary: '#8b5cf6',
  grid: '#e2e8f0',
  text: '#111827',
} as const
