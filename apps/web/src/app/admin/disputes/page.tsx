"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { AlertTriangle, Loader2, CheckCircle2, RotateCcw } from "lucide-react";

import { useUIStore } from "@/store/ui-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface DisputeItem {
  id: string;
  reason: string;
  status: string;
  createdAt: string;
  order: {
    id: string;
    product: { title: string };
    buyer: { id: string; name: string };
  };
  raisedBy: { id: string; name: string };
}

export default function AdminDisputesPage() {
  const { locale } = useUIStore();
  const [disputes, setDisputes] = React.useState<DisputeItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [activeDispute, setActiveDispute] = React.useState<DisputeItem | null>(
    null,
  );
  const [resolution, setResolution] = React.useState("");
  const [outcome, setOutcome] = React.useState<"COMPLETE" | "REFUND" | null>(
    null,
  );
  const [submitting, setSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  function authHeaders() {
    const token = localStorage.getItem("farmiq_access_token");
    return { Authorization: `Bearer ${token}` };
  }

  const loadDisputes = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/disputes`, {
        headers: authHeaders(),
      });
      const result = await res.json();
      setDisputes(result?.data ?? []);
    } catch {
      setDisputes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadDisputes();
  }, [loadDisputes]);

  function openResolveDialog(dispute: DisputeItem) {
    setActiveDispute(dispute);
    setResolution("");
    setOutcome(null);
    setFormError(null);
  }

  async function handleResolve() {
    if (!activeDispute) return;
    if (!outcome) {
      setFormError(
        locale === "bn" ? "একটা সিদ্ধান্ত বেছে নিন" : "Choose an outcome",
      );
      return;
    }
    if (resolution.trim().length < 5) {
      setFormError(
        locale === "bn"
          ? "কমপক্ষে ৫ অক্ষরের ব্যাখ্যা দিন"
          : "Give a resolution note of at least 5 characters",
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/disputes/${activeDispute.id}/resolve`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify({ resolution: resolution.trim(), outcome }),
        },
      );
      const result = await res.json();
      if (!res.ok || !result.success) {
        const msg = Array.isArray(result.message)
          ? result.message[0]
          : result.message;
        throw new Error(msg ?? "Failed to resolve");
      }
      toast.success(
        locale === "bn" ? "বিরোধ সমাধান হয়েছে" : "Dispute resolved",
      );
      setActiveDispute(null);
      loadDisputes();
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : locale === "bn"
            ? "সমাধান করা যায়নি"
            : "Couldn't resolve",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-bangla text-2xl font-bold">
          {locale === "bn" ? "বিরোধ নিষ্পত্তি" : "Dispute Resolution"}
        </h1>
        <p className="mt-1 font-bangla text-sm text-muted-foreground">
          {locale === "bn"
            ? "মুলতুবি বিরোধ পর্যালোচনা ও সমাধান করুন"
            : "Review and resolve pending disputes"}
        </p>
      </motion.div>

      <div className="mt-6 space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-xl border border-border bg-surface"
            />
          ))
        ) : disputes.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
            <CheckCircle2 className="h-9 w-9 text-success" />
            <p className="mt-3 font-bangla text-[15px] text-muted-foreground">
              {locale === "bn"
                ? "কোনো মুলতুবি বিরোধ নেই — সব পরিষ্কার!"
                : "No pending disputes — all clear!"}
            </p>
          </div>
        ) : (
          disputes.map((d) => (
            <div
              key={d.id}
              className="rounded-xl border border-border bg-surface p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-danger/10">
                    <AlertTriangle className="h-4 w-4 text-danger" />
                  </div>
                  <div>
                    <div className="font-bangla text-sm font-semibold">
                      {d.order.product.title}
                    </div>
                    <div className="mt-0.5 font-bangla text-xs text-muted-foreground">
                      {locale === "bn" ? "উত্থাপনকারী: " : "Raised by: "}
                      {d.raisedBy.name}
                      {" · "}
                      {locale === "bn" ? "ক্রেতা: " : "Buyer: "}
                      {d.order.buyer.name}
                    </div>
                  </div>
                </div>
                <Badge className="shrink-0 bg-warning/10 text-warning">
                  {d.status}
                </Badge>
              </div>

              <p className="mt-3 rounded-lg bg-muted px-3.5 py-2.5 font-bangla text-sm leading-relaxed">
                {d.reason}
              </p>

              <div className="mt-4 flex justify-end">
                <Button
                  size="sm"
                  onClick={() => openResolveDialog(d)}
                  className="gap-1.5 bg-primary text-white hover:bg-primary-hover"
                >
                  {locale === "bn" ? "সমাধান করুন" : "Resolve"}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog
        open={!!activeDispute}
        onOpenChange={(open) => !open && setActiveDispute(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-bangla">
              {locale === "bn" ? "বিরোধ সমাধান করুন" : "Resolve Dispute"}
            </DialogTitle>
          </DialogHeader>

          {activeDispute && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted px-3.5 py-2.5 font-bangla text-sm">
                {activeDispute.reason}
              </div>

              {formError && (
                <div className="rounded-lg bg-danger/10 px-3.5 py-2.5 font-bangla text-sm text-danger">
                  {formError}
                </div>
              )}

              <div>
                <label className="mb-2 block font-bangla text-sm font-medium">
                  {locale === "bn" ? "সিদ্ধান্ত" : "Outcome"}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setOutcome("COMPLETE")}
                    className={`flex items-center gap-2 rounded-xl border p-3.5 text-left transition-colors ${
                      outcome === "COMPLETE"
                        ? "border-success bg-success/5"
                        : "border-border hover:border-success/30"
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span className="font-bangla text-sm font-semibold">
                      {locale === "bn" ? "বিক্রেতার পক্ষে" : "Favor Seller"}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOutcome("REFUND")}
                    className={`flex items-center gap-2 rounded-xl border p-3.5 text-left transition-colors ${
                      outcome === "REFUND"
                        ? "border-warning bg-warning/5"
                        : "border-border hover:border-warning/30"
                    }`}
                  >
                    <RotateCcw className="h-4 w-4 text-warning" />
                    <span className="font-bangla text-sm font-semibold">
                      {locale === "bn" ? "ক্রেতাকে ফেরত" : "Refund Buyer"}
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block font-bangla text-sm font-medium">
                  {locale === "bn" ? "ব্যাখ্যা" : "Resolution Note"}
                </label>
                <Textarea
                  rows={3}
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder={
                    locale === "bn"
                      ? "কেন এই সিদ্ধান্ত নেওয়া হলো লিখুন..."
                      : "Explain the reasoning for this decision..."
                  }
                  className="font-bangla"
                />
              </div>

              <DialogFooter>
                <Button
                  onClick={handleResolve}
                  disabled={submitting}
                  className="w-full gap-2 bg-primary text-white hover:bg-primary-hover"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {locale === "bn" ? "নিশ্চিত করুন" : "Confirm Resolution"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
