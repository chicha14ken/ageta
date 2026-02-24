"use client";

import { useState } from "react";

export type WeightChip = {
  id: string;
  label: string;
  weightKg: number;
  /**
   * If provided, called on click instead of the default onChange(weightKg).
   * Use this when clicking a chip should also update other fields (e.g. reps).
   */
  onSelect?: () => void;
};

const MAX_KG = 500;

type Props = {
  value: number;
  onChange: (value: number) => void;
  /** Increment/decrement step in kg. Defaults to 2.5. */
  step?: number;
  chips?: WeightChip[];
};

export function WeightInput({ value, onChange, step = 2.5, chips = [] }: Props) {
  const [draft, setDraft] = useState(() => String(value));
  // Tracks the last numeric value this component emitted via onChange.
  // When the parent's value diverges from this (chip click, adjust button,
  // external reset), we sync draft to the new value.
  const [committedValue, setCommittedValue] = useState(value);

  // External sync — React's "adjusting state based on props" pattern.
  // Runs during render (not in an effect) so there is no extra paint cycle.
  // When the user is typing, handleChange keeps committedValue === value, so
  // this block is never entered for locally-driven changes.
  if (committedValue !== value) {
    setCommittedValue(value);
    setDraft(String(value));
  }

  const commit = () => {
    const parsed = parseFloat(draft.replace(",", "."));
    if (Number.isFinite(parsed)) {
      const clamped = Math.min(MAX_KG, Math.max(0, parsed));
      setDraft(String(clamped));
      setCommittedValue(clamped);
      onChange(clamped);
    } else {
      // Invalid text — revert display to the last confirmed value.
      setDraft(String(value));
    }
  };

  const handleChange = (raw: string) => {
    // Normalize comma → dot so European/mobile decimal keyboards work.
    const normalized = raw.replace(",", ".");
    setDraft(normalized);
    const parsed = parseFloat(normalized);
    if (Number.isFinite(parsed)) {
      const clamped = Math.min(MAX_KG, Math.max(0, parsed));
      // Keep committedValue in lockstep with what we emit so the external
      // sync (the if-block above) does not overwrite the draft mid-typing.
      setCommittedValue(clamped);
      onChange(clamped);
    }
    // If parsed is NaN (e.g. "", ".") we update draft only — onChange is not
    // called and committedValue stays at the last valid value, so the
    // external sync correctly does nothing.
  };

  const adjust = (delta: number) => {
    const next = Math.min(MAX_KG, Math.max(0, value + delta));
    onChange(next);
    // committedValue is intentionally NOT updated here. On the next render,
    // committedValue !== value will be true and the external sync will fire,
    // updating draft to the new value. This also handles the iOS case where
    // blur may not fire before the tap handler.
  };

  return (
    <div className="space-y-1.5">
      <div className="inline-flex w-full items-center gap-2 rounded-xl bg-zinc-100 p-1.5 dark:bg-zinc-800">
        <button
          type="button"
          onClick={() => adjust(-step)}
          className="h-8 rounded-lg bg-white px-2 text-xs font-medium text-zinc-800 shadow-sm ring-1 ring-zinc-200 transition active:scale-[0.97] dark:bg-zinc-900 dark:text-zinc-100 dark:ring-zinc-700"
        >
          -{step}
        </button>
        <input
          type="text"
          inputMode="decimal"
          pattern="[0-9]*[.,]?[0-9]*"
          autoComplete="off"
          className="h-8 flex-1 rounded-lg border-0 bg-transparent text-center text-sm font-semibold text-zinc-900 outline-none dark:text-zinc-50"
          value={draft}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              commit();
              (e.target as HTMLInputElement).blur();
            }
          }}
        />
        <button
          type="button"
          onClick={() => adjust(step)}
          className="h-8 rounded-lg bg-white px-2 text-xs font-medium text-zinc-800 shadow-sm ring-1 ring-zinc-200 transition active:scale-[0.97] dark:bg-zinc-900 dark:text-zinc-100 dark:ring-zinc-700"
        >
          +{step}
        </button>
      </div>
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {chips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() =>
                chip.onSelect ? chip.onSelect() : onChange(chip.weightKg)
              }
              className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-0.5 text-[0.7rem] text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
