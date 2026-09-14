interface GradientBackgroundProps {
  children: React.ReactNode;
  className?: string;
  /** `immersive` = full desk photo (home). `app` = dark shell without heavy photo. */
  variant?: "immersive" | "app" | "default" | "minimal";
}

export function GradientBackground({
  children,
  className = "",
  variant = "app",
}: GradientBackgroundProps) {
  const immersive = variant === "immersive";

  return (
    <div
      className={`relative min-h-dvh overflow-hidden bg-[#1a1c18] text-white ${className}`}
    >
      {immersive ? (
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "image-set(url(/marketing/hero-desk-a-480.webp) 1x, url(/marketing/hero-desk-a-720.webp) 2x)",
          }}
          aria-hidden
        />
      ) : null}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: immersive
            ? "linear-gradient(180deg, rgba(26,28,24,0.5) 0%, rgba(26,28,24,0.78) 45%, rgba(26,28,24,0.94) 100%)"
            : "linear-gradient(165deg, #22251f 0%, #1a1c18 55%, #151714 100%)",
        }}
        aria-hidden
      />
      {immersive ? (
        <>
          <div className="pointer-events-none absolute -right-16 top-28 hidden h-64 w-64 rounded-full bg-plant/20 blur-3xl sm:block" />
          <div className="pointer-events-none absolute -left-20 bottom-24 hidden h-56 w-56 rounded-full bg-wood/15 blur-3xl sm:block" />
        </>
      ) : null}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
