import { describe, expect, it } from "vitest";
import {
  STEP_OPTIONS,
  getDefaultStep,
  isDumbbellExercise,
} from "./weightStep";

describe("isDumbbellExercise", () => {
  it("matches 'Dumbbell' (mixed case)", () => {
    expect(isDumbbellExercise("Dumbbell Curl")).toBe(true);
    expect(isDumbbellExercise("dumbbell fly")).toBe(true);
    expect(isDumbbellExercise("DUMBBELL PRESS")).toBe(true);
  });

  it("matches 'DB' as whole word", () => {
    expect(isDumbbellExercise("DB Row")).toBe(true);
    expect(isDumbbellExercise("db curl")).toBe(true);
  });

  it("does not match 'DB' as substring", () => {
    expect(isDumbbellExercise("ADBL exercise")).toBe(false);
  });

  it("matches ダンベル", () => {
    expect(isDumbbellExercise("ダンベルカール")).toBe(true);
    expect(isDumbbellExercise("ダンベル フライ")).toBe(true);
  });

  it("returns false for barbell/machine exercises", () => {
    expect(isDumbbellExercise("Bench Press")).toBe(false);
    expect(isDumbbellExercise("Barbell Row")).toBe(false);
    expect(isDumbbellExercise("Leg Press")).toBe(false);
    expect(isDumbbellExercise("Pull-Up")).toBe(false);
    expect(isDumbbellExercise("Overhead Press")).toBe(false);
  });
});

describe("getDefaultStep", () => {
  it("returns 2 for dumbbell exercises", () => {
    expect(getDefaultStep("Dumbbell Curl")).toBe(2);
    expect(getDefaultStep("DB Row")).toBe(2);
    expect(getDefaultStep("ダンベルフライ")).toBe(2);
  });

  it("returns 2.5 for barbell/machine exercises", () => {
    expect(getDefaultStep("Bench Press")).toBe(2.5);
    expect(getDefaultStep("Back Squat")).toBe(2.5);
    expect(getDefaultStep("Lat Pulldown")).toBe(2.5);
  });

  it("returns values that are members of STEP_OPTIONS", () => {
    const stepSet = new Set<number>(STEP_OPTIONS);
    expect(stepSet.has(getDefaultStep("Dumbbell Curl"))).toBe(true);
    expect(stepSet.has(getDefaultStep("Bench Press"))).toBe(true);
  });
});

describe("STEP_OPTIONS", () => {
  it("contains [1, 2, 2.5] in order", () => {
    expect(STEP_OPTIONS).toEqual([1, 2, 2.5]);
  });
});
