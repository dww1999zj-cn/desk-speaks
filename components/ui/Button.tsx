import { Link } from "@/i18n/navigation";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const variants = {
  primary:
    "bg-text text-white hover:bg-text/90 shadow-sm border border-transparent",
  secondary:
    "bg-white text-text border border-black/10 hover:bg-surface",
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
  const classes = `inline-flex touch-manipulation select-none items-center justify-center rounded-xl font-medium transition-colors duration-200 active:scale-[0.99] ${variants[variant]} ${sizes[size]} ${className}`;

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
