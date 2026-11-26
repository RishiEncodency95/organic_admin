import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/components/infrastructure/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium transition-colors outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4",
  {
    variants: {
      variant: {
        default: "bg-[#e20611] text-white shadow-xs hover:bg-[#c3050f]",
        secondary: "bg-[#f2efec] text-[#4a5560] hover:bg-[#f2efec]/70",
        outline: "border border-[#ddd8d3] bg-white text-[#1e2a38] shadow-xs hover:bg-[#f5f2f0]",
        ghost: "text-[#667585] hover:bg-[#f5f2f0] hover:text-[#1e2a38]",
        subtle: "bg-[#f3f1ef] text-[#1e2a38] hover:bg-[#f5f2f0]",
        destructive: "bg-[#b3261e] text-[#fdf6f5] shadow-xs hover:bg-[#b3261e]/90",
        link: "text-[#e20611] underline-offset-4 hover:underline",
      },
      size: {
        xs: "h-7 px-2.5 text-xs",
        sm: "h-8 px-3 text-[0.8125rem]",
        default: "h-9 px-4",
        lg: "h-10 px-5",
        icon: "size-9",
        "icon-sm": "size-8",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ComponentProps<"button">,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { buttonVariants };
