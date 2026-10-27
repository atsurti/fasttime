import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PRESETS } from "@/lib/fasting";

export default function FastingSettings({
  open,
  onOpenChange,
  hours,
  onChange,
  defaultDinnerTime,
  onDefaultDinnerTimeChange,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/10 bg-[#0C0C13] text-white sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-normal tracking-tight">
            Fasting window
          </DialogTitle>
        </DialogHeader>
        <p className="-mt-2 text-sm text-white/45">
          How long do you want to fast after dinner?
        </p>

        <div className="grid grid-cols-4 gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset}
              onClick={() => onChange(preset)}
              className={`tnum rounded-2xl border px-2 py-3 text-sm transition ${
                hours === preset
                  ? "border-transparent bg-gradient-to-br from-[#9B8CFF] to-[#4B3AC9] text-white"
                  : "border-white/10 bg-white/[0.03] text-white/70 hover:border-white/25 hover:text-white"
              }`}
            >
              {preset}h
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <span className="text-sm text-white/60">Custom hours</span>
          <input
            type="number"
            min="1"
            max="24"
            value={hours}
            onChange={(e) => onChange(Number(e.target.value))}
            className="tnum w-16 bg-transparent text-right text-lg text-white outline-none"
          />
        </div>

        <p className="text-sm text-white/45">
          You can eat {hours} hours after dinner.
        </p>

        <div className="mt-2 space-y-2 border-t border-white/[0.08] pt-5">
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <span className="text-sm text-white/60">Usual dinner time</span>
            <input
              type="time"
              value={defaultDinnerTime}
              onChange={(e) => onDefaultDinnerTimeChange(e.target.value)}
              className="tnum bg-transparent text-sm text-white outline-none [color-scheme:dark]"
            />
          </div>
          <p className="text-xs text-white/35">
            Used when you log an earlier dinner, so you don't have to type it in.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}