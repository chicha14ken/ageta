"use client";

import { useEffect, useMemo, useState } from "react";
import { createLocalWorkoutRepository } from "@/data/localRepository";
import type { WorkoutWithSets } from "@/data/repository";
import type { Exercise } from "@/domain/models";
import { getExerciseNameJa } from "@/lib/exerciseNames";

type GroupedWorkouts = {
  dateLabel: string;
  workouts: WorkoutWithSets[];
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

export default function HistoryPage() {
  const repo = useMemo(() => createLocalWorkoutRepository(), []);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutWithSets[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [exList, withSets] = await Promise.all([
          repo.getExercises(),
          repo.listWorkoutsWithSets(),
        ]);
        setExercises(exList);
        setWorkouts(withSets);
      } catch {
        setError("履歴の読み込みに失敗しました。");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [repo]);

  const groups: GroupedWorkouts[] = useMemo(() => {
    const byDate = new Map<string, WorkoutWithSets[]>();
    for (const w of workouts) {
      const dateKey = w.workout.startedAt.slice(0, 10);
      const arr = byDate.get(dateKey) ?? [];
      arr.push(w);
      byDate.set(dateKey, arr);
    }
    return Array.from(byDate.entries())
      .sort(([a], [b]) => (a > b ? -1 : 1))
      .map(([dateKey, list]) => ({
        dateLabel: formatDate(dateKey),
        workouts: list,
      }));
  }, [workouts]);

  const getExerciseName = (id: string): string => {
    const ex = exercises.find((e) => e.id === id);
    return ex ? getExerciseNameJa(ex.id, ex.name) : "（不明）";
  };

  if (loading) {
    return (
      <div className="space-y-2 text-sm text-zinc-500">
        履歴を読み込み中です…
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2 text-sm text-red-500" role="alert">
        {error}
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="space-y-2 text-sm text-zinc-500">
        まだワークアウト履歴がありません。「今日」タブから記録を始めましょう。
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <section
          key={group.dateLabel}
          className="space-y-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-100 dark:bg-zinc-900 dark:ring-zinc-800"
        >
          <header className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {group.dateLabel}
            </h2>
            <span className="text-xs text-zinc-500">
              {group.workouts.length} 回
            </span>
          </header>
          <div className="space-y-2">
            {group.workouts.map((item) => {
              const isExpanded = expandedId === item.workout.id;
              const totalSets = item.sets.length;
              return (
                <button
                  type="button"
                  key={item.workout.id}
                  onClick={() =>
                    setExpandedId((prev) =>
                      prev === item.workout.id ? null : item.workout.id,
                    )
                  }
                  className="w-full rounded-xl bg-zinc-50 px-3 py-2 text-left text-xs shadow-sm ring-1 ring-zinc-100 transition active:scale-[0.99] dark:bg-zinc-800/80 dark:ring-zinc-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[0.7rem] text-zinc-500">
                        セット {totalSets}
                      </span>
                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-50">
                        {new Date(
                          item.workout.startedAt,
                        ).toLocaleTimeString("ja-JP", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {item.workout.bodyweightKg != null &&
                        item.workout.bodyweightKg > 0 && (
                          <span className="text-[0.7rem] text-zinc-500">
                            体重: {item.workout.bodyweightKg}kg
                          </span>
                        )}
                    </div>
                    <span className="text-[0.7rem] text-zinc-500">
                      {isExpanded ? "閉じる" : "詳細"}
                    </span>
                  </div>
                  {isExpanded && (
                    <ul className="mt-2 space-y-1.5">
                      {item.sets.map((set) => (
                        <li
                          key={set.id}
                          className="flex items-center justify-between rounded-lg bg-white/60 px-2.5 py-1.5 dark:bg-zinc-900/80"
                        >
                          <div className="flex flex-col">
                            <span className="text-[0.7rem] font-medium text-zinc-600 dark:text-zinc-300">
                              {getExerciseName(set.exerciseId)}
                            </span>
                            <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                              {set.weightKg}kg × {set.reps}回
                            </span>
                          </div>
                          <span className="text-[0.7rem] text-zinc-500">
                            #{set.order + 1}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

