import React, { useRef, useState } from "react";
import { backupText, mergeBackup } from "@/lib/fasting";
import { readFileText, saveBackupFile } from "@/lib/backupFile";

export default function BackupSection({ state, onRestore }) {
  const fileInput = useRef(null);
  const [message, setMessage] = useState(null);

  const save = async () => {
    setMessage(null);
    const result = await saveBackupFile(backupText(state));
    if (result !== "cancelled") {
      const count = state.entries.length;
      setMessage({ tone: "ok", text: `Backup saved — ${count} ${count === 1 ? "fast" : "fasts"}.` });
    }
  };

  const restore = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const { state: merged, added } = mergeBackup(state, await readFileText(file));
      onRestore(merged);
      setMessage({
        tone: "ok",
        text: added
          ? `Added ${added} ${added === 1 ? "fast" : "fasts"} from the backup.`
          : "Everything in that backup is already here.",
      });
    } catch (error) {
      setMessage({ tone: "error", text: error.message || "Couldn't read that file." });
    }
  };

  return (
    <div className="mt-2 space-y-2 border-t border-white/[0.08] pt-5">
      <p className="text-[11px] uppercase tracking-[0.28em] text-white/35">Backup</p>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={save}
          className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/80 transition hover:border-white/25 hover:text-white"
        >
          Save backup
        </button>
        <button
          onClick={() => fileInput.current?.click()}
          className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/80 transition hover:border-white/25 hover:text-white"
        >
          Restore
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          onChange={restore}
          className="hidden"
        />
      </div>
      {message ? (
        <p className={`text-xs ${message.tone === "error" ? "text-[#F3B573]" : "text-white/55"}`}>
          {message.text}
        </p>
      ) : (
        <p className="text-xs text-white/35">
          Your fasts live only on this phone. Save a copy now and then; restoring adds any
          fasts from the backup and never deletes anything.
        </p>
      )}
    </div>
  );
}
