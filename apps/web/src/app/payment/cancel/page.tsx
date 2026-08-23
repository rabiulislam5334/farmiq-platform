"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

import { useUIStore } from "@/store/ui-store";
import { Button } from "@/components/ui/button";

export default function PaymentCancelPage() {
  const { locale } = useUIStore();

  return (
    <div className="flex min-h-[calc(100vh-76px)] items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[440px] text-center"
      >
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-warning/10">
          <AlertCircle className="h-9 w-9 text-warning" />
        </div>

        <h1 className="font-bangla text-2xl font-bold">
          {locale === "bn" ? "পেমেন্ট বাতিল করা হয়েছে" : "Payment Cancelled"}
        </h1>
        <p className="mt-2 font-bangla text-[15px] text-muted-foreground">
          {locale === "bn"
            ? "আপনি পেমেন্ট প্রক্রিয়া বাতিল করেছেন, অর্ডার এখনো নিশ্চিত হয়নি"
            : "You cancelled the payment process, your order is not confirmed yet"}
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
