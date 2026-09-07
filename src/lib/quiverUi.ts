import { QUIVER_UI_STORAGE_KEY } from "../data/labels";

export type QuiverUiPrefs = {
  version: 1;
  sections: {
    gaps: boolean;
    nextToBuy: boolean;
    brandConvert: boolean;
  };
};

export const DEFAULT_QUIVER_UI: QuiverUiPrefs = {
  version: 1,
  sections: { gaps: true, nextToBuy: true, brandConvert: false },
};

function cloneDefault(): QuiverUiPrefs {
  return {
    version: 1,
    sections: { ...DEFAULT_QUIVER_UI.sections },
  };
}

/** Parse a stored prefs blob. Unknown / wrong version → defaults. */
export function parseQuiverUi(raw: unknown): QuiverUiPrefs {
  if (!raw || typeof raw !== "object") return cloneDefault();
  const v = raw as { version?: unknown; sections?: unknown };
  if (v.version !== 1 || !v.sections || typeof v.sections !== "object") {
    return cloneDefault();
  }
  const s = v.sections as Record<string, unknown>;
  return {
    version: 1,
    sections: {
      gaps: typeof s.gaps === "boolean" ? s.gaps : DEFAULT_QUIVER_UI.sections.gaps,
      nextToBuy:
        typeof s.nextToBuy === "boolean" ? s.nextToBuy : DEFAULT_QUIVER_UI.sections.nextToBuy,
      brandConvert:
        typeof s.brandConvert === "boolean"
          ? s.brandConvert
          : DEFAULT_QUIVER_UI.sections.brandConvert,
    },
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
      nextToBuy: !!prefs.sections.nextToBuy,
      brandConvert: !!prefs.sections.brandConvert,
    },
  };
  try {
    localStorage.setItem(QUIVER_UI_STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* private mode / quota */
  }
  return next;
}
