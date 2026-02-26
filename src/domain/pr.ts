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

  const exerciseTypeMap = new Map(exercises.map((e) => [e.id, e.type ?? "weighted"]));

  for (const set of sets) {
    if (set.reps <= 0) continue;
    const type = exerciseTypeMap.get(set.exerciseId) ?? "weighted";

    if (type === "bodyweight" || type === "timed") {
      // Track best reps (bodyweight) or best duration in seconds (timed).
      const current = byExercise.get(set.exerciseId) ?? { maxWeightKg: 0, bestReps: 0, bestOneRm: 0 };
      byExercise.set(set.exerciseId, {
        ...current,
        bestReps: Math.max(current.bestReps, set.reps),
      });
    } else {
      if (set.weightKg <= 0) continue;
      const current = byExercise.get(set.exerciseId) ?? { maxWeightKg: 0, bestReps: 0, bestOneRm: 0 };
      const oneRm = estimateOneRepMax(set.weightKg, set.reps);
      byExercise.set(set.exerciseId, {
        maxWeightKg: Math.max(current.maxWeightKg, set.weightKg),
        bestReps: Math.max(current.bestReps, set.reps),
        bestOneRm: Math.max(current.bestOneRm, oneRm),
      });
    }
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

  // Weighted exercises sort by 1RM; bodyweight/timed sort by bestReps.
  result.sort((a, b) => {
    if (b.estimatedOneRmKg !== a.estimatedOneRmKg) return b.estimatedOneRmKg - a.estimatedOneRmKg;
    return b.bestReps - a.bestReps;
  });

  return result;
}

