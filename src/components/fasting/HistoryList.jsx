import React from "react";
import { formatClock, formatDay } from "@/lib/fasting";

export default function HistoryList({ entries }) {
  if (!entries.length) {
    return <p className="mt-3 text-sm text-white/30">Your first fast will appear here.</p>;
  }

  return (
    <ul className="mt-2 divide-y divide-white/[0.06]">
      {entries.map((entry) => (
        <li key={entry.id} className="flex items-center justify-between gap-4 py-3">
          <div className="min-w-0">
            <p className="text-sm text-white/80">{formatDay(entry.dinnerAt)}</p>
            <p className="tnum truncate text-xs text-white/35">
              dinner {formatClock(entry.dinnerAt)}
              {entry.endedAt ? ` · ate ${formatClock(entry.endedAt)}` : " · in progress"}
            </p>
          </div>
          <span className="tnum shrink-0 rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
            {entry.hours}h
          </span>
        </li>
      ))}
    </ul>
  );
}