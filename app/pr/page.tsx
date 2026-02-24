"use client";

import { useEffect, useMemo, useState } from "react";
import { createLocalWorkoutRepository } from "@/data/localRepository";
import { computeExercisePrs } from "@/domain/pr";
import type { SetEntry } from "@/domain/models";
import { getExerciseNameJa } from "@/lib/exerciseNames";

type ExercisePrRow = {
  id: string;
  name: string;
  bodyPart: string;
  maxWeightKg: number;
  bestReps: number;
  estimatedOneRmKg: number;
};

export default function PrPage() {
  const repo = useMemo(() => createLocalWorkoutRepository(), []);
  const [rows, setRows] = useState<ExercisePrRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [exercises, workoutsWithSets] = await Promise.all([
          repo.getExercises(),
          repo.listWorkoutsWithSets(),
        ]);
        const allSets: SetEntry[] = workoutsWithSets.flatMap((w) => w.sets);
        const prs = computeExercisePrs(exercises, allSets);
        setRows(
          prs.map((pr) => ({
            id: pr.exercise.id,
            name: pr.exercise.name,
            bodyPart: pr.exercise.bodyPart,
            maxWeightKg: pr.maxWeightKg,
            bestReps: pr.bestReps,
            estimatedOneRmKg: pr.estimatedOneRmKg,
          })),
        );
      } catch {
        setError("PR 情報の読み込みに失敗しました。");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [repo]);

  if (loading) {
    return (
      <div className="space-y-2 text-sm text-zinc-500">
        PR 情報を読み込み中です…
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

  if (rows.length === 0) {
    return (
      <div className="space-y-2 text-sm text-zinc-500">
        まだ記録がありません。トレーニングを記録すると、ここにベストが表示されます。
      </div>
    );
  }

  const bodyPartJa: Record<string, string> = {
    chest: "胸",
    back: "背中",
    legs: "脚",
    shoulders: "肩",
    biceps: "腕",
    triceps: "腕",
    core: "体幹",
  };

  return (
    <section className="space-y-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-100 dark:bg-zinc-900 dark:ring-zinc-800">
      <header className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          種目別ベスト記録
        </h2>
        <span className="text-[0.7rem] text-zinc-500">
          推定1RM＝重量×(1＋回数÷30)
        </span>
      </header>
      <div className="space-y-2 text-xs">
        {rows.map((row) => (
          <div
            key={row.id}
            className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2 dark:bg-zinc-800/80"
          >
            <div className="flex flex-col">
              <span className="text-[0.75rem] font-semibold text-zinc-900 dark:text-zinc-50">
                {getExerciseNameJa(row.id, row.name)}
              </span>
              <span className="text-[0.7rem] text-zinc-500">
                {bodyPartJa[row.bodyPart] ?? row.bodyPart}
              </span>
            </div>
            <div className="text-right">
              <div className="text-[0.7rem] text-zinc-500">
                最高重量:{" "}
                <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                  {row.maxWeightKg.toFixed(1)}kg
                </span>
              </div>
              <div className="text-[0.7rem] text-zinc-500">
                最高回数:{" "}
                <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                  {row.bestReps}回
                </span>
              </div>
              <div className="text-[0.7rem] text-emerald-600 dark:text-emerald-400">
                推定1RM:{" "}
                <span className="font-semibold">
                  {row.estimatedOneRmKg.toFixed(1)}kg
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

