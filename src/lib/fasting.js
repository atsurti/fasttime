export const STORAGE_KEY = "fastline.state.v1";
export const PRESETS = [14, 16, 18, 20];
export const DEFAULT_DINNER_TIME = "18:00";

function emptyState() {
  return { fastingHours: 16, defaultDinnerTime: DEFAULT_DINNER_TIME, entries: [] };
}

function isTimeValue(value) {
  return typeof value === "string" && /^\d{1,2}:\d{2}$/.test(value);
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw);
    const hours = Number(parsed?.fastingHours);
    return {
      fastingHours: hours >= 1 && hours <= 24 ? hours : 16,
      defaultDinnerTime: isTimeValue(parsed?.defaultDinnerTime)
        ? parsed.defaultDinnerTime
        : DEFAULT_DINNER_TIME,
      entries: Array.isArray(parsed?.entries) ? parsed.entries : [],
    };
  } catch {
    return emptyState();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* device storage unavailable — keep the timer running in memory */
  }
}

export function activeEntry(state) {
  const last = state.entries[state.entries.length - 1];
  return last && !last.endedAt ? last : null;
}

export function endOf(entry) {
  if (!entry) return null;
  return new Date(new Date(entry.dinnerAt).getTime() + entry.hours * 3600000);
}

export function logDinner(state, date) {
  const open = activeEntry(state);
  if (open && new Date(date).getTime() <= new Date(open.dinnerAt).getTime()) {
    // An "earlier" dinner before the fast that's already running can't close it —
    // the user is correcting when that fast began.
    return updateActiveStart(state, date);
  }
  const dinnerAt = new Date(date).toISOString();
  const entries = state.entries.map((e) => (e.endedAt ? e : { ...e, endedAt: dinnerAt }));
  entries.push({
    id: `f-${Date.now()}`,
    dinnerAt,
    hours: state.fastingHours,
    endedAt: null,
  });
  return { ...state, entries };
}

export function updateActiveStart(state, date) {
  const dinnerAt = new Date(date).toISOString();
  return {
    ...state,
    entries: state.entries.map((e) => (e.endedAt ? e : { ...e, dinnerAt })),
  };
}

export function setFastingHours(state, hours, now = Date.now()) {
  const next = Math.min(24, Math.max(1, Math.round(hours) || 1));
  return {
    ...state,
    fastingHours: next,
    // Only a fast that's still running takes the new length; one whose window
    // has already opened is history and keeps the length it had.
    entries: state.entries.map((e) => (isFasting(e, now) ? { ...e, hours: next } : e)),
  };
}

