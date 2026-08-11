import type { HTMLAttributes, ReactNode } from "react";

type BadgeVariant =
  | "primary"
  | "success"
  | "danger";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: BadgeVariant;
}

function Badge({
  children,
  variant = "primary",
  className = "",
  ...props
}: BadgeProps) {
  const variants = {
    primary:
      "bg-cyan-500/20 text-cyan-400",

    success:
      "bg-emerald-500/20 text-emerald-400",

    danger:
      "bg-red-500/20 text-red-400",
  };

  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-full
        px-3
        py-1
        text-sm
        font-medium
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;