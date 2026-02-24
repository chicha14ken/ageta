import type { Exercise, Workout, SetEntry } from "../domain/models";
import type { WorkoutRepository, WorkoutWithSets } from "./repository";
import { stores, withStore } from "./db";

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return (
    Date.now().toString(36) + Math.random().toString(36).substring(2, 10)
  );
}

function assertClient() {
  if (typeof window === "undefined") {
    throw new Error("WorkoutRepository can only be used in the browser");
  }
}

export class LocalWorkoutRepository implements WorkoutRepository {
  async getExercises(): Promise<Exercise[]> {
    assertClient();
    return withStore(stores.EXERCISES, "readonly", (store) => {
      return new Promise<Exercise[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result as Exercise[]);
        request.onerror = () =>
          reject(request.error ?? new Error("Failed to load exercises"));
      });
    });
  }

  async createWorkout(input: {
    startedAt: string;
    note?: string;
    bodyweightKg?: number;
  }): Promise<Workout> {
    assertClient();
    const workout: Workout = {
      id: generateId(),
      startedAt: input.startedAt,
      note: input.note,
      bodyweightKg: input.bodyweightKg,
    };

    await withStore(stores.WORKOUTS, "readwrite", (store) => {
      return new Promise<void>((resolve, reject) => {
        const request = store.add(workout);
        request.onsuccess = () => resolve();
        request.onerror = () =>
          reject(request.error ?? new Error("Failed to create workout"));
      });
    });

    return workout;
  }

  async updateWorkout(workout: Workout): Promise<void> {
    assertClient();
    await withStore(stores.WORKOUTS, "readwrite", (store) => {
      return new Promise<void>((resolve, reject) => {
        const request = store.put(workout);
        request.onsuccess = () => resolve();
        request.onerror = () =>
          reject(request.error ?? new Error("Failed to update workout"));
      });
    });
  }

  async getWorkout(id: string): Promise<Workout | null> {
    assertClient();
    return withStore(stores.WORKOUTS, "readonly", (store) => {
      return new Promise<Workout | null>((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => {
          resolve((request.result as Workout | undefined) ?? null);
        };
        request.onerror = () =>
          reject(request.error ?? new Error("Failed to load workout"));
      });
    });
  }

  async listWorkouts(): Promise<Workout[]> {
    assertClient();
    return withStore(stores.WORKOUTS, "readonly", (store) => {
      return new Promise<Workout[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result as Workout[]);
        request.onerror = () =>
          reject(request.error ?? new Error("Failed to load workouts"));
      });
    });
  }

  async addSet(entry: Omit<SetEntry, "id">): Promise<SetEntry> {
    assertClient();
    const set: SetEntry = { ...entry, id: generateId() };

    await withStore(stores.SETS, "readwrite", (store) => {
      return new Promise<void>((resolve, reject) => {
        const request = store.add(set);
        request.onsuccess = () => resolve();
        request.onerror = () =>
          reject(request.error ?? new Error("Failed to add set"));
      });
    });

    return set;
  }

  async listSetsForWorkout(workoutId: string): Promise<SetEntry[]> {
    assertClient();
    return withStore(stores.SETS, "readonly", (store) => {
      return new Promise<SetEntry[]>((resolve, reject) => {
        const index = store.index("by_workoutId");
        const request = index.getAll(IDBKeyRange.only(workoutId));
        request.onsuccess = () => resolve(request.result as SetEntry[]);
        request.onerror = () =>
          reject(request.error ?? new Error("Failed to load sets"));
      });
    });
  }

  async getLastSetForExercise(exerciseId: string): Promise<SetEntry | null> {
    assertClient();
    return withStore(stores.SETS, "readonly", (store) => {
      return new Promise<SetEntry | null>((resolve, reject) => {
        const index = store.index("by_exerciseId");
        const request = index.getAll(IDBKeyRange.only(exerciseId));
        request.onsuccess = () => {
          const sets = (request.result as SetEntry[]) ?? [];
          if (sets.length === 0) {
            resolve(null);
            return;
          }
          // Most recent set is assumed to be the last inserted one.
          // Since we use random IDs, we sort by workout startedAt + order for better stability.
          sets.sort((a, b) => a.order - b.order);
          resolve(sets[sets.length - 1] ?? null);
        };
        request.onerror = () =>
          reject(
            request.error ?? new Error("Failed to load last set for exercise"),
          );
      });
    });
  }

  async listWorkoutsWithSets(): Promise<WorkoutWithSets[]> {
    assertClient();
    const [workouts, allSets] = await Promise.all([
      this.listWorkouts(),
      withStore(stores.SETS, "readonly", (store) => {
        return new Promise<SetEntry[]>((resolve, reject) => {
          const request = store.getAll();
          request.onsuccess = () => resolve(request.result as SetEntry[]);
          request.onerror = () =>
            reject(request.error ?? new Error("Failed to load sets"));
        });
      }),
    ]);

    const setsByWorkout = new Map<string, SetEntry[]>();
    for (const set of allSets) {
      const arr = setsByWorkout.get(set.workoutId) ?? [];
      arr.push(set);
      setsByWorkout.set(set.workoutId, arr);
    }

    const result: WorkoutWithSets[] = workouts.map((workout) => ({
      workout,
      sets: (setsByWorkout.get(workout.id) ?? []).slice().sort((a, b) => a.order - b.order),
    }));

    // Sort workouts by startedAt descending (most recent first).
    result.sort(
      (a, b) =>
        new Date(b.workout.startedAt).getTime() -
        new Date(a.workout.startedAt).getTime(),
    );

    return result;
  }
}

export function createLocalWorkoutRepository(): WorkoutRepository {
  return new LocalWorkoutRepository();
}

