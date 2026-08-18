"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ImageIcon,
  Package,
  ShoppingBag,
  Inbox,
  Plus,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
} from "lucide-react";

import { useUIStore } from "@/store/ui-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface MyProduct {
  id: string;
  title: string;
  price: number;
  quantity: number;
  unit: string;
  imageUrl: string | null;
  category: { name: string };
}

interface OrderItem {
  id: string;
  quantity: number;
  status: string;
  totalPrice: number;
  createdAt: string;
  product: {
    id: string;
    title: string;
    price: number;
    unit: string;
    imageUrl: string | null;
  };
}

interface SellerOrderItem extends OrderItem {
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

export default function DashboardPage() {
  const { locale } = useUIStore();
  const router = useRouter();

  const [tab, setTab] = React.useState("products");

  const [products, setProducts] = React.useState<MyProduct[]>([]);
  const [productsMeta, setProductsMeta] = React.useState<{
    page: number;
    totalPages: number;
  } | null>(null);
  const [loadingProducts, setLoadingProducts] = React.useState(true);
  const [productPage, setProductPage] = React.useState(1);

  const [orders, setOrders] = React.useState<OrderItem[]>([]);
  const [ordersMeta, setOrdersMeta] = React.useState<{
    page: number;
    totalPages: number;
  } | null>(null);
  const [loadingOrders, setLoadingOrders] = React.useState(true);
  const [orderPage, setOrderPage] = React.useState(1);

  const [sellerOrders, setSellerOrders] = React.useState<SellerOrderItem[]>([]);
  const [sellerOrdersMeta, setSellerOrdersMeta] = React.useState<{
    page: number;
    totalPages: number;
  } | null>(null);
  const [loadingSellerOrders, setLoadingSellerOrders] = React.useState(true);
  const [sellerOrderPage, setSellerOrderPage] = React.useState(1);
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);

  function authHeaders() {
    const token = localStorage.getItem("farmiq_access_token");
    return { Authorization: `Bearer ${token}` };
  }

  React.useEffect(() => {
    if (!localStorage.getItem("farmiq_access_token")) {
      router.push("/login");
    }
  }, [router]);

  React.useEffect(() => {
    async function loadProducts() {
      setLoadingProducts(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/products/my-products?page=${productPage}&limit=8`,
          { headers: authHeaders() }
        );
        const result = await res.json();
        setProducts(result?.data ?? []);
        setProductsMeta(result?.meta ?? null);
      } catch {
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    }
    loadProducts();
  }, [productPage]);

  React.useEffect(() => {
    async function loadOrders() {
      setLoadingOrders(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/orders/my-orders?page=${orderPage}&limit=8`,
          { headers: authHeaders() }
        );
        const result = await res.json();
        setOrders(result?.data ?? []);
        setOrdersMeta(result?.meta ?? null);
      } catch {
        setOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    }
    loadOrders();
  }, [orderPage]);

