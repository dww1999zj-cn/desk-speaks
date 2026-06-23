interface GradientBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export function GradientBackground({
  children,
  className = "",
}: GradientBackgroundProps) {
  return (
    <div className={`min-h-dvh bg-soft-gradient ${className}`}>
      {/* 移动端去掉重度 blur，减轻 GPU 压力 */}
      <div className="pointer-events-none fixed inset-0 hidden overflow-hidden md:block">
        <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-secondary/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}
