/**
 * 種目ID → 日本語表示名（ライトユーザー向け）
 */
export const EXERCISE_NAME_JA: Record<string, string> = {
  "bench-press": "ベンチプレス",
  "incline-bench": "インクラインベンチプレス",
  "dumbbell-fly": "ダンベルフライ",
  "push-up": "腕立て伏せ",
  deadlift: "デッドリフト",
  "barbell-row": "バーベルロー",
  "pull-up": "懸垂",
  "lat-pulldown": "ラットプルダウン",
  "back-squat": "バックスクワット",
  "front-squat": "フロントスクワット",
  "leg-press": "レッグプレス",
  "leg-curl": "レッグカール",
  "leg-extension": "レッグエクステンション",
  "calf-raise": "カーフレイズ",
  "hip-thrust": "ヒップスラスト",
  "overhead-press": "ショルダープレス",
  "push-press": "プッシュプレス",
  "lateral-raise": "サイドレイズ",
  "barbell-curl": "バーベルカール",
  "dumbbell-curl": "ダンベルカール",
  "hammer-curl": "ハンマーカール",
  "tricep-extension": "トライセプスエクステンション",
  dip: "ディップス",
  "skull-crusher": "スカルクラッシャー",
  "ab-wheel": "アブローラー",
  plank: "プランク",
  "leg-raise": "レッグレイズ",
};

export function getExerciseNameJa(id: string, fallback: string): string {
  return EXERCISE_NAME_JA[id] ?? fallback;
}
