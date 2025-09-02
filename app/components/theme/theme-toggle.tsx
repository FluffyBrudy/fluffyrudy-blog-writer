"use client";

import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ToggleTheme() {
  const [mounted, setMounted] = useState(false);
  const { setTheme, resolvedTheme = "dark" } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Button
      className="fixed bottom-4 right-4 p-2 bg-primary text-primary-foreground"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {resolvedTheme === "dark" ? "Light Mode" : "Dark Mode"}
    </Button>
  );
}
