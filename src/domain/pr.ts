import type { Exercise, SetEntry } from "./models";

export type ExercisePr = {
  exercise: Exercise;
  maxWeightKg: number;
  bestReps: number;
  estimatedOneRmKg: number;
};

export function estimateOneRepMax(weightKg: number, reps: number): number {
  if (weightKg <= 0 || reps <= 0) return 0;
  const oneRm = weightKg * (1 + reps / 30);
  // Round to nearest 0.5kg for display.
  return Math.round(oneRm * 2) / 2;
}

export function computeExercisePrs(
  exercises: Exercise[],
  sets: SetEntry[],
): ExercisePr[] {
  const byExercise = new Map<
    string,
    { maxWeightKg: number; bestReps: number; bestOneRm: number }
  >();

  for (const set of sets) {
    if (set.weightKg <= 0 || set.reps <= 0) continue;
    const current = byExercise.get(set.exerciseId) ?? {
      maxWeightKg: 0,
      bestReps: 0,
      bestOneRm: 0,
    };

    const oneRm = estimateOneRepMax(set.weightKg, set.reps);

    const maxWeightKg = Math.max(current.maxWeightKg, set.weightKg);
    const bestReps = Math.max(current.bestReps, set.reps);
    const bestOneRm = Math.max(current.bestOneRm, oneRm);

    byExercise.set(set.exerciseId, { maxWeightKg, bestReps, bestOneRm });
  }

  const result: ExercisePr[] = [];

  for (const exercise of exercises) {
    const stats = byExercise.get(exercise.id);
    if (!stats) continue;

    result.push({
      exercise,
      maxWeightKg: stats.maxWeightKg,
      bestReps: stats.bestReps,
      estimatedOneRmKg: stats.bestOneRm,
    });
  }

  // Sort by estimated 1RM descending.
  result.sort((a, b) => b.estimatedOneRmKg - a.estimatedOneRmKg);

  return result;
}

