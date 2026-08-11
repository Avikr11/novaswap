import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

function Card({
  children,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={`
  rounded-2xl
  border
  border-slate-800
  bg-slate-900
  p-6
  shadow-lg
  transition-all
  duration-200
  hover:-translate-y-1
  hover:border-cyan-500/30
  hover:shadow-xl
  ${className}
`}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;