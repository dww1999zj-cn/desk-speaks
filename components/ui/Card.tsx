interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "gradient";
}

export function Card({
  children,
  className = "",
  variant = "default",
}: CardProps) {
  const bg =
    variant === "gradient"
      ? "bg-white/[0.08] backdrop-blur-md"
      : "bg-white/[0.06] backdrop-blur-md";

  return (
    <div
      className={`${bg} rounded-2xl border border-white/10 p-5 md:p-6 ${className}`}
    >
      {children}
    </div>
  );
}
