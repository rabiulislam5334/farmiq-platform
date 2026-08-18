"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ImageIcon, Loader2, Wallet, Truck } from "lucide-react";

import { useUIStore } from "@/store/ui-store";
import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ProductSummary {
  id: string;
  title: string;
  price: number;
  unit: string;
  imageUrl: string | null;
}

type PaymentMethod = "CASH_ON_DELIVERY" | "SSLCOMMERZ";

export default function CheckoutPage() {
  const { locale } = useUIStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  const productId = searchParams.get("productId") ?? "";
  const quantity = Number(searchParams.get("quantity") ?? "1");

  const [product, setProduct] = React.useState<ProductSummary | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [address, setAddress] = React.useState("");
  const [method, setMethod] = React.useState<PaymentMethod>("CASH_ON_DELIVERY");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function authHeaders() {
    const token = localStorage.getItem("farmiq_access_token");
    return { Authorization: `Bearer ${token}` };
  }

  React.useEffect(() => {
    if (!localStorage.getItem("farmiq_access_token")) {
      router.push("/login");
      return;
    }
    if (!productId) {
      router.push("/products");
      return;
    }

    async function loadProduct() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/products/${productId}`,
        );
        const result = await res.json();
        setProduct(result.data);
      } catch {
        setError(
          locale === "bn" ? "পণ্য লোড করা যায়নি" : "Couldn't load product",
        );
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [productId, router, locale]);

  async function handlePlaceOrder() {
    if (!address.trim()) {
      setError(
        locale === "bn"
          ? "ডেলিভারি ঠিকানা দিন"
          : "Please enter a delivery address",
      );
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      // Step 1: Order তৈরি করা
      const orderRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify({ productId, quantity, address }),
        },
      );
      const orderResult = await orderRes.json();

      if (!orderRes.ok || !orderResult.success) {
        const msg = Array.isArray(orderResult.message)
          ? orderResult.message[0]
          : orderResult.message;
        throw new Error(msg ?? "Order creation failed");
      }

      const orderId = orderResult.data.id;

      // Step 2: Payment initiate করা
      const paymentRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payment/initiate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify({ orderId, method }),
        },
      );
      const paymentResult = await paymentRes.json();

      if (!paymentRes.ok || !paymentResult.success) {
        const msg = Array.isArray(paymentResult.message)
          ? paymentResult.message[0]
          : paymentResult.message;
        throw new Error(msg ?? "Payment initiation failed");
      }

      if (method === "CASH_ON_DELIVERY") {
        toast.success(
          locale === "bn"
            ? "অর্ডার সফলভাবে হয়েছে!"
            : "Order placed successfully!",
        );
        router.push(`/orders/${orderId}`);
      } else if (paymentResult.data?.GatewayPageURL) {
        // SSLCommerz gateway-তে redirect
        window.location.href = paymentResult.data.GatewayPageURL;
      } else {
        throw new Error("Payment gateway URL missing");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : locale === "bn"
            ? "অর্ডার করা যায়নি"
            : "Couldn't place the order",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-[600px] px-6 py-16">
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-[600px] px-6 py-24 text-center">
        <p className="font-bangla text-muted-foreground">
          {locale === "bn" ? "পণ্য পাওয়া যায়নি" : "Product not found"}
        </p>
        <Link
          href="/products"
          className="mt-3 inline-block text-primary hover:underline"
        >
          {locale === "bn" ? "সব পণ্য দেখুন →" : "Browse products →"}
        </Link>
      </div>
    );
  }

  const total = product.price * quantity;

  return (
    <div className="mx-auto max-w-[600px] px-6 py-12 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-bangla text-2xl font-bold">
          {locale === "bn" ? "অর্ডার নিশ্চিত করুন" : "Confirm Your Order"}
        </h1>

        {/* Product summary */}
        <div className="mt-6 flex items-center gap-4 rounded-xl border border-border bg-surface p-4">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-muted">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.title}
                fill
                className="rounded-lg object-cover"
              />
            ) : (
              <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
            )}
          </div>
          <div className="flex-1">
            <div className="font-bangla text-sm font-semibold">
              {product.title}
            </div>
            <div className="mt-0.5 font-bangla text-xs text-muted-foreground">
              {quantity} {product.unit} × ৳{product.price}
            </div>
          </div>
          <div className="text-lg font-bold text-primary">৳{total}</div>
        </div>

        {/* Address */}
        <div className="mt-6">
          <label className="mb-2 block font-bangla text-sm font-medium">
            {locale === "bn" ? "ডেলিভারি ঠিকানা" : "Delivery Address"}
          </label>
          <Textarea
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={
              locale === "bn"
                ? "সম্পূর্ণ ঠিকানা লিখুন..."
                : "Enter full delivery address..."
            }
            className="font-bangla"
          />
        </div>

        {/* Payment method */}
        <div className="mt-6">
          <label className="mb-2 block font-bangla text-sm font-medium">
            {locale === "bn" ? "পেমেন্ট পদ্ধতি" : "Payment Method"}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMethod("CASH_ON_DELIVERY")}
              className={`flex items-center gap-2.5 rounded-xl border p-4 text-left transition-colors ${
                method === "CASH_ON_DELIVERY"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <Truck className="h-5 w-5 text-primary" />
              <span className="font-bangla text-sm font-semibold">
                {locale === "bn" ? "ক্যাশ অন ডেলিভারি" : "Cash on Delivery"}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setMethod("SSLCOMMERZ")}
              className={`flex items-center gap-2.5 rounded-xl border p-4 text-left transition-colors ${
                method === "SSLCOMMERZ"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <Wallet className="h-5 w-5 text-primary" />
              <span className="font-bangla text-sm font-semibold">
                {locale === "bn" ? "অনলাইন পেমেন্ট" : "Online Payment"}
              </span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-lg bg-danger/10 px-3.5 py-2.5 font-bangla text-sm text-danger">
            {error}
          </div>
        )}

        <Button
          onClick={handlePlaceOrder}
          disabled={submitting}
          size="lg"
          className="mt-6 w-full gap-2 bg-primary text-white hover:bg-primary-hover"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {locale === "bn" ? "প্রসেস হচ্ছে..." : "Processing..."}
            </>
          ) : locale === "bn" ? (
            `৳${total} পেমেন্ট করে অর্ডার করুন`
          ) : (
            `Place Order — ৳${total}`
          )}
        </Button>
      </motion.div>
    </div>
  );
}
