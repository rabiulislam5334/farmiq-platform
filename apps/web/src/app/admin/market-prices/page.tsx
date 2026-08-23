"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Plus, Trash2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

import { useUIStore } from "@/store/ui-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
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
}

interface MarketPrice {
  id: string;
  cropName: string;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  unit: string;
  date: string;
  category: { id: string; name: string };
}

export default function AdminMarketPricesPage() {
  const { locale } = useUIStore();
  const [prices, setPrices] = React.useState<MarketPrice[]>([]);
  const [meta, setMeta] = React.useState<{
    page: number;
    totalPages: number;
  } | null>(null);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [form, setForm] = React.useState({
    categoryId: "",
    cropName: "",
    minPrice: "",
    maxPrice: "",
    avgPrice: "",
    unit: "কেজি",
  });
  const [submitting, setSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  function authHeaders() {
    const token = localStorage.getItem("farmiq_access_token");
    return { Authorization: `Bearer ${token}` };
  }

  const loadPrices = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/market-prices?page=${page}&limit=15`,
        { headers: authHeaders() },
      );
      const result = await res.json();
      setPrices(result?.data ?? []);
      setMeta(result?.meta ?? null);
    } catch {
      setPrices([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  React.useEffect(() => {
    loadPrices();
  }, [loadPrices]);

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

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const min = Number(form.minPrice);
    const max = Number(form.maxPrice);
    const avg = Number(form.avgPrice);

    if (!form.categoryId || !form.cropName.trim()) {
      setFormError(locale === "bn" ? "সব ফিল্ড পূরণ করুন" : "Fill all fields");
      return;
    }
    if (!min || !max || !avg) {
      setFormError(locale === "bn" ? "সঠিক দাম দিন" : "Enter valid prices");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/market-prices`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify({
            categoryId: form.categoryId,
            cropName: form.cropName.trim(),
            minPrice: min,
            maxPrice: max,
            avgPrice: avg,
            unit: form.unit,
          }),
        },
      );
      const result = await res.json();
      if (!res.ok || !result.success) {
        const msg = Array.isArray(result.message)
          ? result.message[0]
          : result.message;
        throw new Error(msg ?? "Failed to add");
      }
      toast.success(
        locale === "bn" ? "বাজারদর যোগ হয়েছে" : "Market price added",
      );
      setDialogOpen(false);
      setForm({
        categoryId: "",
        cropName: "",
        minPrice: "",
        maxPrice: "",
        avgPrice: "",
        unit: "কেজি",
      });
      setPage(1);
      loadPrices();
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : locale === "bn"
            ? "যোগ করা যায়নি"
            : "Couldn't add",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/market-prices/${id}`,
        {
          method: "DELETE",
          headers: authHeaders(),
        },
      );
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result?.message);
      toast.success(locale === "bn" ? "মুছে ফেলা হয়েছে" : "Deleted");
      loadPrices();
    } catch {
      toast.error(locale === "bn" ? "মুছা যায়নি" : "Couldn't delete");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <h1 className="font-bangla text-2xl font-bold">
            {locale === "bn"
              ? "বাজারদর ব্যবস্থাপনা"
              : "Market Price Management"}
          </h1>
          <p className="mt-1 font-bangla text-sm text-muted-foreground">
            {locale === "bn"
              ? "রেফারেন্স বাজারদর যোগ ও পরিচালনা করুন"
              : "Add and manage reference market prices"}
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button className="gap-2 bg-primary text-white hover:bg-primary-hover" />
            }
          >
            <Plus className="h-4 w-4" />
            {locale === "bn" ? "নতুন যোগ করুন" : "Add New"}
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-bangla">
                {locale === "bn" ? "নতুন বাজারদর যোগ করুন" : "Add Market Price"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreate} className="space-y-4">
              {formError && (
                <div className="rounded-lg bg-danger/10 px-3.5 py-2.5 font-bangla text-sm text-danger">
                  {formError}
                </div>
              )}

              <div>
                <label className="mb-1.5 block font-bangla text-sm font-medium">
                  {locale === "bn" ? "ক্যাটাগরি" : "Category"}
                </label>
                <Select
                  value={form.categoryId}
                  onValueChange={(v) =>
                    v && setForm({ ...form, categoryId: v })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={locale === "bn" ? "নির্বাচন করুন" : "Select"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-1.5 block font-bangla text-sm font-medium">
                  {locale === "bn" ? "ফসলের নাম" : "Crop Name"}
                </label>
                <Input
                  value={form.cropName}
                  onChange={(e) =>
                    setForm({ ...form, cropName: e.target.value })
                  }
                  placeholder={
                    locale === "bn" ? "যেমন: বাসমতি চাল" : "e.g. Basmati Rice"
                  }
                  className="font-bangla"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1.5 block font-bangla text-sm font-medium">
                    {locale === "bn" ? "সর্বনিম্ন" : "Min"}
                  </label>
                  <Input
                    type="number"
                    value={form.minPrice}
                    onChange={(e) =>
                      setForm({ ...form, minPrice: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-bangla text-sm font-medium">
                    {locale === "bn" ? "সর্বোচ্চ" : "Max"}
                  </label>
                  <Input
                    type="number"
                    value={form.maxPrice}
                    onChange={(e) =>
                      setForm({ ...form, maxPrice: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-bangla text-sm font-medium">
                    {locale === "bn" ? "গড়" : "Avg"}
                  </label>
                  <Input
                    type="number"
                    value={form.avgPrice}
                    onChange={(e) =>
                      setForm({ ...form, avgPrice: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block font-bangla text-sm font-medium">
                  {locale === "bn" ? "একক" : "Unit"}
                </label>
                <Input
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  className="font-bangla"
                />
              </div>

              <DialogFooter>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full gap-2 bg-primary text-white hover:bg-primary-hover"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {locale === "bn" ? "যোগ করুন" : "Add"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Table */}
      <div className="mt-6 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-surface">
            <tr>
              <th className="px-4 py-3 font-bangla font-semibold">
                {locale === "bn" ? "ফসল" : "Crop"}
              </th>
              <th className="px-4 py-3 font-bangla font-semibold">
                {locale === "bn" ? "ক্যাটাগরি" : "Category"}
              </th>
              <th className="px-4 py-3 font-bangla font-semibold">
                {locale === "bn" ? "সর্বনিম্ন" : "Min"}
              </th>
              <th className="px-4 py-3 font-bangla font-semibold">
                {locale === "bn" ? "সর্বোচ্চ" : "Max"}
              </th>
              <th className="px-4 py-3 font-bangla font-semibold">
                {locale === "bn" ? "গড়" : "Avg"}
              </th>
              <th className="px-4 py-3 font-bangla font-semibold text-right">
                {locale === "bn" ? "একশন" : "Actions"}
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  <td colSpan={6} className="px-4 py-4">
                    <div className="h-4 animate-pulse rounded bg-muted" />
                  </td>
                </tr>
              ))
            ) : prices.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center font-bangla text-muted-foreground"
                >
                  {locale === "bn"
                    ? "কোনো বাজারদর নেই"
                    : "No market prices found"}
                </td>
              </tr>
            ) : (
              prices.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-bangla font-medium">
                    {p.cropName}
                  </td>
                  <td className="px-4 py-3 font-bangla text-muted-foreground">
                    {p.category.name}
                  </td>
                  <td className="px-4 py-3">৳{p.minPrice}</td>
                  <td className="px-4 py-3">৳{p.maxPrice}</td>
                  <td className="px-4 py-3 font-semibold text-primary">
                    ৳{p.avgPrice}
                    <span className="ml-1 font-bangla text-xs text-muted-foreground">
                      /{p.unit}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="icon-sm"
                      variant="outline"
                      disabled={deletingId === p.id}
                      onClick={() => handleDelete(p.id)}
                      className="text-danger hover:bg-danger/10"
                    >
                      {deletingId === p.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
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
