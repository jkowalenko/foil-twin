import type { Discipline, Goal, RiderLevel } from "./types";

export const LEVELS: { id: RiderLevel; label: string }[] = [
  { id: "learning", label: "Learning" },
  { id: "comfortable", label: "Comfortable" },
  { id: "pushing", label: "Pushing" },
];

export const DISCIPLINES: { id: Discipline; label: string }[] = [
  { id: "wing", label: "Wing" },
  { id: "surf", label: "Surf / prone" },
  { id: "downwind", label: "Downwind" },
  { id: "wake", label: "Wake" },
  { id: "race", label: "Race" },
];

export const GOALS: { id: Goal; label: string }[] = [
  { id: "more-speed", label: "More speed" },
  { id: "more-lift", label: "More lift / low-end" },
  { id: "tighter-turns", label: "Tighter turns" },
  { id: "more-glide", label: "More glide" },
  { id: "smaller-size", label: "Smaller size" },
];

export const QUIVER_STORAGE_KEY = "foil-twin-quiver-v1";
export const THEME_STORAGE_KEY = "foil-twin-theme";
export const SETUP_STORAGE_KEY = "foil-twin-v1";
