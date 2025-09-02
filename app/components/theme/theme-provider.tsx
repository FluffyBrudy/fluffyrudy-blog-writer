"use client";

import { ThemeProvider as MainThemeProvider } from "next-themes";
import { useEffect, useState } from "react";

interface IThemeProvider {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: IThemeProvider) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, [mounted]);
  if (!mounted) return <>{children}</>;
  return (
    <MainThemeProvider attribute="class" defaultTheme="system">
      {children}
    </MainThemeProvider>
  );
}
