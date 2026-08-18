"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Menu,
  Moon,
  Sun,
  Languages,
  Search,
  Sprout,
  User,
  LayoutDashboard,
  LogOut,
} from "lucide-react";

import { useUIStore } from "@/store/ui-store";
import { dictionary } from "@/lib/dictionary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface StoredUser {
  name: string;
  email: string;
}

export function Header() {
  const { locale, setLocale } = useUIStore();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [user, setUser] = React.useState<StoredUser | null>(null);

  React.useEffect(() => {
    setMounted(true);
    const raw = localStorage.getItem("farmiq_user");
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const t = dictionary[locale];

  const navLinks = [
    { href: "/", label: t.nav.home },
    { href: "/products", label: t.nav.products },
    { href: "/sell", label: t.nav.sell },
    { href: "/ai", label: t.nav.ai },
    { href: "/about", label: t.nav.about },
  ];

  function handleLogout() {
    localStorage.removeItem("farmiq_access_token");
    localStorage.removeItem("farmiq_user");
    setUser(null);
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex h-[76px] max-w-[1200px] items-center justify-between px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 font-bangla text-xl font-bold text-primary"
        >
          <Sprout className="h-7 w-7" strokeWidth={2.2} />
          FarmIQ
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[15px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="relative hidden lg:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t.header.search}
              className="w-[220px] rounded-full bg-surface pl-9 font-bangla"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Change language"
                  className="rounded-full"
                />
              }
            >
              <Languages className="h-[18px] w-[18px]" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setLocale("bn")}
                className={locale === "bn" ? "font-semibold text-primary" : ""}
              >
                বাংলা
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLocale("en")}
                className={locale === "en" ? "font-semibold text-primary" : ""}
              >
                English
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            className="rounded-full"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {mounted && theme === "dark" ? (
              <Sun className="h-[18px] w-[18px]" />
            ) : (
              <Moon className="h-[18px] w-[18px]" />
            )}
          </Button>

          {/* Auth area - desktop */}
          <div className="hidden items-center gap-2 md:flex">
            {mounted && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full"
                      aria-label="Account menu"
                    />
                  }
                >
                  <User className="h-[18px] w-[18px]" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-3 py-2">
                    <p className="truncate font-bangla text-sm font-semibold">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    render={<Link href="/dashboard" className="gap-2" />}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="font-bangla">
                      {locale === "bn" ? "ড্যাশবোর্ড" : "Dashboard"}
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="gap-2">
                    <LogOut className="h-4 w-4" />
                    <span className="font-bangla">
                      {locale === "bn" ? "লগআউট" : "Log out"}
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link href="/login">{t.header.login}</Link>
                </Button>
                <Button
                  className="bg-primary text-white hover:bg-primary-hover"
                  asChild
                >
                  <Link href="/register">{t.header.register}</Link>
                </Button>
              </>
            )}
          </div>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="md:hidden" />
              }
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] font-bangla">
              <SheetHeader>
                <SheetTitle className="text-primary">FarmIQ</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-[15px] font-medium text-foreground hover:bg-primary/5"
                  >
                    {link.label}
                  </Link>
                ))}
                {mounted && user && (
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-[15px] font-medium text-foreground hover:bg-primary/5"
                  >
                    {locale === "bn" ? "ড্যাশবোর্ড" : "Dashboard"}
                  </Link>
                )}
              </nav>
              <div className="mt-6 flex flex-col gap-2 border-t border-border pt-6">
                {mounted && user ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleLogout();
                      setMobileOpen(false);
                    }}
                  >
                    {locale === "bn" ? "লগআউট" : "Log out"}
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" asChild>
                      <Link href="/login">{t.header.login}</Link>
                    </Button>
                    <Button
                      className="bg-primary text-white hover:bg-primary-hover"
                      asChild
                    >
                      <Link href="/register">{t.header.register}</Link>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
