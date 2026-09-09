import { QUIVER_UI_STORAGE_KEY } from "../data/labels";
import type { CurrencyCode } from "../data/prices";

export type QuiverUiPrefs = {
  version: 1;
  sections: {
    gaps: boolean;
    overlaps: boolean;
    nextToBuy: boolean;
    brandConvert: boolean;
    /** Simplified kit (80%) panel open */
    kit80: boolean;
    /** Fuller kit (90%) panel open */
    kit90: boolean;
    /** Owned parts to include in convert — default expanded */
    convertInclude: boolean;
    /** Full owned→twin match table — default collapsed */
    convertMatches: boolean;
  };
  currency: CurrencyCode;
};

export const DEFAULT_QUIVER_UI: QuiverUiPrefs = {
  version: 1,
  sections: {
    gaps: true,
    overlaps: true,
    nextToBuy: true,
    brandConvert: false,
    kit80: true,
    kit90: true,
    convertInclude: true,
    convertMatches: false,
  },
  currency: "USD",
};

function cloneDefault(): QuiverUiPrefs {
  return {
    version: 1,
    sections: { ...DEFAULT_QUIVER_UI.sections },
    currency: DEFAULT_QUIVER_UI.currency,
  };
}

function parseCurrency(raw: unknown): CurrencyCode {
  return raw === "CAD" ? "CAD" : "USD";
}

function parseBool(raw: unknown, fallback: boolean): boolean {
  return typeof raw === "boolean" ? raw : fallback;
}

/** Parse a stored prefs blob. Unknown / wrong version → defaults. */
export function parseQuiverUi(raw: unknown): QuiverUiPrefs {
  if (!raw || typeof raw !== "object") return cloneDefault();
  const v = raw as { version?: unknown; sections?: unknown; currency?: unknown };
  if (v.version !== 1 || !v.sections || typeof v.sections !== "object") {
    return cloneDefault();
  }
  const s = v.sections as Record<string, unknown>;
  return {
    version: 1,
    sections: {
      gaps: parseBool(s.gaps, DEFAULT_QUIVER_UI.sections.gaps),
      overlaps: parseBool(s.overlaps, DEFAULT_QUIVER_UI.sections.overlaps),
      nextToBuy: parseBool(s.nextToBuy, DEFAULT_QUIVER_UI.sections.nextToBuy),
      brandConvert: parseBool(s.brandConvert, DEFAULT_QUIVER_UI.sections.brandConvert),
      kit80: parseBool(s.kit80, DEFAULT_QUIVER_UI.sections.kit80),
      kit90: parseBool(s.kit90, DEFAULT_QUIVER_UI.sections.kit90),
      convertInclude: parseBool(s.convertInclude, DEFAULT_QUIVER_UI.sections.convertInclude),
      convertMatches: parseBool(s.convertMatches, DEFAULT_QUIVER_UI.sections.convertMatches),
    },
    currency: parseCurrency(v.currency),
  };
}

export function loadQuiverUi(): QuiverUiPrefs {
  try {
    const raw = localStorage.getItem(QUIVER_UI_STORAGE_KEY);
    if (!raw) return cloneDefault();
    return parseQuiverUi(JSON.parse(raw));
  } catch {
    return cloneDefault();
  }
}

export function saveQuiverUi(prefs: QuiverUiPrefs) {
  const next: QuiverUiPrefs = {
    version: 1,
    sections: {
      gaps: !!prefs.sections.gaps,
      overlaps: !!prefs.sections.overlaps,
      nextToBuy: !!prefs.sections.nextToBuy,
      brandConvert: !!prefs.sections.brandConvert,
      kit80: !!prefs.sections.kit80,
      kit90: !!prefs.sections.kit90,
      convertInclude: !!prefs.sections.convertInclude,
      convertMatches: !!prefs.sections.convertMatches,
    },
    currency: parseCurrency(prefs.currency),
  };
  try {
    localStorage.setItem(QUIVER_UI_STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* private mode / quota */
  }
  return next;
}
