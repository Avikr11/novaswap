import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={`
        w-full
        rounded-xl
        border
        border-slate-800
        bg-slate-950
        px-4
        py-3
        text-white
        outline-none
        placeholder:text-slate-500
        transition-all
        duration-200
        focus:border-cyan-400
        focus:ring-1
        focus:ring-cyan-400
        ${className}
      `}
      {...props}
    />
  );
}

export default Input;

