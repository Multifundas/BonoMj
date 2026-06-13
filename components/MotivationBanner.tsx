"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { QUOTES } from "@/lib/quotes";

/** Banner motivacional con frase rotativa (cada ~8s) y look cálido. */
export function MotivationBanner() {
  const [index, setIndex] = React.useState(() =>
    Math.floor(Math.random() * QUOTES.length),
  );
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      const t = setTimeout(() => {
        setIndex((i) => (i + 1) % QUOTES.length);
        setVisible(true);
      }, 350);
      return () => clearTimeout(t);
    }, 8000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-accent to-secondary px-5 py-4 shadow-sm">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
        <Sparkles className="size-5" />
      </div>
      <p
        className={`text-sm font-medium text-foreground transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        {QUOTES[index]}
      </p>
    </div>
  );
}
