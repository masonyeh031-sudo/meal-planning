import {
  ACTIVITY_OPTIONS,
  GOAL_OPTIONS,
  SEX_OPTIONS,
  type UserProfile,
} from "@/lib/nutrition-calculator";

export const DEFAULT_USER_PROFILE: UserProfile = {
  heightCm: 165,
  weightKg: 60,
  age: 22,
  sex: "female",
  activity: "medium",
  goal: "maintain",
};

const PROFILE_STORAGE_KEY = "meal-planning:nutrition-profile";

function isValidOption<T extends string>(
  value: unknown,
  options: ReadonlyArray<{ value: T }>,
): value is T {
  return typeof value === "string" && options.some((option) => option.value === value);
}

function sanitizeNumber(value: unknown, fallback: number, min: number, max: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, value));
}

function normalizeProfile(value: unknown): UserProfile | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<UserProfile>;

  return {
    heightCm: sanitizeNumber(candidate.heightCm, DEFAULT_USER_PROFILE.heightCm, 100, 230),
    weightKg: sanitizeNumber(candidate.weightKg, DEFAULT_USER_PROFILE.weightKg, 30, 200),
    age: sanitizeNumber(candidate.age, DEFAULT_USER_PROFILE.age, 10, 100),
    sex: isValidOption(candidate.sex, SEX_OPTIONS)
      ? candidate.sex
      : DEFAULT_USER_PROFILE.sex,
    activity: isValidOption(candidate.activity, ACTIVITY_OPTIONS)
      ? candidate.activity
      : DEFAULT_USER_PROFILE.activity,
    goal: isValidOption(candidate.goal, GOAL_OPTIONS)
      ? candidate.goal
      : DEFAULT_USER_PROFILE.goal,
  };
}

export function loadNutritionProfile() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    return normalizeProfile(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveNutritionProfile(profile: UserProfile) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
}