export function splitDuration(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return {
    h,
    m,
    s,
    text: `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
  };
}

export function formatClock(value) {
  return new Date(value).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function formatDay(value) {
  return new Date(value).toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" });
}

export function timeInputValue(date) {
  const d = new Date(date);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function timeValueToDate(value, now = new Date(), fastingHours = 16) {
  const [hh, mm] = String(value).split(":").map(Number);
  const picked = new Date(now);
  picked.setHours(Number.isFinite(hh) ? hh : 0, Number.isFinite(mm) ? mm : 0, 0, 0);

  // A time that has already passed today is today's dinner.
  if (picked.getTime() <= now.getTime()) return picked;

  // It is still ahead today, so it can only mean yesterday's dinner if that fast
  // would still be running — otherwise the fast would already be over by now.
  const hours = Number(fastingHours) > 0 ? Number(fastingHours) : 16;
  const yesterday = new Date(picked);
  yesterday.setDate(picked.getDate() - 1);
  if (yesterday.getTime() + hours * 3600000 > now.getTime()) return yesterday;

  // A dinner you haven't reached yet can't be one you've finished — start from now.
  return new Date(now);
}

export function timeValueLabel(value) {
  const [hh, mm] = String(value || "").split(":").map(Number);
  if (!Number.isFinite(hh)) return "";
  return formatClock(new Date(2000, 0, 1, hh, Number.isFinite(mm) ? mm : 0));
}

export function setDefaultDinnerTime(state, value) {
  return {
    ...state,
    defaultDinnerTime: isTimeValue(value) ? value : DEFAULT_DINNER_TIME,
  };
}

function dateKey(date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

// Hours actually fasted: from dinner until the window opened, or until now if it
// hasn't yet. Time after the window opens is eating time, so it never counts —
// even if the next dinner is logged late or not at all.
export function entryHours(entry, now = Date.now()) {
  const start = new Date(entry.dinnerAt).getTime();
  const stop = entry.endedAt ? new Date(entry.endedAt).getTime() : now;
  const elapsed = Math.max(0, (stop - start) / 3600000);
  return Math.min(elapsed, Number(entry.hours) || 0);
}

// 5) An eating window that's been open long enough that the next dinner has
// surely happened. Past this point the app goes back to "Finished dinner?".
export function isStale(entry, now = Date.now()) {
  if (!entry) return false;
  const limitHours = Math.max(24, (Number(entry.hours) || 0) + 4);
  return now - new Date(entry.dinnerAt).getTime() >= limitHours * 3600000;
}

export function isFasting(entry, now = Date.now()) {
  return Boolean(entry) && !entry.endedAt && endOf(entry).getTime() > now;
}

// 4) Parse the custom-hours field; null means "not a usable value yet".
export function parseHours(value) {
  const text = String(value).trim();
  if (!/^\d{1,2}$/.test(text)) return null;
  const hours = Number(text);
  return hours >= 1 && hours <= 24 ? hours : null;
}

export function formatHours(hours) {
  const value = Math.round(hours * 10) / 10;
  return `${Number.isInteger(value) ? value : value.toFixed(1)}h`;
}

export function weekSummary(state, now = new Date()) {
  const start = new Date(now);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  start.setHours(0, 0, 0, 0);

  const totals = new Map();
  state.entries.forEach((entry) => {
    const key = dateKey(new Date(entry.dinnerAt));
    totals.set(key, (totals.get(key) || 0) + entryHours(entry, now.getTime()));
  });

  const todayKey = dateKey(now);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const key = dateKey(date);
    return {
      key,
      label: date.toLocaleDateString([], { weekday: "short" }),
      hours: Math.round((totals.get(key) || 0) * 10) / 10,
      isToday: key === todayKey,
    };
  });

  const totalHours = Math.round(days.reduce((sum, day) => sum + day.hours, 0) * 10) / 10;
  return { days, totalHours };
}

// ---- Backup ---------------------------------------------------------------

export function backupText(state, now = new Date()) {
  return JSON.stringify(
    { app: "fasttime", version: 1, exportedAt: new Date(now).toISOString(), state },
    null,
    2
  );
}

function validDate(value) {
  return typeof value === "string" && Number.isFinite(new Date(value).getTime());
}

function cleanEntry(raw) {
  if (!raw || !validDate(raw.dinnerAt)) return null;
  const hours = Number(raw.hours);
  if (!(hours >= 1 && hours <= 24)) return null;
  return {
    id: typeof raw.id === "string" && raw.id ? raw.id : `f-${new Date(raw.dinnerAt).getTime()}`,
    dinnerAt: new Date(raw.dinnerAt).toISOString(),
    hours,
    endedAt: validDate(raw.endedAt) ? new Date(raw.endedAt).toISOString() : null,
  };
}

// Merge a backup into what's already here. Nothing is ever removed: fasts in the
// backup that this phone doesn't have are added, and the phone's own settings
// stay as they are. Throws a readable Error if the file isn't a FastTime backup.
export function mergeBackup(state, text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("That file isn't a FastTime backup.");
  }
  const incoming = parsed?.app === "fasttime" ? parsed.state?.entries : null;
  if (!Array.isArray(incoming)) throw new Error("That file isn't a FastTime backup.");

  const byId = new Map(state.entries.map((e) => [e.id, e]));
  // The same dinner may exist under a different id if it was logged twice.
  const times = new Set(state.entries.map((e) => new Date(e.dinnerAt).getTime()));
  let added = 0;
  incoming.forEach((raw) => {
    const entry = cleanEntry(raw);
    if (!entry || byId.has(entry.id) || times.has(new Date(entry.dinnerAt).getTime())) return;
    byId.set(entry.id, entry);
    times.add(new Date(entry.dinnerAt).getTime());
    added += 1;
  });

  const entries = [...byId.values()].sort(
    (a, b) => new Date(a.dinnerAt).getTime() - new Date(b.dinnerAt).getTime()
  );
  // Only the newest fast may be open; any earlier open one ended at the next dinner.
  for (let i = 0; i < entries.length - 1; i += 1) {
    if (!entries[i].endedAt) entries[i] = { ...entries[i], endedAt: entries[i + 1].dinnerAt };
  }
  return { state: { ...state, entries }, added };
}
