import type { Brand } from "../data/types";
import { brandMod, brandName } from "../lib/format";

type Props = {
  brand: Brand;
  size?: "sm" | "md";
  withLabel?: boolean;
};

export function BrandMark({ brand, size = "sm", withLabel = false }: Props) {
  const label = brandName(brand);
  return (
    <span className={`brand-mark brand-mark-${brand} ${size}`}>
      {brand === "axis" ? (
        <img src="/brand/axis-logo.png" alt="AXIS" />
      ) : brand === "armstrong" ? (
        <span className="arm-wordmark" aria-label="Armstrong">
          <img
            className="arm-wordmark-dark"
            src="/brand/armstrong-wordmark.png?v=3"
            alt=""
            aria-hidden="true"
          />
          <img
            className="arm-wordmark-light"
            src="/brand/armstrong-wordmark-light.png?v=3"
            alt=""
            aria-hidden="true"
          />
        </span>
      ) : (
        <span className="code-wordmark" aria-label="Code">
          <img
            className="code-wordmark-dark"
            src="/brand/code-wordmark.png"
            alt=""
            aria-hidden="true"
          />
          <img
            className="code-wordmark-light"
            src="/brand/code-wordmark-light.png"
            alt=""
            aria-hidden="true"
          />
        </span>
      )}
      {withLabel && <span className="brand-mark-label">{label}</span>}
    </span>
  );
}

type ToggleProps = {
  value: Brand;
  onChange: (b: Brand) => void;
  brands: Brand[];
  size?: "sm" | "md";
};

export function BrandToggle({ value, onChange, brands, size = "md" }: ToggleProps) {
  return (
    <div className={`brand-toggle logos-only cols-${brands.length}`}>
      {brands.map((b) => (
        <button
          key={b}
          type="button"
          className={value === b ? `on-${brandMod(b)}` : ""}
          onClick={() => onChange(b)}
          aria-label={brandName(b)}
          aria-pressed={value === b}
          title={brandName(b)}
        >
          <BrandMark brand={b} size={size} />
        </button>
      ))}
    </div>
  );
}
