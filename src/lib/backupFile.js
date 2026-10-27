// Saving and opening backup files. Kept separate from the fasting maths because
// how a file is saved depends on where the app runs (browser vs Android app).

export function backupFileName(now = new Date()) {
  const d = new Date(now);
  const pad = (n) => String(n).padStart(2, "0");
  return `fasttime-backup-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}.json`;
}

export async function saveBackupFile(text, name = backupFileName()) {
  const file = new File([text], name, { type: "application/json" });

  // Phones: the share sheet lets you save to Files/Drive or send it to yourself.
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: "FastTime backup" });
      return "shared";
    } catch (error) {
      if (error?.name === "AbortError") return "cancelled";
      // fall through to a plain download
    }
  }

  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return "downloaded";
}

export function readFileText(file) {
  return file.text();
}
