"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, XCircle, ArrowRight } from "lucide-react";

import { useUIStore } from "@/store/ui-store";

export default function AuthCallbackPage() {
  const { locale } = useUIStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = React.useState<"loading" | "success" | "error">(
    "loading",
  );

  React.useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      return;
    }

    async function completeLogin(accessToken: string) {
      try {
        localStorage.setItem("farmiq_access_token", accessToken);

        // Token দিয়ে user profile fetch করে localStorage-এ সেভ করছি,
        // যাতে email/password login-এর মতো একই "farmiq_user" data সবসময় থাকে
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (res.ok) {
          const result = await res.json();
          const user = result?.data ?? result;
          localStorage.setItem("farmiq_user", JSON.stringify(user));
        }

        setStatus("success");
        setTimeout(() => router.replace("/"), 900);
      } catch {
        setStatus("error");
      }
    }

    completeLogin(token);
  }, [searchParams, router]);

  return (
    <div className="flex min-h-[calc(100vh-76px)] items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        {status === "loading" && (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="font-bangla text-[15px] text-muted-foreground">
              {locale === "bn"
                ? "লগইন সম্পন্ন করা হচ্ছে..."
                : "Completing your login..."}
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className="h-10 w-10 text-success" />
            <p className="font-bangla text-[15px] text-foreground">
              {locale === "bn"
                ? "সফলভাবে লগইন হয়েছে, নিয়ে যাওয়া হচ্ছে..."
                : "Logged in successfully, redirecting..."}
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="h-10 w-10 text-danger" />
            <p className="font-bangla text-[15px] text-foreground">
              {locale === "bn"
                ? "লগইন সম্পন্ন করা যায়নি"
                : "Couldn't complete login"}
            </p>

            <a
              href="/login"
              className="flex items-center gap-1 font-bangla text-sm font-semibold text-primary hover:underline"
            >
              {locale === "bn" ? "আবার চেষ্টা করুন" : "Try again"}
              <ArrowRight className="h-4 w-4" />
            </a>
          </>
        )}
      </div>
    </div>
  );
}
