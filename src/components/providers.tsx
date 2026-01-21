"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { CelebrationProvider } from "@/components/shared/celebration";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <CelebrationProvider>
        {children}
      </CelebrationProvider>
    </ThemeProvider>
  );
}
