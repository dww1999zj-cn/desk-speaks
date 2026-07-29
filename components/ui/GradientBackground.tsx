interface GradientBackgroundProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "minimal";
}

export function GradientBackground({
  children,
  className = "",
  variant = "default",
}: GradientBackgroundProps) {
  const bg = variant === "minimal" ? "bg-background" : "bg-soft-gradient";

  return (
    <div className={`min-h-dvh ${bg} ${className}`}>
      {variant === "default" ? (
        <div className="pointer-events-none fixed inset-0 hidden overflow-hidden md:block">
          <div className="absolute -top-40 -right-32 h-72 w-72 rounded-full bg-secondary/40 blur-3xl" />
          <div className="absolute -bottom-40 -left-32 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        </div>
      ) : null}
      <div className="relative">{children}</div>
    </div>
  );
}
