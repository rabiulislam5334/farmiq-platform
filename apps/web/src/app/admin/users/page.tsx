"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Search,
  ShieldCheck,
  Ban,
  ShieldX,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

import { useUIStore } from "@/store/ui-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  isVerified: boolean;
  isBanned: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { locale } = useUIStore();
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [meta, setMeta] = React.useState<{
    page: number;
    totalPages: number;
  } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [actingId, setActingId] = React.useState<string | null>(null);

  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [role, setRole] = React.useState("all");
  const [page, setPage] = React.useState(1);

  function authHeaders() {
    const token = localStorage.getItem("farmiq_access_token");
    return { Authorization: `Bearer ${token}` };
  }

  const loadUsers = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (search) params.set("search", search);
      if (role !== "all") params.set("role", role);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users?${params.toString()}`,
        { headers: authHeaders() },
      );
      const result = await res.json();
      setUsers(result?.data ?? []);
      setMeta(result?.meta ?? null);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [search, role, page]);

  React.useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  async function handleAction(
    userId: string,
    action: "verify" | "ban" | "unban",
  ) {
    setActingId(userId);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}/${action}`,
        { method: "PATCH", headers: authHeaders() },
      );
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result?.message ?? "Action failed");
      }
      toast.success(
        locale === "bn" ? "সফলভাবে আপডেট হয়েছে" : "Updated successfully",
      );
      loadUsers();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : locale === "bn"
            ? "করা যায়নি"
            : "Action failed",
      );
    } finally {
      setActingId(null);
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
          {locale === "bn" ? "ব্যবহারকারী ব্যবস্থাপনা" : "User Management"}
        </h1>
        <p className="mt-1 font-bangla text-sm text-muted-foreground">
          {meta ? (locale === "bn" ? "মোট ব্যবহারকারী" : "Total users") : ""}
        </p>
      </motion.div>

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={
              locale === "bn" ? "নাম/ইমেইল খুঁজুন..." : "Search name/email..."
            }
            className="pl-9"
          />
        </form>
        <Select
          value={role}
          onValueChange={(v) => {
            if (!v) return;
            setRole(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {locale === "bn" ? "সব রোল" : "All Roles"}
            </SelectItem>
            <SelectItem value="FARMER">FARMER</SelectItem>
            <SelectItem value="BUYER">BUYER</SelectItem>
            <SelectItem value="AGRONOMIST">AGRONOMIST</SelectItem>
            <SelectItem value="ADMIN">ADMIN</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-surface">
            <tr>
              <th className="px-4 py-3 font-bangla font-semibold">
                {locale === "bn" ? "নাম" : "Name"}
              </th>
              <th className="px-4 py-3 font-bangla font-semibold">Email</th>
              <th className="px-4 py-3 font-bangla font-semibold">
                {locale === "bn" ? "রোল" : "Role"}
              </th>
              <th className="px-4 py-3 font-bangla font-semibold">
                {locale === "bn" ? "স্ট্যাটাস" : "Status"}
              </th>
              <th className="px-4 py-3 font-bangla font-semibold text-right">
                {locale === "bn" ? "একশন" : "Actions"}
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  <td colSpan={5} className="px-4 py-4">
                    <div className="h-4 animate-pulse rounded bg-muted" />
                  </td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center font-bangla text-muted-foreground"
                >
                  {locale === "bn"
                    ? "কোনো ব্যবহারকারী পাওয়া যায়নি"
                    : "No users found"}
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-bangla font-medium">
                    {u.name}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">{u.role}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {u.isBanned ? (
                        <Badge className="bg-danger/10 text-danger">
                          {locale === "bn" ? "নিষিদ্ধ" : "Banned"}
                        </Badge>
                      ) : u.isVerified ? (
                        <Badge className="bg-success/10 text-success">
                          {locale === "bn" ? "যাচাইকৃত" : "Verified"}
                        </Badge>
                      ) : (
                        <Badge className="bg-warning/10 text-warning">
                          {locale === "bn" ? "অযাচাইকৃত" : "Unverified"}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      {actingId === u.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : (
                        <>
                          {!u.isVerified && !u.isBanned && (
                            <Button
                              size="icon-sm"
                              variant="outline"
                              title={locale === "bn" ? "যাচাই করুন" : "Verify"}
                              onClick={() => handleAction(u.id, "verify")}
                              className="text-success hover:bg-success/10"
                            >
                              <ShieldCheck className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {u.isBanned ? (
                            <Button
                              size="icon-sm"
                              variant="outline"
                              title={
                                locale === "bn" ? "নিষেধাজ্ঞা তুলুন" : "Unban"
                              }
                              onClick={() => handleAction(u.id, "unban")}
                              className="text-primary hover:bg-primary/10"
                            >
                              <ShieldX className="h-3.5 w-3.5" />
                            </Button>
                          ) : (
                            u.role !== "ADMIN" && (
                              <Button
                                size="icon-sm"
                                variant="outline"
                                title={locale === "bn" ? "নিষিদ্ধ করুন" : "Ban"}
                                onClick={() => handleAction(u.id, "ban")}
                                className="text-danger hover:bg-danger/10"
                              >
                                <Ban className="h-3.5 w-3.5" />
                              </Button>
                            )
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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
