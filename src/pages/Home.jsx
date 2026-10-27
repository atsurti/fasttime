import React, { useEffect, useState } from "react";
import { Settings as SettingsIcon } from "lucide-react";
import FastingRing from "@/components/fasting/FastingRing";
import DinnerCard from "@/components/fasting/DinnerCard";
import AdjustStart from "@/components/fasting/AdjustStart";
import FastingSettings from "@/components/fasting/FastingSettings";
import HistoryList from "@/components/fasting/HistoryList";
import WeeklySummary from "@/components/fasting/WeeklySummary";
import InstallHint from "@/components/InstallHint";
import {
  activeEntry,
  endOf,
  formatClock,
  loadState,
  logDinner,
  saveState,
  setDefaultDinnerTime,
  setFastingHours,
  splitDuration,
  updateActiveStart,
  weekSummary,
} from "@/lib/fasting";

export default function Home() {
  const [state, setState] = useState(loadState);
  const [now, setNow] = useState(() => Date.now());
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const ticker = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(ticker);
  }, []);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const active = activeEntry(state);
  const end = endOf(active);
  const remaining = end ? Math.max(0, end.getTime() - now) : 0;
  const fasting = Boolean(active) && remaining > 0;
  const total = active ? active.hours * 3600000 : 1;
  const progress = active ? Math.min(1, Math.max(0, (total - remaining) / total)) : 0;
  const time = splitDuration(remaining);
  const week = weekSummary(state, new Date(now));

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-[#08080C] text-white">
      <div
        className="pointer-events-none absolute inset-0 transition-all duration-1000"
        style={{
          background: fasting
            ? "radial-gradient(120% 55% at 50% -10%, rgba(124,92,255,0.32), transparent 62%)"
            : "radial-gradient(120% 55% at 50% -10%, rgba(240,160,104,0.26), transparent 62%)",
        }}
      />

      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-col px-6 pb-safe pt-safe">
        <header className="flex items-center justify-between">
          <span className="font-display text-[12px] uppercase tracking-[0.42em] text-white/45">
            FastTime
          </span>
          <button
            onClick={() => setSettingsOpen(true)}
            aria-label="Fasting settings"
            className="rounded-full border border-white/10 p-2.5 text-white/55 transition hover:border-white/30 hover:text-white"
          >
            <SettingsIcon className="h-4 w-4" />
          </button>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center py-10">
          <div className={fasting ? "animate-breathe" : ""}>
            <FastingRing progress={progress} tone={fasting ? "fast" : "eat"}>
              {fasting ? (
                <>
                  <p className="text-[10px] uppercase tracking-[0.34em] text-white/40">
                    left to fast
                  </p>
                  <p className="tnum mt-3 text-[40px] font-light leading-none tracking-tight">
                    {time.text}
                  </p>
                  <p className="mt-3 text-[11px] text-white/35">{active.hours}h window</p>
                </>
              ) : active ? (
                <>
                  <p className="text-[10px] uppercase tracking-[0.34em] text-white/40">
                    eating window
                  </p>
                  <p className="font-display mt-3 text-3xl">You can eat</p>
                  <p className="tnum mt-3 text-[11px] text-white/35">
                    opened {formatClock(end)}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-[10px] uppercase tracking-[0.34em] text-white/40">
                    your window
                  </p>
                  <p className="tnum mt-3 text-[40px] font-light leading-none tracking-tight">
                    {state.fastingHours}h
                  </p>
                  <p className="mt-3 text-[11px] text-white/35">dinner to dinner</p>
                </>
              )}
            </FastingRing>
          </div>

          {fasting ? (
            <div className="mt-8 flex w-full flex-col items-center">
              <p className="text-sm text-white/50">
                You can eat at{" "}
                <span className="tnum text-white/90">{formatClock(end)}</span>
              </p>
              <p className="tnum mt-1 text-xs text-white/30">
                dinner {formatClock(active.dinnerAt)}
              </p>
              <AdjustStart
                startedAt={active.dinnerAt}
                fastingHours={active.hours}
                onUpdate={(date) => setState((prev) => updateActiveStart(prev, date))}
              />
            </div>
          ) : (
            <DinnerCard
              headline={active ? "Dinner again?" : "Finished dinner?"}
              subline="Log it and your fast begins."
              defaultTime={state.defaultDinnerTime}
              fastingHours={state.fastingHours}
              onLog={(date) => setState((prev) => logDinner(prev, date))}
            />
          )}
        </main>

        <WeeklySummary days={week.days} totalHours={week.totalHours} />

        <section className="mt-8">
          <h2 className="text-[10px] uppercase tracking-[0.34em] text-white/30">
            Recent fasts
          </h2>
          <HistoryList entries={[...state.entries].reverse().slice(0, 5)} />
          <p className="mt-6 text-center text-[11px] text-white/25">
            Saved on this phone only.
          </p>
          <InstallHint />
        </section>
      </div>

      <FastingSettings
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        hours={state.fastingHours}
        onChange={(hours) => setState((prev) => setFastingHours(prev, hours))}
        defaultDinnerTime={state.defaultDinnerTime}
        onDefaultDinnerTimeChange={(value) =>
          setState((prev) => setDefaultDinnerTime(prev, value))
        }
      />
    </div>
  );
}