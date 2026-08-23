"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = React.useState(false);
  const [allowed, setAllowed] = React.useState(false);

  React.useEffect(() => {
    const token = localStorage.getItem("farmiq_access_token");
    const raw = localStorage.getItem("farmiq_user");

    if (!token || !raw) {
      router.push("/login");
      return;
    }

    try {
      const user = JSON.parse(raw);
      if (user.role !== "ADMIN") {
        router.push("/");
        return;
      }
      setAllowed(true);
    } catch {
      router.push("/login");
    } finally {
      setChecked(true);
    }
  }, [router]);

  if (!checked || !allowed) {
    return (
      <div className="flex min-h-[calc(100vh-76px)] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
