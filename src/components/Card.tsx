import { type ReactNode } from "react";
import clsx from "clsx";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  onClick?: () => void;
}

export function Card({
  children,
  className,
  padding = "md",
  onClick,
}: CardProps) {
  const paddingClass = {
    none: "",
    sm: "p-2",
    md: "p-4",
    lg: "p-6",
  }[padding];

  return (
    <div
      onClick={onClick}
      className={clsx(
        "bg-white rounded-lg shadow-sm border border-gray-200",
        paddingClass,
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}
