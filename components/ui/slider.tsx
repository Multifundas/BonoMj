"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type SliderProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value"
> & {
  value: number;
  onValueChange: (v: number) => void;
};

/** Slider basado en input range nativo, estilizado con Tailwind. */
const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value, onValueChange, ...props }, ref) => (
    <input
      ref={ref}
      type="range"
      value={value}
      onChange={(e) => onValueChange(Number(e.target.value))}
      className={cn(
        "h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-primary",
        className,
      )}
      {...props}
    />
  ),
);
Slider.displayName = "Slider";

export { Slider };