  const loadSellerOrders = React.useCallback(async () => {
    setLoadingSellerOrders(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/seller-orders?page=${sellerOrderPage}&limit=8`,
        { headers: authHeaders() }
      );
      const result = await res.json();
      setSellerOrders(result?.data ?? []);
      setSellerOrdersMeta(result?.meta ?? null);
    } catch {
      setSellerOrders([]);
    } finally {
      setLoadingSellerOrders(false);
    }
  }, [sellerOrderPage]);

  React.useEffect(() => {
    loadSellerOrders();
  }, [loadSellerOrders]);

  async function updateOrderStatus(orderId: string, status: string) {
    setUpdatingId(orderId);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
          },
          body: JSON.stringify({ status }),
        }
      );
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result?.message ?? "Update failed");
      }
      toast.success(locale === "bn" ? "অর্ডার আপডেট হয়েছে" : "Order updated");
      loadSellerOrders();
    } catch {
      toast.error(locale === "bn" ? "আপডেট করা যায়নি" : "Couldn't update order");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-10 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8 flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <h1 className="font-bangla text-[26px] font-bold lg:text-[28px]">
            {locale === "bn" ? "ড্যাশবোর্ড" : "Dashboard"}
          </h1>
          <p className="mt-1 font-bangla text-sm text-muted-foreground">
            {locale === "bn"
              ? "আপনার পণ্য ও অর্ডার এক জায়গায়"
              : "Your products and orders in one place"}
          </p>
        </div>
        <Button
          asChild
          className="gap-2 bg-primary text-white hover:bg-primary-hover"
        >
          <Link href="/sell">
            <Plus className="h-4 w-4" />
            {locale === "bn" ? "নতুন পণ্য যোগ করুন" : "Add Product"}
          </Link>
        </Button>
      </motion.div>

      <Tabs value={tab} onValueChange={(v) => v && setTab(v)}>
        <TabsList>
          <TabsTrigger value="products" className="gap-1.5 font-bangla">
            <Package className="h-4 w-4" />
            {locale === "bn" ? "আমার পণ্য" : "My Products"}
          </TabsTrigger>
          <TabsTrigger value="orders" className="gap-1.5 font-bangla">
            <ShoppingBag className="h-4 w-4" />
            {locale === "bn" ? "আমার অর্ডার" : "My Orders"}
          </TabsTrigger>
          <TabsTrigger value="sellerOrders" className="gap-1.5 font-bangla">
            <Inbox className="h-4 w-4" />
            {locale === "bn" ? "বিক্রিত অর্ডার" : "Orders Received"}
          </TabsTrigger>
        </TabsList>

        {/* My Products */}
        <TabsContent value="products" className="mt-6">
          {loadingProducts ? (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[230px] animate-pulse rounded-2xl border border-border bg-surface"
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              icon={<Package className="h-9 w-9 text-muted-foreground" />}
              text={
                locale === "bn"
                  ? "এখনো কোনো পণ্য যোগ করেননি"
                  : "You haven't listed any products yet"
              }
              ctaHref="/sell"
              ctaText={
                locale === "bn" ? "প্রথম পণ্য যোগ করুন" : "Add your first product"
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {products.map((p) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.id}`}
                    className="group overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative flex h-[130px] items-center justify-center bg-muted">
                      {p.imageUrl ? (
                        <Image
                          src={p.imageUrl}
                          alt={p.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-7 w-7 text-muted-foreground/40" />
                      )}
                    </div>
                    <div className="p-3.5">
                      <div className="truncate font-bangla text-sm font-semibold">
                        {p.title}
                      </div>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-sm font-bold text-primary">
                          ৳{p.price}
                          <span className="ml-1 font-bangla text-xs font-medium text-muted-foreground">
                            /{p.unit}
                          </span>
                        </span>
                        <span className="font-bangla text-xs text-muted-foreground">
                          {locale === "bn"
                            ? `স্টক: ${p.quantity}`
                            : `Stock: ${p.quantity}`}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <PaginationBar
                locale={locale}
                page={productPage}
                totalPages={productsMeta?.totalPages ?? 1}
                onPageChange={setProductPage}
              />
            </>
          )}
        </TabsContent>

        {/* My Orders (as buyer) */}
        <TabsContent value="orders" className="mt-6">
          {loadingOrders ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[90px] animate-pulse rounded-xl border border-border bg-surface"
                />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <EmptyState
              icon={<ShoppingBag className="h-9 w-9 text-muted-foreground" />}
              text={
                locale === "bn"
                  ? "এখনো কোনো অর্ডার করেননি"
                  : "You haven't placed any orders yet"
              }
              ctaHref="/products"
              ctaText={locale === "bn" ? "পণ্য দেখুন" : "Browse products"}
            />
          ) : (
            <>
              <div className="space-y-3">
                {orders.map((order) => {
                  const style = STATUS_STYLE[order.status] ?? DEFAULT_STATUS_STYLE;
                  return (
                    <Link
                      key={order.id}
                      href={`/orders/${order.id}`}
                      className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-primary/30"
                    >
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
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-bangla text-sm font-semibold">
                          {order.product.title}
                        </div>
                        <div className="mt-0.5 font-bangla text-xs text-muted-foreground">
                          {order.quantity} {order.product.unit} · ৳
                          {order.totalPrice}
                        </div>
                      </div>
                      <Badge className={`shrink-0 font-bangla ${style.className}`}>
                        {locale === "bn" ? style.bn : style.en}
                      </Badge>
                    </Link>
                  );
                })}
              </div>
              <PaginationBar
                locale={locale}
                page={orderPage}
                totalPages={ordersMeta?.totalPages ?? 1}
                onPageChange={setOrderPage}
              />
            </>
          )}
        </TabsContent>

