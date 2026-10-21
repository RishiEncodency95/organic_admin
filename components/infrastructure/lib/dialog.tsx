"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import * as React from "react";
import { cn } from "./cn";
import { ScrollLock } from "./scroll-lock";

/*
 * Same dialog as the original (Radix), with the original's design tokens written out (card = white, border = #ece9e6,
 * foreground = #1e2a38, muted = #667585) and its open/close animation defined in infra.css. The content is wrapped in
 * `.infra-root` because Radix portals it to <body>, outside the module's own style scope.
 */
export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

function Overlay({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      className={cn("infra-overlay fixed inset-0 z-[60] bg-[#1e2a38]/25 backdrop-blur-[2px] overscroll-contain", className)}
      onWheel={(e) => {
        if (e.target === e.currentTarget) e.preventDefault();
      }}
      onTouchMove={(e) => {
        if (e.target === e.currentTarget) e.preventDefault();
      }}
      {...props}
    />
  );
}

export function DialogContent({
  className,
  children,
  showClose = true,
  overlayClassName,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & { showClose?: boolean; overlayClassName?: string }) {
  return (
    <DialogPrimitive.Portal>
      <div className="infra-root">
        <Overlay className={overlayClassName} />
        <DialogPrimitive.Content
          className={cn(
            "infra-dialog fixed top-1/2 left-1/2 z-[60] grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-sm border border-[#ece9e6] bg-white p-6 text-[#1e2a38] shadow-lg overscroll-contain",
            className,
          )}
          {...props}
        >
          <ScrollLock />
          {children}
          {showClose ? (
            <DialogPrimitive.Close className="absolute top-4 right-4 rounded-sm p-1 text-[#667585] transition-colors hover:bg-[#f5f2f0] hover:text-[#1e2a38]">
              <XIcon className="size-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          ) : null}
        </DialogPrimitive.Content>
      </div>
    </DialogPrimitive.Portal>
  );
}

export function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-1.5 pr-8", className)} {...props} />;
}

export function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />;
}

export function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cn("text-base font-semibold text-[#1e2a38]", className)} {...props} />;
}

export function DialogDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description className={cn("text-[0.8125rem] text-[#667585]", className)} {...props} />;
}
