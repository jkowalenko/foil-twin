export type Brand = "axis" | "armstrong";

export type Source = {
  url: string;
  retrieved: string;
  /** How this URL was used. */
  role: "official-page" | "official-spec-table" | "official-product" | "dealer-transcription";
  note?: string;
};

export type FrontFamilyId =
  | "surge"
  | "art-v2"
  | "spitfire"
  | "fireball"
  | "uha"
  | "ha"
  | "ma-mk2";

export type TailFamilyId =
  | "skinny-surf"
  | "skinny"
  | "progressive"
  | "speed"
  | "dart"
  | "surf";

export type TailRole = "speed" | "dart" | "surf";

export type FrontWing = {
  id: string;
  brand: Brand;
  kind: "front";
  familyId: FrontFamilyId;
  familyOfficial: string;
  sizeLabel: string;
  span_mm: number | null;
  chord_mm: number | null;
  mean_chord_mm: number | null;
  area_cm2: number | null;
  aspect_ratio: number | null;
  weight_g: number | null;
  volume_cm3: number | null;
  construction: string | null;
  notes: string[];
  sources: Source[];
};

export type TailWing = {
  id: string;
  brand: Brand;
  kind: "tail";
  familyId: TailFamilyId;
  familyOfficial: string;
  sizeLabel: string;
  /** Cross-brand role used by the matcher. */
  role: TailRole;
  span_mm: number | null;
  chord_mm: number | null;
  area_cm2: number | null;
  aspect_ratio: number | null;
  weight_g: number | null;
  construction: string | null;
  notes: string[];
  sources: Source[];
};

export type Fuselage = {
  id: string;
  brand: Brand;
  kind: "fuselage";
  familyOfficial: string;
  sizeLabel: string;
  fuse_length_mm: number | null;
  /** Mast moved toward the front wing vs original standard, if published. */
  mast_forward_vs_standard_mm: number | null;
  mast_to_front_mm: number | null;
  mast_to_tail_mm: number | null;
  tail_lever_mm: number | null;
  weight_g: number | null;
  construction: string | null;
  notes: string[];
  sources: Source[];
};

export type Catalog = {
  retrieved: string;
  fronts: FrontWing[];
  tails: TailWing[];
  fuselages: Fuselage[];
};

export type Setup = {
  brand: Brand;
  frontId: string;
  fuseId: string;
  tailId: string;
};

export type RiderLevel = "learning" | "comfortable" | "pushing";
export type Discipline = "wing" | "surf" | "downwind" | "wake" | "race";
export type Goal =
  | "more-speed"
  | "more-lift"
  | "tighter-turns"
  | "more-glide"
  | "smaller-size";
