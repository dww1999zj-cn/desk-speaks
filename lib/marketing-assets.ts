/** Marketing before/after — after variants are i2i edits from the same before photo. */

/** Full-res PNG masters (promo compose, regen). Prefer *-display.webp on the web. */
export const MARKETING_DESK_BEFORE_MASTER = "/marketing/desk-showcase-before.png";
export const MARKETING_DESK_AFTER_MASTER = "/marketing/desk-showcase-after-v10c.png";

/** Optimized WebP for homepage / upload showcase (≈960w). */
export const MARKETING_DESK_BEFORE = "/marketing/desk-showcase-before-display.webp";
export const MARKETING_DESK_AFTER =
  "/marketing/desk-showcase-after-v10c-display.webp";

export const MARKETING_DESK_BEFORE_SRCSET =
  "/marketing/desk-showcase-before-display-640.webp 640w, /marketing/desk-showcase-before-display.webp 960w";
export const MARKETING_DESK_AFTER_SRCSET =
  "/marketing/desk-showcase-after-v10c-display-640.webp 640w, /marketing/desk-showcase-after-v10c-display.webp 960w";

/** Slider is inside max-w-lg (~512px); 2x → prefer 960. */
export const MARKETING_DESK_SIZES = "(max-width: 640px) 100vw, 512px";

/** Generated candidates — run: node scripts/generate-marketing-afters.mjs */
export const MARKETING_DESK_AFTER_VARIANTS = [
  "/marketing/desk-showcase-after-v1.png",
  "/marketing/desk-showcase-after-v2.png",
  "/marketing/desk-showcase-after-v3.png",
  "/marketing/desk-showcase-after-v4.png",
  "/marketing/desk-showcase-after-v5.png",
  "/marketing/desk-showcase-after-v6.png",
  "/marketing/desk-showcase-after-v7.png",
  "/marketing/desk-showcase-after-v8.png",
  "/marketing/desk-showcase-after-v9.png",
  "/marketing/desk-showcase-after-v10.png",
  "/marketing/desk-showcase-after-v10b.png",
  "/marketing/desk-showcase-after-v10c.png",
  "/marketing/desk-showcase-after.png",
] as const;
