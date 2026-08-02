"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
} from "lucide-react";

import { useUIStore } from "@/store/ui-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Category {
  id: string;
  name: string;
  nameEn?: string;
}

interface Product {
  id: string;
  title: string;
  price: number;
  quantity: number;
  unit: string;
  imageUrl: string | null;
  location: string;
  category: { id: string; name: string };
  seller: { id: string; name: string; avatar: string | null };
}

interface ProductsResponse {
  success: boolean;
  data: Product[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

const SORT_OPTIONS = [
  { value: "createdAt-desc", labelBn: "নতুন আগে", labelEn: "Newest First" },
  { value: "price-asc", labelBn: "কম দাম আগে", labelEn: "Price: Low to High" },
  {
    value: "price-desc",
    labelBn: "বেশি দাম আগে",
    labelEn: "Price: High to Low",
  },
];

export default function ProductsPage() {
  const { locale } = useUIStore();

  const [categories, setCategories] = React.useState<Category[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [meta, setMeta] = React.useState<ProductsResponse["meta"] | null>(null);
  const [loading, setLoading] = React.useState(true);

  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [categoryId, setCategoryId] = React.useState<string>("all");
  const [sort, setSort] = React.useState("createdAt-desc");
  const [page, setPage] = React.useState(1);

  // Fetch categories once
  React.useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/categories`,
        );
        const result = await res.json();
        setCategories(result?.data ?? []);
      } catch {
        setCategories([]);
      }
    }
    loadCategories();
  }, []);

  // Fetch products whenever filters change
  React.useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const [sortBy, sortOrder] = sort.split("-");
        const params = new URLSearchParams({
          page: String(page),
          limit: "12",
          sortBy: sortBy ?? "createdAt",
          sortOrder: sortOrder ?? "desc",
        });
        if (search) params.set("search", search);
        if (categoryId !== "all") params.set("categoryId", categoryId);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/products?${params.toString()}`,
        );
        const result: ProductsResponse = await res.json();

        setProducts(result.data ?? []);
        setMeta(result.meta ?? null);
      } catch {
        setProducts([]);
        setMeta(null);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [search, categoryId, sort, page]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-10 lg:px-8">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="font-bangla text-[28px] font-bold lg:text-[32px]">
          {locale === "bn" ? "সব পণ্য" : "All Products"}
        </h1>
        <p className="mt-1.5 font-bangla text-[15px] text-muted-foreground">
          {meta
            ? locale === "bn"
              ? `মোট ${meta.total} টি পণ্য পাওয়া গেছে`
              : `${meta.total} products found`
            : locale === "bn"
              ? "লোড হচ্ছে..."
              : "Loading..."}
        </p>
      </motion.div>

      {/* Filter bar */}
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={
              locale === "bn" ? "পণ্য খুঁজুন..." : "Search products..."
            }
            className="pl-9 font-bangla"
          />
        </form>

        <Select
          value={categoryId}
          onValueChange={(v) => {
            if (!v) return;
            setCategoryId(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <SelectValue
              placeholder={locale === "bn" ? "ক্যাটাগরি" : "Category"}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {locale === "bn" ? "সব ক্যাটাগরি" : "All Categories"}
            </SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={sort}
          onValueChange={(v) => {
            if (!v) return;
            setSort(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-[190px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {locale === "bn" ? opt.labelBn : opt.labelEn}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Product grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-[290px] animate-pulse rounded-2xl border border-border bg-surface"
            />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-24 text-center">
          <ImageIcon className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="font-bangla text-[15px] text-muted-foreground">
            {locale === "bn" ? "কোনো পণ্য পাওয়া যায়নি" : "No products found"}
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-2 gap-5 lg:grid-cols-4"
        >
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative flex h-[150px] items-center justify-center bg-muted">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                )}
              </div>
              <div className="p-4">
                <div className="mb-0.5 truncate font-bangla text-[15.5px] font-semibold">
                  {product.title}
                </div>
                <div className="mb-2.5 flex items-center gap-1 font-bangla text-[12.5px] text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {product.location}
                </div>
                <div className="text-base font-bold text-primary">
                  ৳{product.price}
                  <span className="ml-1 font-bangla text-xs font-medium text-muted-foreground">
                    /{product.unit}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </motion.div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-bangla text-sm text-muted-foreground">
            {locale === "bn"
              ? `${page} / ${meta.totalPages}`
              : `Page ${page} of ${meta.totalPages}`}
          </span>
          <Button
            variant="outline"
            size="icon"
            disabled={page >= meta.totalPages}
            onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
