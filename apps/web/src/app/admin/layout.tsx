"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

import { useUIStore } from "@/store/ui-store";
import { AdminGuard } from "@/components/admin/admin-guard";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", icon: LayoutDashboard, bn: "ড্যাশবোর্ড", en: "Dashboard" },
  { href: "/admin/users", icon: Users, bn: "ব্যবহারকারী", en: "Users" },
  {
    href: "/admin/market-prices",
    icon: TrendingUp,
    bn: "বাজারদর",
    en: "Market Prices",
  },
  { href: "/admin/disputes", icon: AlertTriangle, bn: "বিরোধ", en: "Disputes" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { locale } = useUIStore();
  const pathname = usePathname();

  return (
    <AdminGuard>
      <div className="mx-auto flex min-h-[calc(100vh-76px)] max-w-[1300px]">
        <aside className="hidden w-[220px] shrink-0 border-r border-border py-8 pr-6 sm:block">
          <div className="mb-6 px-3 font-bangla text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {locale === "bn" ? "অ্যাডমিন প্যানেল" : "Admin Panel"}
          </div>
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2.5 font-bangla text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {locale === "bn" ? item.bn : item.en}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="flex-1 px-6 py-8 lg:px-8">{children}</main>
      </div>
    </AdminGuard>
  );
}
