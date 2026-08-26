import { ReactNode } from "react";

type ClayCardProps = {
  children: ReactNode;
  className?: string;
};

export function ClayCard({ children, className = "" }: ClayCardProps) {
  return <section className={`clay-card rounded-[32px] p-8 ${className}`}>{children}</section>;
}
