import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger";

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
}

function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      "bg-cyan-400 text-slate-950 hover:bg-cyan-500",

    secondary:
      "bg-slate-800 text-white hover:bg-slate-700",

    danger:
      "bg-red-500 text-white hover:bg-red-600",
  };

  return (
    <button
      className={`
        rounded-xl
        px-6
        py-3
        font-semibold
        transition-all
        duration-200
        hover:scale-[1.02]
        active:scale-[0.98]
        disabled:cursor-not-allowed
        disabled:opacity-50
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;