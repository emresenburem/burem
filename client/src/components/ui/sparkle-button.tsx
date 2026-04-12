import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SparkleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "destructive" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  children: React.ReactNode;
  className?: string;
}

export function SparkleButton({ children, className, variant, size, ...props }: SparkleButtonProps) {
  return (
    <div className="relative inline-block overflow-hidden rounded-[6px] group">
      {/* CSS-only shimmer — GPU composited, sıfır JS maliyeti */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-none group-hover:translate-x-full group-hover:duration-500"
        style={{ transitionProperty: "transform" }}
      />
      <Button
        variant={variant}
        size={size}
        className={cn("relative", className)}
        {...props}
      >
        {children}
      </Button>
    </div>
  );
}
