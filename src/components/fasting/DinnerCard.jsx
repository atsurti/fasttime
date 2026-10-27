import React, { useState } from "react";
import { timeInputValue, timeValueLabel, timeValueToDate } from "@/lib/fasting";

export default function DinnerCard({ headline, subline, onLog, defaultTime, fastingHours }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [value, setValue] = useState(() => defaultTime || timeInputValue(new Date()));

  return (
    <div className="mt-8 w-full rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
      <p className="font-display text-2xl leading-tight text-white/95">{headline}</p>
      <p className="mt-1.5 text-sm text-white/45">{subline}</p>

      {pickerOpen ? (
        <div className="mt-6">
          <label className="text-[11px] uppercase tracking-[0.28em] text-white/35" htmlFor="dinner-time">
            When did you finish?
          </label>
          {defaultTime ? (
            <p className="mt-1.5 text-xs text-white/30">
              Usual dinner · {timeValueLabel(defaultTime)}
            </p>
          ) : null}
          <input
            id="dinner-time"
            type="time"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="tnum mt-3 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-lg text-white/[0.92] outline-none [color-scheme:dark] focus:border-white/30"
          />
          <div className="mt-3 grid grid-cols-2 gap-3">
            <button
              onClick={() => setPickerOpen(false)}
              className="rounded-2xl border border-white/10 px-4 py-3.5 text-sm text-white/60 transition hover:border-white/25 hover:text-white/85"
            >
              Back
            </button>
            <button
              onClick={() => onLog(timeValueToDate(value, new Date(), fastingHours))}
              className="rounded-2xl bg-gradient-to-br from-[#F3B573] to-[#DE7F42] px-4 py-3.5 text-sm font-medium text-[#2A1405] transition active:scale-[0.98]"
            >
              Start fasting
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={() => onLog(new Date())}
            className="rounded-2xl bg-gradient-to-br from-[#F3B573] to-[#DE7F42] px-4 py-3.5 text-sm font-medium text-[#2A1405] transition active:scale-[0.98]"
          >
            Just now
          </button>
          <button
            onClick={() => {
              setValue(defaultTime || timeInputValue(new Date()));
              setPickerOpen(true);
            }}
            className="rounded-2xl border border-white/10 px-4 py-3.5 text-sm text-white/70 transition hover:border-white/25 hover:text-white/95"
          >
            Earlier
          </button>
        </div>
      )}
    </div>
  );
}