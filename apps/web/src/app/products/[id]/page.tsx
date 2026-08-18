"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  MapPin,
  Minus,
  Plus,
  MessageCircle,
  ShoppingCart,
  ImageIcon,
  ChevronRight,
  Store,
} from "lucide-react";

import { useUIStore } from "@/store/ui-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProductDetail {
  id: string;
  title: string;
  description: string | null;
  price: number;
  quantity: number;
  unit: string;
  imageUrl: string | null;
  location: string;
  category: { id: string; name: string };
  seller: {
    id: string;
    name: string;
    avatar: string | null;
    phone: string | null;
  };
}

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { locale } = useUIStore();

  const [product, setProduct] = React.useState<ProductDetail | null>(null);
  const [related, setRelated] = React.useState<ProductDetail[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [notFound, setNotFound] = React.useState(false);
  const [qty, setQty] = React.useState(1);

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      setNotFound(false);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/products/${params.id}`,
        );
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        const result = await res.json();
        setProduct(result.data);
        setQty(1);

        const relatedRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/products/${params.id}/related`,
        );
        const relatedResult = await relatedRes.json();
        setRelated(relatedResult?.data ?? []);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    if (params.id) load();
  }, [params.id]);

  function isLoggedIn() {
    return !!localStorage.getItem("farmiq_access_token");
  }

function handleOrder() {
  if (!isLoggedIn()) {
    router.push("/login");
    return;
  }
  router.push(`/checkout?productId=${product?.id}&quantity=${qty}`);
}

  function handleChat() {
    if (!isLoggedIn()) {
      router.push("/login");
      return;
    }
    // TODO: Chat module wire হবে এখানে, যখন Chat page বানানো হবে
    toast.info(
      locale === "bn" ? "চ্যাট ফিচার শীঘ্রই আসছে" : "Chat feature coming soon",
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-[1200px] animate-pulse px-6 py-10 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div className="h-[420px] rounded-2xl bg-muted" />
          <div className="space-y-4">
            <div className="h-6 w-1/3 rounded bg-muted" />
            <div className="h-9 w-3/4 rounded bg-muted" />
            <div className="h-24 rounded bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-center px-6 py-24 text-center">
        <ImageIcon className="mb-4 h-12 w-12 text-muted-foreground" />
        <h1 className="font-bangla text-xl font-bold">
          {locale === "bn" ? "পণ্যটি পাওয়া যায়নি" : "Product not found"}
        </h1>
        <Link
          href="/products"
          className="mt-4 font-bangla text-sm font-semibold text-primary hover:underline"
        >
          {locale === "bn" ? "সব পণ্য দেখুন →" : "Browse all products →"}
        </Link>
      </div>
    );
  }

  const outOfStock = product.quantity <= 0;

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-10 lg:px-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-1.5 font-bangla text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          {locale === "bn" ? "হোম" : "Home"}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/products" className="hover:text-foreground">
          {locale === "bn" ? "সব পণ্য" : "Products"}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="truncate text-foreground">{product.title}</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-1 gap-10 lg:grid-cols-2"
      >
        {/* Image */}
        <div className="relative flex h-[320px] items-center justify-center overflow-hidden rounded-2xl bg-muted lg:h-[420px]">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.title}
              fill
              className="object-cover"
            />
          ) : (
            <ImageIcon className="h-14 w-14 text-muted-foreground/40" />
          )}
        </div>

        {/* Info */}
        <div>
          <Badge variant="secondary" className="mb-3 font-bangla">
            {product.category.name}
          </Badge>

          <h1 className="font-bangla text-2xl font-bold leading-snug lg:text-3xl">
            {product.title}
          </h1>

          <div className="mt-2 flex items-center gap-1.5 font-bangla text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {product.location}
          </div>

          <div className="mt-5 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-primary">
              ৳{product.price}
            </span>
            <span className="font-bangla text-sm font-medium text-muted-foreground">
              /{product.unit}
            </span>
          </div>

          <p className="mt-1 font-bangla text-sm text-muted-foreground">
            {outOfStock
              ? locale === "bn"
                ? "স্টক শেষ"
                : "Out of stock"
              : locale === "bn"
                ? `${product.quantity} ${product.unit} উপলব্ধ`
                : `${product.quantity} ${product.unit} available`}
          </p>

          {product.description && (
            <p className="mt-5 font-bangla text-[15px] leading-relaxed text-foreground/85">
              {product.description}
            </p>
          )}

          {/* Quantity selector */}
          {!outOfStock && (
            <div className="mt-6 flex items-center gap-3">
              <span className="font-bangla text-sm font-medium">
                {locale === "bn" ? "পরিমাণ" : "Quantity"}
              </span>
              <div className="flex items-center rounded-lg border border-border">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="flex h-9 w-9 items-center justify-center text-foreground hover:bg-muted"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-10 text-center font-sans text-sm font-semibold">
                  {qty}
                </span>
                <button
                  onClick={() =>
                    setQty((q) => Math.min(product.quantity, q + 1))
                  }
                  className="flex h-9 w-9 items-center justify-center text-foreground hover:bg-muted"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <span className="font-bangla text-sm text-muted-foreground">
                {product.unit}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              onClick={handleOrder}
              disabled={outOfStock}
              className="gap-2 bg-primary text-white hover:bg-primary-hover"
              size="lg"
            >
              <ShoppingCart className="h-4 w-4" />
              {locale === "bn" ? "অর্ডার করুন" : "Order Now"}
            </Button>
            <Button
              onClick={handleChat}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              {locale === "bn" ? "বিক্রেতার সাথে চ্যাট" : "Chat with Seller"}
            </Button>
          </div>

          {/* Seller card */}
          <div className="mt-8 flex items-center gap-3 rounded-xl border border-border p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              {product.seller.avatar ? (
                <Image
                  src={product.seller.avatar}
                  alt={product.seller.name}
                  width={44}
                  height={44}
                  className="rounded-full object-cover"
                />
              ) : (
                <Store className="h-5 w-5" />
              )}
            </div>
            <div>
              <div className="font-bangla text-sm font-semibold">
                {product.seller.name}
              </div>
              <div className="font-bangla text-xs text-muted-foreground">
                {locale === "bn" ? "বিক্রেতা" : "Seller"}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-6 font-bangla text-xl font-bold">
            {locale === "bn" ? "সম্পর্কিত পণ্য" : "Related Products"}
          </h2>
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/products/${r.id}`}
                className="group overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative flex h-[130px] items-center justify-center bg-muted">
                  {r.imageUrl ? (
                    <Image
                      src={r.imageUrl}
                      alt={r.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-7 w-7 text-muted-foreground/40" />
                  )}
                </div>
                <div className="p-3.5">
                  <div className="truncate font-bangla text-sm font-semibold">
                    {r.title}
                  </div>
                  <div className="mt-1 text-sm font-bold text-primary">
                    ৳{r.price}
                    <span className="ml-1 font-bangla text-xs font-medium text-muted-foreground">
                      /{r.unit}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
