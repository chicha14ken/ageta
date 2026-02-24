export const STEP_OPTIONS = [1, 2, 2.5] as const;
export type StepOption = (typeof STEP_OPTIONS)[number];

/**
 * Returns true if the exercise name implies it uses dumbbells.
 * Matches: "DB", "Dumbbell", "ダンベル" (case-insensitive for ASCII part).
 */
export function isDumbbellExercise(name: string): boolean {
  return /\bDB\b|dumbbell|ダンベル/i.test(name);
}

/**
 * Returns the default weight step for an exercise.
 * Dumbbell exercises change 1 kg per hand → 2 kg total.
 * Barbell/machine exercises use 2.5 kg plates → 2.5 kg total.
 */
export function getDefaultStep(name: string): StepOption {
  return isDumbbellExercise(name) ? 2 : 2.5;
}
