"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { FaSun, FaMoon } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeToggleButton() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
  }, []);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "relative group rounded-full border-2 h-10 w-10",
        isDark
          ? "bg-foreground text-background hover:bg-accent"
          : "bg-background text-foreground hover:bg-accent"
      )}
      aria-label="Toggle theme"
    >
      {isDark ? <FaSun size={16} /> : <FaMoon size={16} />}
    </Button>
  );
}
