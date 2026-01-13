"use client";

import { SessionProvider } from "next-auth/react";
import { useBanCheck } from "@/hooks/use-ban-check";

function BanCheckWrapper({ children }: { children: React.ReactNode }) {
  useBanCheck();
  return <>{children}</>;
}

export function WorkerLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <BanCheckWrapper>
        {children}
      </BanCheckWrapper>
    </SessionProvider>
  );
}