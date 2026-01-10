/**
 * Design Tokens - Single Source of Truth
 * TypeScript mirror of CSS variables for programmatic access
 * @module lib/design-tokens
 *
 * COLOR SEMANTIC MEANINGS:
 * - primary: Main brand color (indigo) - CTAs, links, active states
 * - secondary: Muted version of primary - secondary buttons, backgrounds
 * - accent: Highlight color - focus rings, selected items
 * - destructive: Error/danger states - delete buttons, error messages
 * - muted: Disabled/inactive states - placeholder text, disabled buttons
 * - neon.*: Accent colors for visual interest - charts, badges, highlights
 */

// ============================================================================
// COLORS
// ============================================================================

export const colors = {
  // Core theme colors (matching CSS variables in globals.css)
  background: "#000000",
  foreground: "#ffffff",

  // Card surfaces
  card: "rgba(10, 10, 15, 0.9)",
  cardForeground: "#ffffff",

  // Popover/dropdown surfaces
  popover: "rgba(5, 5, 10, 0.98)",
  popoverForeground: "#ffffff",

  // Primary brand color - Use for CTAs, links, active states
  primary: {
    DEFAULT: "#6366f1",
    foreground: "#ffffff",
    50: "#eef2ff",
    100: "#e0e7ff",
    200: "#c7d2fe",
    300: "#a5b4fc",
    400: "#818cf8",
    500: "#6366f1",
    600: "#4f46e5",
    700: "#4338ca",
    800: "#3730a3",
    900: "#312e81",
  },

  // Secondary - Muted primary for secondary actions
  secondary: {
    DEFAULT: "rgba(99, 102, 241, 0.1)",
    foreground: "#a5b4fc",
  },

  // Muted - For disabled/placeholder states
  muted: {
    DEFAULT: "rgba(255, 255, 255, 0.05)",
    foreground: "#71717a",
  },

  // Accent - For focus and selection
  accent: {
    DEFAULT: "rgba(99, 102, 241, 0.2)",
    foreground: "#c7d2fe",
  },

  // Destructive - For errors and dangerous actions
  destructive: {
    DEFAULT: "#ef4444",
    foreground: "#ffffff",
  },

  // Border colors
  border: "rgba(255, 255, 255, 0.1)",
  input: "rgba(255, 255, 255, 0.08)",
  ring: "#6366f1",

  // Neon accent colors - For visual interest, charts, badges
  neon: {
    purple: "#a855f7",  // Creativity, innovation
    blue: "#3b82f6",    // Trust, information
    cyan: "#06b6d4",    // Progress, technology
    pink: "#ec4899",    // Energy, attention
    green: "#10b981",   // Success, completion
  },

  // Chart colors
  chart: {
    1: "#6366f1",
    2: "#a855f7",
    3: "#06b6d4",
    4: "#10b981",
    5: "#f59e0b",
  },

  // Semantic colors
  success: {
    DEFAULT: "#10b981",
    foreground: "#ffffff",
    muted: "rgba(16, 185, 129, 0.15)",
    text: "#6ee7b7",
  },

  warning: {
    DEFAULT: "#f59e0b",
    foreground: "#000000",
    muted: "rgba(245, 158, 11, 0.15)",
    text: "#fcd34d",
  },

  error: {
    DEFAULT: "#ef4444",
    foreground: "#ffffff",
    muted: "rgba(239, 68, 68, 0.15)",
    text: "#fca5a5",
  },

  // Glass effect colors
  glass: {
    bg: "rgba(10, 10, 15, 0.8)",
    border: "rgba(255, 255, 255, 0.08)",
    light: {
      bg: "rgba(255, 255, 255, 0.05)",
      border: "rgba(255, 255, 255, 0.1)",
    },
    subtle: {
      bg: "rgba(255, 255, 255, 0.02)",
      border: "rgba(255, 255, 255, 0.05)",
    },
  },
} as const;

// ============================================================================
// SPACING
// ============================================================================

export const spacing = {
  px: "1px",
  0: "0",
  0.5: "0.125rem",  // 2px
  1: "0.25rem",     // 4px
  1.5: "0.375rem",  // 6px
  2: "0.5rem",      // 8px
  2.5: "0.625rem",  // 10px
  3: "0.75rem",     // 12px
  3.5: "0.875rem",  // 14px
  4: "1rem",        // 16px
  5: "1.25rem",     // 20px
  6: "1.5rem",      // 24px
  7: "1.75rem",     // 28px
  8: "2rem",        // 32px
  9: "2.25rem",     // 36px
  10: "2.5rem",     // 40px
  11: "2.75rem",    // 44px
  12: "3rem",       // 48px
  14: "3.5rem",     // 56px
  16: "4rem",       // 64px
  20: "5rem",       // 80px
  24: "6rem",       // 96px
  28: "7rem",       // 112px
  32: "8rem",       // 128px
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
  fontFamily: {
    sans: "var(--font-geist-sans)",
    mono: "var(--font-geist-mono)",
  },
  fontSize: {
    xs: ["0.75rem", { lineHeight: "1rem" }],      // 12px
    sm: ["0.875rem", { lineHeight: "1.25rem" }],  // 14px
    base: ["1rem", { lineHeight: "1.5rem" }],     // 16px
    lg: ["1.125rem", { lineHeight: "1.75rem" }],  // 18px
    xl: ["1.25rem", { lineHeight: "1.75rem" }],   // 20px
    "2xl": ["1.5rem", { lineHeight: "2rem" }],    // 24px
    "3xl": ["1.875rem", { lineHeight: "2.25rem" }], // 30px
    "4xl": ["2.25rem", { lineHeight: "2.5rem" }],   // 36px
    "5xl": ["3rem", { lineHeight: "1" }],           // 48px
  },
  fontWeight: {
    thin: "100",
    extralight: "200",
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
    black: "900",
  },
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const borderRadius = {
  none: "0",
  sm: "calc(0.75rem - 4px)",  // ~8px
  DEFAULT: "0.75rem",          // 12px (--radius)
  md: "calc(0.75rem - 2px)",  // ~10px
  lg: "0.75rem",              // 12px
  xl: "calc(0.75rem + 4px)",  // ~16px
  "2xl": "1rem",              // 16px
  "3xl": "1.5rem",            // 24px
  full: "9999px",
} as const;

// ============================================================================
// SHADOWS
// ============================================================================

export const shadows = {
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  DEFAULT: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
  "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)",
  none: "none",

  // Glow effects
  glow: {
    primary: "0 0 20px rgba(99, 102, 241, 0.4), 0 0 40px rgba(99, 102, 241, 0.2), 0 0 60px rgba(99, 102, 241, 0.1)",
    purple: "0 0 20px rgba(168, 85, 247, 0.4), 0 0 40px rgba(168, 85, 247, 0.2)",
    cyan: "0 0 20px rgba(6, 182, 212, 0.4), 0 0 40px rgba(6, 182, 212, 0.2)",
    green: "0 0 20px rgba(16, 185, 129, 0.4), 0 0 40px rgba(16, 185, 129, 0.2)",
  },
} as const;

// ============================================================================
// Z-INDEX
// ============================================================================

export const zIndex = {
  hide: -1,
  auto: "auto",
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

// ============================================================================
// BREAKPOINTS
// ============================================================================

export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type ColorKey = keyof typeof colors;
export type SpacingKey = keyof typeof spacing;
export type BorderRadiusKey = keyof typeof borderRadius;
export type BreakpointKey = keyof typeof breakpoints;
