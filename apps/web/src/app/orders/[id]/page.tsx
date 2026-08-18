"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ImageIcon, MapPin, Phone, ChevronRight } from "lucide-react";

import { useUIStore } from "@/store/ui-store";
import { Badge } from "@/components/ui/badge";

interface OrderDetail {
  id: string;
  quantity: number;
  totalPrice: number;
  status: string;
  address: string | null;
  createdAt: string;
  product: {
    id: string;
    title: string;
    unit: string;
    imageUrl: string | null;
    seller: { id: string; name: string; phone: string | null };
  };
  buyer: { id: string; name: string; phone: string | null };
}

const STATUS_STYLE: Record<
  string,
  { bn: string; en: string; className: string }
> = {
  PAYMENT_PENDING: {
    bn: "পেমেন্ট বাকি",
    en: "Payment Pending",
    className: "bg-warning/10 text-warning",
  },
  PAYMENT_CONFIRMED: {
    bn: "পেমেন্ট নিশ্চিত",
    en: "Payment Confirmed",
    className: "bg-primary/10 text-primary",
  },
  SELLER_CONFIRMED: {
    bn: "বিক্রেতা নিশ্চিত করেছেন",
    en: "Seller Confirmed",
    className: "bg-primary/10 text-primary",
  },
  SELLER_REJECTED: {
    bn: "বিক্রেতা বাতিল করেছেন",
    en: "Seller Rejected",
    className: "bg-danger/10 text-danger",
  },
  PROCESSING: {
    bn: "প্রস্তুত করা হচ্ছে",
    en: "Processing",
    className: "bg-warning/10 text-warning",
  },
  SHIPPED: {
    bn: "পাঠানো হয়েছে",
    en: "Shipped",
    className: "bg-primary/10 text-primary",
  },
  OUT_FOR_DELIVERY: {
    bn: "ডেলিভারিতে আছে",
    en: "Out for Delivery",
    className: "bg-primary/10 text-primary",
  },
  DELIVERED: {
    bn: "পৌঁছে গেছে",
    en: "Delivered",
    className: "bg-success/10 text-success",
  },
  COMPLETED: {
    bn: "সম্পন্ন",
    en: "Completed",
    className: "bg-success/10 text-success",
  },
  CANCELLED: {
    bn: "বাতিল",
    en: "Cancelled",
    className: "bg-danger/10 text-danger",
  },
  DISPUTED: {
    bn: "বিতর্কিত",
    en: "Disputed",
    className: "bg-danger/10 text-danger",
  },
  REFUNDED: {
    bn: "ফেরত দেওয়া হয়েছে",
    en: "Refunded",
    className: "bg-muted text-muted-foreground",
  },
};
const DEFAULT_STATUS_STYLE = STATUS_STYLE.PAYMENT_PENDING as {
  bn: string;
  en: string;
  className: string;
};

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { locale } = useUIStore();

  const [order, setOrder] = React.useState<OrderDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [notFound, setNotFound] = React.useState(false);

  React.useEffect(() => {
    if (!localStorage.getItem("farmiq_access_token")) {
      router.push("/login");
      return;
    }

    async function load() {
      try {
        const token = localStorage.getItem("farmiq_access_token");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/orders/${params.id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (res.status === 404 || res.status === 403) {
          setNotFound(true);
          return;
        }
        const result = await res.json();
        setOrder(result.data);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    if (params.id) load();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="mx-auto max-w-[700px] px-6 py-16">
        <div className="h-72 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="mx-auto max-w-[700px] px-6 py-24 text-center">
        <p className="font-bangla text-muted-foreground">
          {locale === "bn" ? "অর্ডার পাওয়া যায়নি" : "Order not found"}
        </p>
        <Link
          href="/dashboard"
          className="mt-3 inline-block text-primary hover:underline"
        >
          {locale === "bn" ? "ড্যাশবোর্ডে ফিরুন →" : "Back to dashboard →"}
        </Link>
      </div>
    );
  }

  const style = STATUS_STYLE[order.status] ?? DEFAULT_STATUS_STYLE;

  return (
    <div className="mx-auto max-w-[700px] px-6 py-10 lg:px-8">
      <div className="mb-6 flex items-center gap-1.5 font-bangla text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground">
          {locale === "bn" ? "ড্যাশবোর্ড" : "Dashboard"}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">
          {locale === "bn" ? "অর্ডার বিবরণ" : "Order Details"}
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl border border-border bg-surface p-6 sm:p-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bangla text-xs text-muted-foreground">
              {locale === "bn" ? "অর্ডার আইডি" : "Order ID"}
            </p>
            <p className="font-mono text-sm">{order.id}</p>
          </div>
          <Badge className={`font-bangla ${style.className}`}>
            {locale === "bn" ? style.bn : style.en}
          </Badge>
        </div>

        <div className="mt-6 flex items-center gap-4 border-t border-border pt-6">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-muted">
            {order.product.imageUrl ? (
              <Image
                src={order.product.imageUrl}
                alt={order.product.title}
                fill
                className="rounded-lg object-cover"
              />
            ) : (
              <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
            )}
          </div>
          <div className="flex-1">
            <Link
              href={`/products/${order.product.id}`}
              className="font-bangla text-[15px] font-semibold hover:text-primary"
            >
              {order.product.title}
            </Link>
            <div className="mt-0.5 font-bangla text-sm text-muted-foreground">
              {order.quantity} {order.product.unit}
            </div>
          </div>
          <div className="text-lg font-bold text-primary">
            ৳{order.totalPrice}
          </div>
        </div>

        {order.address && (
          <div className="mt-5 flex items-start gap-2 border-t border-border pt-5">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="font-bangla text-xs text-muted-foreground">
                {locale === "bn" ? "ডেলিভারি ঠিকানা" : "Delivery Address"}
              </p>
              <p className="font-bangla text-sm">{order.address}</p>
            </div>
          </div>
        )}

        <div className="mt-5 flex items-center gap-2 border-t border-border pt-5">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="font-bangla text-xs text-muted-foreground">
              {locale === "bn" ? "বিক্রেতা" : "Seller"}
            </p>
            <p className="font-bangla text-sm">
              {order.product.seller.name}
              {order.product.seller.phone
                ? ` · ${order.product.seller.phone}`
                : ""}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
