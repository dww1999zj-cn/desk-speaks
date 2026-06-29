import { Link } from "@/i18n/navigation";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const variants = {
  primary:
    "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/25 border-2 border-white/30",
  secondary:
    "bg-white text-primary border-2 border-primary/15 hover:bg-primary/5 shadow-sm",
  ghost: "bg-transparent text-muted hover:text-text",
};

const sizes = {
  sm: "px-4 py-2 text-sm min-h-[40px]",
  md: "px-6 py-3 text-base min-h-[44px]",
  lg: "px-8 py-4 text-lg min-h-[52px]",
};

export function Button({
  href,
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const classes = `inline-flex touch-manipulation select-none items-center justify-center rounded-full font-medium transition-colors duration-200 active:scale-[0.98] ${variants[variant]} ${sizes[size]} ${className}`;

  if (href) {
    return (
      <Link
        href={href}
        prefetch
        className={classes}
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
