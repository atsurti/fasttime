import React, { useState } from "react";
import { timeInputValue, timeValueToDate } from "@/lib/fasting";

export default function AdjustStart({ startedAt, onUpdate, fastingHours }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(() => timeInputValue(startedAt));

  if (!open) {
    return (
      <button
        onClick={() => {
          setValue(timeInputValue(startedAt));
          setOpen(true);
        }}
        className="mt-6 text-[11px] uppercase tracking-[0.26em] text-white/35 transition hover:text-white/70"
      >
        Change start time
      </button>
    );
  }

  return (
    <div className="mt-6 flex w-full items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-2 pl-4">
      <input
        type="time"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="tnum flex-1 bg-transparent text-sm text-white/85 outline-none [color-scheme:dark]"
      />
      <button
        onClick={() => {
          onUpdate(timeValueToDate(value, new Date(), fastingHours));
          setOpen(false);
        }}
        className="rounded-xl bg-white/10 px-4 py-2 text-xs text-white/90 transition hover:bg-white/20"
      >
        Update
      </button>
    </div>
  );
}