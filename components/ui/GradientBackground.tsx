interface GradientBackgroundProps {
  children: React.ReactNode;
  className?: string;
  /** `immersive` = full desk photo (home). `app` = same palette, softer photo for content pages. */
  variant?: "immersive" | "app" | "default" | "minimal";
}

export function GradientBackground({
  children,
  className = "",
  variant = "app",
}: GradientBackgroundProps) {
  const immersive = variant === "immersive";
  const photoOpacity = immersive ? 1 : 0.45;

  return (
    <div
      className={`relative min-h-dvh overflow-hidden bg-[#1a1c18] text-white ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url(/marketing/hero-desk-a-display.webp)",
          opacity: photoOpacity,
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: immersive
            ? "linear-gradient(180deg, rgba(26,28,24,0.55) 0%, rgba(26,28,24,0.78) 42%, rgba(26,28,24,0.94) 100%)"
            : "linear-gradient(180deg, rgba(26,28,24,0.82) 0%, rgba(26,28,24,0.92) 50%, rgba(26,28,24,0.97) 100%)",
        }}
        aria-hidden
      />
      <div className="pointer-events-none absolute -right-16 top-28 h-64 w-64 rounded-full bg-plant/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-24 h-56 w-56 rounded-full bg-wood/15 blur-3xl" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
