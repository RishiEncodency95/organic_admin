import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md";
}

const PADDING_CLASSES = {
  none: "",
  sm: "p-3",
  md: "p-4",
};

export default function Card({ padding = "md", className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`rounded-none border border-white/60 bg-white/40 backdrop-blur-xl shadow-sm ${PADDING_CLASSES[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
