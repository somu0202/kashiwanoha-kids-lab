// SMC-Kids 測定項目の定義
export const SMC_CATEGORIES = {
  shuttle_run: {
    label: '10m折り返し走（合計40m）',
    key: 'shuttle_run_sec',
    unit: '秒',
    description: '10mを2往復する合計40mのシャトルラン',
    min: 5.0,
    max: 60.0,
    icon: '🏃‍♂️',
  },
  paper_ball_throw: {
    label: '紙ボール投げ',
    key: 'paper_ball_throw_m',
    unit: 'm',
    description: 'A4用紙5枚で作成した紙ボールの遠投距離',
    note: '※ A4用紙×5枚で作成する紙ボールを使用',
    min: 0.1,
    max: 30.0,
    icon: '📄',
  },
} as const

export type SMCCategory = keyof typeof SMC_CATEGORIES

// 紙ボールの作り方説明
export const PAPER_BALL_INSTRUCTIONS = `
【紙ボールの作成方法】
1. A4用紙を5枚用意します
2. 1枚目をくしゃくしゃに丸めます
3. 残り4枚で1枚目を包むように巻いていきます
4. テープなどで固定せず、紙だけで球体を作ります
5. 直径約8-10cmの球体が完成します
`
