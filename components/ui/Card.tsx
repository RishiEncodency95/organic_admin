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
      className={`rounded-none bg-white ${PADDING_CLASSES[padding]} ${className}`}
      style={{ boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px" }}
      {...props}
    >
      {children}
    </div>
  );
}
