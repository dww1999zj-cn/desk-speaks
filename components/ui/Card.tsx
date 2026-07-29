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
    variant === "gradient" ? "bg-card-gradient" : "bg-white";

  return (
    <div
      className={`${bg} rounded-2xl border border-black/5 p-5 md:p-6 ${className}`}
    >
      {children}
    </div>
  );
}
