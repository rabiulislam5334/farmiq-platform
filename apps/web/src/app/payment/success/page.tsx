"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";

import { useUIStore } from "@/store/ui-store";
import { Button } from "@/components/ui/button";

interface PaymentRecord {
  id: string;
  transactionId: string | null;
  amount: number;
  order: {
    id: string;
    product: { title: string };
  };
}

export default function PaymentSuccessPage() {
  const { locale } = useUIStore();
  const searchParams = useSearchParams();
  const tranId = searchParams.get("tran_id");

  const [payment, setPayment] = React.useState<PaymentRecord | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("farmiq_access_token");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/payment/history`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const result = await res.json();
        const match = (result?.data as PaymentRecord[])?.find(
          (p) => p.transactionId === tranId,
        );
        setPayment(match ?? null);
      } catch {
        setPayment(null);
      } finally {
        setLoading(false);
      }
    }
    if (tranId) load();
    else setLoading(false);
  }, [tranId]);

  return (
    <div className="flex min-h-[calc(100vh-76px)] items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[440px] text-center"
      >
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
          <CheckCircle2 className="h-9 w-9 text-success" />
        </div>

        <h1 className="font-bangla text-2xl font-bold">
          {locale === "bn" ? "পেমেন্ট সফল হয়েছে!" : "Payment Successful!"}
        </h1>
        <p className="mt-2 font-bangla text-[15px] text-muted-foreground">
          {locale === "bn"
            ? "আপনার অর্ডার নিশ্চিত করা হয়েছে, বিক্রেতা শীঘ্রই যোগাযোগ করবেন"
            : "Your order has been confirmed, the seller will reach out soon"}
        </p>

        {loading ? (
          <div className="mt-6 flex justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : payment ? (
          <div className="mt-6 rounded-xl border border-border bg-surface p-4 text-left">
            <div className="flex justify-between text-sm">
              <span className="font-bangla text-muted-foreground">
                {locale === "bn" ? "পণ্য" : "Product"}
              </span>
              <span className="font-bangla font-medium">
                {payment.order.product.title}
              </span>
            </div>
            <div className="mt-2 flex justify-between text-sm">
              <span className="font-bangla text-muted-foreground">
                {locale === "bn" ? "পরিমাণ" : "Amount"}
              </span>
              <span className="font-semibold text-primary">
                ৳{payment.amount}
              </span>
            </div>
          </div>
        ) : null}

        <div className="mt-8 flex flex-col gap-2.5">
          {payment && (
            <Button
              asChild
              className="bg-primary text-white hover:bg-primary-hover"
            >
              <Link href={`/orders/${payment.order.id}`}>
                {locale === "bn" ? "অর্ডার দেখুন" : "View Order"}
              </Link>
            </Button>
          )}
          <Button asChild variant="outline">
            <Link href="/products">
              {locale === "bn" ? "আরও কেনাকাটা করুন" : "Continue Shopping"}
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