        {/* Orders Received (as seller) */}
        <TabsContent value="sellerOrders" className="mt-6">
          {loadingSellerOrders ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[100px] animate-pulse rounded-xl border border-border bg-surface"
                />
              ))}
            </div>
          ) : sellerOrders.length === 0 ? (
            <EmptyState
              icon={<Inbox className="h-9 w-9 text-muted-foreground" />}
              text={
                locale === "bn"
                  ? "আপনার পণ্যে এখনো কোনো অর্ডার আসেনি"
                  : "No orders received on your products yet"
              }
              ctaHref="/sell"
              ctaText={locale === "bn" ? "আরও পণ্য যোগ করুন" : "List more products"}
            />
          ) : (
            <>
              <div className="space-y-3">
                {sellerOrders.map((order) => {
                  const style = STATUS_STYLE[order.status] ?? DEFAULT_STATUS_STYLE;
                  const canAct = order.status === "PAYMENT_CONFIRMED";
                  return (
                    <div
                      key={order.id}
                      className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-surface p-4"
                    >
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
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-bangla text-sm font-semibold">
                          {order.product.title}
                        </div>
                        <div className="mt-0.5 font-bangla text-xs text-muted-foreground">
                          {locale === "bn" ? "ক্রেতা: " : "Buyer: "}
                          {order.buyer.name}
                          {order.buyer.phone ? ` · ${order.buyer.phone}` : ""}
                        </div>
                        <div className="mt-0.5 font-bangla text-xs text-muted-foreground">
                          {order.quantity} {order.product.unit} · ৳{order.totalPrice}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {canAct && (
                          <>
                            <Button
                              size="sm"
                              disabled={updatingId === order.id}
                              onClick={() =>
                                updateOrderStatus(order.id, "SELLER_CONFIRMED")
                              }
                              className="gap-1.5 bg-success text-white hover:bg-success/90"
                            >
                              <Check className="h-3.5 w-3.5" />
                              {locale === "bn" ? "গ্রহণ" : "Accept"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={updatingId === order.id}
                              onClick={() =>
                                updateOrderStatus(order.id, "SELLER_REJECTED")
                              }
                              className="gap-1.5 text-danger hover:bg-danger/10"
                            >
                              <X className="h-3.5 w-3.5" />
                              {locale === "bn" ? "বাতিল" : "Reject"}
                            </Button>
                          </>
                        )}
                        <Badge className={`shrink-0 font-bangla ${style.className}`}>
                          {locale === "bn" ? style.bn : style.en}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
              <PaginationBar
                locale={locale}
                page={sellerOrderPage}
                totalPages={sellerOrdersMeta?.totalPages ?? 1}
                onPageChange={setSellerOrderPage}
              />
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({
  icon,
  text,
  ctaHref,
  ctaText,
}: {
  icon: React.ReactNode;
  text: string;
  ctaHref: string;
  ctaText: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
      {icon}
      <p className="mt-3 font-bangla text-[15px] text-muted-foreground">
        {text}
      </p>
      <Link
        href={ctaHref}
        className="mt-4 font-bangla text-sm font-semibold text-primary hover:underline"
      >
        {ctaText} →
      </Link>
    </div>
  );
}

function PaginationBar({
  locale,
  page,
  totalPages,
  onPageChange,
}: {
  locale: "bn" | "en";
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="icon"
        disabled={page <= 1}
        onClick={() => onPageChange(Math.max(1, page - 1))}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="font-bangla text-sm text-muted-foreground">
        {locale === "bn"
          ? `${page} / ${totalPages}`
          : `Page ${page} of ${totalPages}`}
      </span>
      <Button
        variant="outline"
        size="icon"
        disabled={page >= totalPages}
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}