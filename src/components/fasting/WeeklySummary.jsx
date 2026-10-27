import React from "react";
import { formatHours } from "@/lib/fasting";

export default function WeeklySummary({ days, totalHours }) {
  const scale = Math.max(...days.map((day) => day.hours), 1);

  return (
    <section className="mt-10 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-[10px] uppercase tracking-[0.34em] text-white/30">This week</h2>
        <p className="tnum text-sm text-white/45">
          <span className="text-white/90">{formatHours(totalHours)}</span> total
        </p>
      </div>

      <div className="mt-6 flex items-end gap-2">
        {days.map((day) => (
          <div key={day.key} className="flex flex-1 flex-col items-center gap-2">
            <span
              className={`tnum text-[10px] ${day.hours > 0 ? "text-white/70" : "text-white/20"}`}
            >
              {day.hours > 0 ? formatHours(day.hours) : "–"}
            </span>
            <div className="flex h-24 w-full items-end overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className={`w-full rounded-full bg-gradient-to-t transition-all duration-700 ${
                  day.isToday ? "from-[#7B68F0] to-[#B9AEFF]" : "from-[#4B3AC9] to-[#9B8CFF]"
                }`}
                style={{
                  height: day.hours > 0 ? `${Math.max(8, (day.hours / scale) * 100)}%` : "0%",
                }}
              />
            </div>
            <span
              className={`text-[10px] uppercase tracking-wider ${
                day.isToday ? "text-white/85" : "text-white/35"
              }`}
            >
              {day.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}