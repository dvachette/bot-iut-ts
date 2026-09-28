// web/frontend/src/theme.ts
import { updatePrimaryPalette } from "@primeuix/themes";

export const PRIMARY_COLORS = [
    "emerald", "green", "lime", "red", "orange", "amber", "yellow", "teal", "cyan", "sky",
    "blue", "indigo", "violet", "purple", "fuchsia", "pink", "rose",
] as const;

export type PrimaryColor = (typeof PRIMARY_COLORS)[number];

const SHADES: readonly number[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

export function applyPrimaryColor(color: PrimaryColor): void {
    const palette: Record<number, string> = {};
    for (const shade of SHADES) {
        palette[shade] = `{${color}.${shade}}`;
    }
    updatePrimaryPalette(palette);
}