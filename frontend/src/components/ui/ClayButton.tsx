import { AnchorHTMLAttributes } from "react";

type ClayButtonProps = AnchorHTMLAttributes<HTMLAnchorElement>;

export function ClayButton({ className = "", children, ...props }: ClayButtonProps) {
  return (
    <a
      className={`clay-button inline-flex items-center justify-center rounded-[26px] px-6 py-3 text-base font-semibold transition-transform duration-150 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0b4f67]/35 ${className}`}
      {...props}
    >
      {children}
    </a>
  );
}
