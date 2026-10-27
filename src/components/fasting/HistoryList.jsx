import React from "react";
import { endOf, entryHours, formatClock, formatDay, formatHours, isFasting } from "@/lib/fasting";

export default function HistoryList({ entries, now = Date.now() }) {
  if (!entries.length) {
    return <p className="mt-3 text-sm text-white/30">Your first fast will appear here.</p>;
  }

  return (
    <ul className="mt-2 divide-y divide-white/[0.06]">
      {entries.map((entry) => {
        const running = isFasting(entry, now);
        return (
          <li key={entry.id} className="flex items-center justify-between gap-4 py-3">
            <div className="min-w-0">
              <p className="text-sm text-white/80">{formatDay(entry.dinnerAt)}</p>
              <p className="tnum truncate text-xs text-white/35">
                dinner {formatClock(entry.dinnerAt)}
                {running ? " · in progress" : ` · eat from ${formatClock(endOf(entry))}`}
              </p>
            </div>
            <span className="tnum shrink-0 rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
              {running ? formatHours(entryHours(entry, now)) : `${entry.hours}h`}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
