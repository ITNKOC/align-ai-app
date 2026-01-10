"use client";

import { ReactNode } from "react";
import { CelebrationProvider } from "@/components/shared/celebration";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <CelebrationProvider>
      {children}
    </CelebrationProvider>
  );
}
