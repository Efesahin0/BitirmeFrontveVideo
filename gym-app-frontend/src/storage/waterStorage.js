import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "water_v1";

const getTodayKey = () => new Date().toISOString().slice(0, 10); // YYYY-MM-DD

const defaultState = () => ({
  goalMl: 2500,
  history: {}, // { "2026-02-26": 1200, ... }
});

async function readAll() {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return defaultState();
  try {
    const parsed = JSON.parse(raw);
    return {
      goalMl: typeof parsed.goalMl === "number" ? parsed.goalMl : 2500,
      history: parsed.history && typeof parsed.history === "object" ? parsed.history : {},
    };
  } catch {
    return defaultState();
  }
}

async function writeAll(state) {
  await AsyncStorage.setItem(KEY, JSON.stringify(state));
}

/** ✅ Goal */
export async function getGoalMl() {
  const data = await readAll();
  return data.goalMl || 2500;
}

export async function setGoalMl(ml) {
  const data = await readAll();
  const nextGoal = Math.max(250, Number(ml) || 2500);
  const next = { ...data, goalMl: nextGoal };
  await writeAll(next);
  return nextGoal;
}

/** ✅ Today ml */
export async function getTodayMl() {
  const data = await readAll();
  const key = getTodayKey();
  return Number(data.history[key] || 0);
}

export async function addWaterMl(ml) {
  const data = await readAll();
  const key = getTodayKey();
  const current = Number(data.history[key] || 0);
  const nextVal = Math.max(0, current + Number(ml || 0));
  const next = {
    ...data,
    history: { ...data.history, [key]: nextVal },
  };
  await writeAll(next);
  return nextVal;
}

export async function resetToday() {
  const data = await readAll();
  const key = getTodayKey();
  const next = {
    ...data,
    history: { ...data.history, [key]: 0 },
  };
  await writeAll(next);
  return 0;
}

/** ✅ Week status (last 7 days) */
export async function getWeekStatus() {
  const data = await readAll();
  const goal = data.goalMl || 2500;

  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const ml = Number(data.history[key] || 0);
    days.push({
      date: key,
      ml,
      done: goal > 0 ? ml >= goal : false,
    });
  }
  return { goalMl: goal, days };
}

/** ✅ Streak: consecutive days (including today) reached goal */
export async function getStreak() {
  const data = await readAll();
  const goal = data.goalMl || 2500;
  if (goal <= 0) return 0;

  let streak = 0;
  for (let i = 0; ; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const ml = Number(data.history[key] || 0);
    if (ml >= goal) streak++;
    else break;
  }
  return streak;
}