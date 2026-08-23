"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { XCircle } from "lucide-react";

import { useUIStore } from "@/store/ui-store";
import { Button } from "@/components/ui/button";

export default function PaymentFailPage() {
  const { locale } = useUIStore();
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");

  return (
    <div className="flex min-h-[calc(100vh-76px)] items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[440px] text-center"
      >
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-danger/10">
          <XCircle className="h-9 w-9 text-danger" />
        </div>

        <h1 className="font-bangla text-2xl font-bold">
          {locale === "bn" ? "পেমেন্ট ব্যর্থ হয়েছে" : "Payment Failed"}
        </h1>
        <p className="mt-2 font-bangla text-[15px] text-muted-foreground">
          {reason === "invalid_request"
            ? locale === "bn"
              ? "অবৈধ অনুরোধ, আবার চেষ্টা করুন"
              : "Invalid request, please try again"
            : locale === "bn"
              ? "পেমেন্ট প্রক্রিয়াকরণে সমস্যা হয়েছে, টাকা কাটা হয়নি"
              : "There was a problem processing your payment, no amount was deducted"}
        </p>

        <div className="mt-8 flex flex-col gap-2.5">
          <Button
            asChild
            className="bg-primary text-white hover:bg-primary-hover"
          >
            <Link href="/dashboard">
              {locale === "bn" ? "ড্যাশবোর্ডে ফিরুন" : "Back to Dashboard"}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/products">
              {locale === "bn" ? "সব পণ্য দেখুন" : "Browse Products"}
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
