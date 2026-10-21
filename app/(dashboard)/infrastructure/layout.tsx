import { Suspense, type ReactNode } from "react";
import { InfraRoot } from "@/components/infrastructure/root";
import { InfrastructureShell } from "@/components/infrastructure/shell";

export default function InfrastructureLayout({ children }: { children: ReactNode }) {
  return (
    <InfraRoot>
      <Suspense fallback={null}>
        <InfrastructureShell>{children}</InfrastructureShell>
      </Suspense>
    </InfraRoot>
  );
}
