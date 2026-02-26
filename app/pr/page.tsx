"use client";

import { useEffect, useMemo, useState } from "react";
import { Trophy } from "lucide-react";
import { createLocalWorkoutRepository } from "@/data/localRepository";
import { computeExercisePrs } from "@/domain/pr";
import type { SetEntry } from "@/domain/models";
import { getExerciseNameJa } from "@/lib/exerciseNames";

type ExercisePrRow = {
  id: string;
  name: string;
  bodyPart: string;
  exerciseType?: "weighted" | "bodyweight" | "timed";
  maxWeightKg: number;
  bestReps: number;
  estimatedOneRmKg: number;
};

const BODY_PART_JA: Record<string, string> = {
  chest: "胸",
  back: "背中",
  legs: "脚",
  shoulders: "肩",
  biceps: "腕",
  triceps: "腕",
  core: "体幹",
  calves: "脚",
  glutes: "脚",
  "posterior-chain": "脚",
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
            exerciseType: pr.exercise.type,
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

  /** Precompute rank (1-based) among weighted exercises only */
  const weightedRankMap = useMemo(() => {
    const map = new Map<string, number>();
    let r = 0;
    for (const row of rows) {
      if (!row.exerciseType || row.exerciseType === "weighted") {
        r++;
        map.set(row.id, r);
      }
    }
    return map;
  }, [rows]);

  const hasWeighted = rows.some(
    (r) => !r.exerciseType || r.exerciseType === "weighted",
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-6 pt-12 pb-4">
        <p className="text-[11px] font-medium text-stone tracking-[0.5px] uppercase">
          Personal Records
        </p>
        <h1 className="mt-1 text-[26px] font-black text-charcoal tracking-[-0.8px]">
          PR
        </h1>
      </div>

      {loading && (
        <div className="px-6 text-[13px] text-stone">読み込み中...</div>
      )}
      {error && (
        <div className="px-6 text-[13px] text-red-500">{error}</div>
      )}

      {!loading && !error && rows.length === 0 && (
        <div className="px-6 py-8 text-center">
          <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-linen flex items-center justify-center">
            <Trophy size={24} strokeWidth={2} style={{ stroke: "#C4975A" }} />
          </div>
          <p className="text-[13px] text-stone">まだ記録がありません。</p>
          <p className="text-[12px] text-pale mt-1">
            トレーニングを記録すると、ここにベストが表示されます。
          </p>
        </div>
      )}

      {!loading && !error && rows.length > 0 && (
        <div className="px-5 pb-6">
          {hasWeighted && (
            <p className="text-[10px] text-pale mb-3">
              推定1RM ＝ 重量 × (1 ＋ 回数 ÷ 30)
            </p>
          )}
          <div className="space-y-2">
            {rows.map((row) => {
              const isWeighted =
                !row.exerciseType || row.exerciseType === "weighted";
              const rank = isWeighted ? (weightedRankMap.get(row.id) ?? null) : null;

              return (
                <div
                  key={row.id}
                  className="flex items-center gap-3 rounded-2xl border border-rim bg-card px-4 py-3.5"
                  style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                >
                  {/* Rank badge — top 3 weighted exercises */}
                  {rank !== null && rank <= 3 ? (
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[12px] font-black"
                      style={{
                        background:
                          rank === 1
                            ? "#FBF5EE"
                            : rank === 2
                              ? "#F5F5F5"
                              : "#FEF3EC",
                        color:
                          rank === 1
                            ? "#C4975A"
                            : rank === 2
                              ? "#9E9E9E"
                              : "#CD7F32",
                      }}
                    >
                      {rank}
                    </div>
                  ) : (
                    <div className="w-7 h-7 shrink-0" />
                  )}

                  {/* Name + sub info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-charcoal truncate">
                      {getExerciseNameJa(row.id, row.name)}
                    </p>
                    <p className="text-[11px] text-stone mt-0.5">
                      {BODY_PART_JA[row.bodyPart] ?? row.bodyPart}
                      {row.exerciseType === "bodyweight" && (
                        <> · 自重 × 最高 {row.bestReps}回</>
                      )}
                      {row.exerciseType === "timed" && (
                        <> · 最長 {row.bestReps}秒</>
                      )}
                      {isWeighted && (
                        <>
                          {" "}
                          · 最高 {row.maxWeightKg.toFixed(1)}kg × {row.bestReps}回
                        </>
                      )}
                    </p>
                  </div>

                  {/* Right: type-aware metric */}
                  {row.exerciseType === "bodyweight" ? (
                    <div className="text-right shrink-0">
                      <p className="text-[11px] text-stone">最高回数</p>
                      <p className="text-[18px] font-black text-sage tracking-[-0.5px]">
                        {row.bestReps}
                        <span className="text-[12px] font-semibold">回</span>
                      </p>
                    </div>
                  ) : row.exerciseType === "timed" ? (
                    <div className="text-right shrink-0">
                      <p className="text-[11px] text-stone">最長時間</p>
                      <p className="text-[18px] font-black text-sage tracking-[-0.5px]">
                        {row.bestReps}
                        <span className="text-[12px] font-semibold">秒</span>
                      </p>
                    </div>
                  ) : (
                    <div className="text-right shrink-0">
                      <p className="text-[11px] text-stone">推定1RM</p>
                      <p className="text-[18px] font-black text-terracotta tracking-[-0.5px]">
                        {row.estimatedOneRmKg.toFixed(0)}
                        <span className="text-[12px] font-semibold">kg</span>
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
