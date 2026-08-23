"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Users,
  ShoppingBag,
  Package,
  AlertTriangle,
  Wallet,
} from "lucide-react";

import { useUIStore } from "@/store/ui-store";

interface DashboardStats {
  totalUsers: number;
  usersByRole: { role: string; _count: { role: number } }[];
  totalOrders: number;
  ordersByStatus: { status: string; _count: { status: number } }[];
  totalProducts: number;
  activeProducts: number;
  pendingDisputes: number;
  totalRevenue: number;
}

export default function AdminDashboardPage() {
  const { locale } = useUIStore();
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("farmiq_access_token");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/dashboard`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const result = await res.json();
        setStats(result.data);
      } catch {
        setStats(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const cards = stats
    ? [
        {
          icon: Users,
          label: locale === "bn" ? "মোট ব্যবহারকারী" : "Total Users",
          value: stats.totalUsers,
          className: "bg-primary/10 text-primary",
        },
        {
          icon: ShoppingBag,
          label: locale === "bn" ? "মোট অর্ডার" : "Total Orders",
          value: stats.totalOrders,
          className: "bg-warning/10 text-warning",
        },
        {
          icon: Package,
          label: locale === "bn" ? "সক্রিয় পণ্য" : "Active Products",
          value: `${stats.activeProducts} / ${stats.totalProducts}`,
          className: "bg-success/10 text-success",
        },
        {
          icon: AlertTriangle,
          label: locale === "bn" ? "মুলতুবি বিরোধ" : "Pending Disputes",
          value: stats.pendingDisputes,
          className: "bg-danger/10 text-danger",
        },
        {
          icon: Wallet,
          label: locale === "bn" ? "মোট রেভিনিউ" : "Total Revenue",
          value: `৳${stats.totalRevenue.toLocaleString()}`,
          className: "bg-accent/10 text-accent",
        },
      ]
    : [];

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-bangla text-2xl font-bold">
          {locale === "bn" ? "অ্যাডমিন ড্যাশবোর্ড" : "Admin Dashboard"}
        </h1>
        <p className="mt-1 font-bangla text-sm text-muted-foreground">
          {locale === "bn"
            ? "প্ল্যাটফর্মের সার্বিক পরিসংখ্যান"
            : "Platform-wide statistics overview"}
        </p>
      </motion.div>

      {loading ? (
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-xl border border-border bg-surface"
            />
          ))}
        </div>
      ) : !stats ? (
        <p className="mt-8 font-bangla text-sm text-muted-foreground">
          {locale === "bn" ? "ডেটা লোড করা যায়নি" : "Couldn't load data"}
        </p>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
            {cards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="rounded-xl border border-border bg-surface p-5"
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.className}`}
                >
                  <card.icon className="h-[18px] w-[18px]" />
                </div>
                <div className="mt-3 text-xl font-bold">{card.value}</div>
                <div className="mt-0.5 font-bangla text-xs text-muted-foreground">
                  {card.label}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Users by role */}
          <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-surface p-5">
              <h3 className="mb-4 font-bangla text-sm font-semibold">
                {locale === "bn" ? "রোল অনুযায়ী ব্যবহারকারী" : "Users by Role"}
              </h3>
              <div className="space-y-3">
                {stats.usersByRole.map((r) => {
                  const pct = stats.totalUsers
                    ? Math.round((r._count.role / stats.totalUsers) * 100)
                    : 0;
                  return (
                    <div key={r.role}>
                      <div className="mb-1 flex justify-between font-bangla text-xs">
                        <span>{r.role}</span>
                        <span className="text-muted-foreground">
                          {r._count.role} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Orders by status */}
            <div className="rounded-xl border border-border bg-surface p-5">
              <h3 className="mb-4 font-bangla text-sm font-semibold">
                {locale === "bn"
                  ? "স্ট্যাটাস অনুযায়ী অর্ডার"
                  : "Orders by Status"}
              </h3>
              <div className="space-y-3">
                {stats.ordersByStatus.map((o) => {
                  const pct = stats.totalOrders
                    ? Math.round((o._count.status / stats.totalOrders) * 100)
                    : 0;
                  return (
                    <div key={o.status}>
                      <div className="mb-1 flex justify-between font-bangla text-xs">
                        <span>{o.status}</span>
                        <span className="text-muted-foreground">
                          {o._count.status} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-accent"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
