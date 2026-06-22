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
      className={`${bg} rounded-3xl shadow-lg shadow-primary/5 p-6 md:p-8 ${className}`}
    >
      {children}
    </div>
  );
}
