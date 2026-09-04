import type { Theme } from "../lib/theme";

type Props = {
  theme: Theme;
  onChange: (t: Theme) => void;
};

export function ThemeToggle({ theme, onChange }: Props) {
  const next: Theme = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => onChange(next)}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
    >
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
