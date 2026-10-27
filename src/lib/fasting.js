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

export function setFastingHours(state, hours) {
  const next = Math.min(24, Math.max(1, Math.round(hours) || 1));
  return {
    ...state,
    fastingHours: next,
    entries: state.entries.map((e) => (e.endedAt ? e : { ...e, hours: next })),
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

export function entryHours(entry, now = Date.now()) {
  const start = new Date(entry.dinnerAt).getTime();
  const end = entry.endedAt ? new Date(entry.endedAt).getTime() : now;
  return Math.max(0, (end - start) / 3600000);
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