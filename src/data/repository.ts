import type { Exercise, Workout, SetEntry } from "../domain/models";

export type WorkoutWithSets = {
  workout: Workout;
  sets: SetEntry[];
};

export interface WorkoutRepository {
  getExercises(): Promise<Exercise[]>;

  createWorkout(input: {
    startedAt: string;
    note?: string;
    bodyweightKg?: number;
  }): Promise<Workout>;
  updateWorkout(workout: Workout): Promise<void>;
  getWorkout(id: string): Promise<Workout | null>;
  listWorkouts(): Promise<Workout[]>;

  addSet(entry: Omit<SetEntry, "id">): Promise<SetEntry>;
  listSetsForWorkout(workoutId: string): Promise<SetEntry[]>;

  /**
   * Returns the most recent set for the given exercise across all workouts.
   */
  getLastSetForExercise(exerciseId: string): Promise<SetEntry | null>;

  /**
   * Convenience method to fetch all workouts with their associated sets.
   */
  listWorkoutsWithSets(): Promise<WorkoutWithSets[]>;
}

