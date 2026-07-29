"use client";

import * as React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Menu, Moon, Sun, Languages, Search, Sprout } from "lucide-react";

import { useUIStore } from "@/store/ui-store";
import { dictionary } from "@/lib/dictionary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Header() {
  const { locale, setLocale } = useUIStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // avoid hydration mismatch for theme icon
  React.useEffect(() => setMounted(true), []);

  const t = dictionary[locale];

  const navLinks = [
    { href: "/", label: t.nav.home },
    { href: "/products", label: t.nav.products },
    { href: "/sell", label: t.nav.sell },
    { href: "/ai", label: t.nav.ai },
    { href: "/about", label: t.nav.about },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex h-[76px] max-w-[1200px] items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bangla text-xl font-bold text-primary"
        >
          <Sprout className="h-7 w-7" strokeWidth={2.2} />
          FarmIQ
        </Link>

        {/* Desktop nav */}
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

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Search - desktop only, icon-triggered could expand; kept simple here */}
          <div className="relative hidden lg:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t.header.search}
              className="w-[220px] rounded-full bg-surface pl-9 font-bangla"
            />
          </div>

          {/* Language toggle */}
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

          {/* Dark mode toggle */}
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

          {/* Auth buttons - desktop */}
          <div className="hidden items-center gap-2 md:flex">
            <Button variant="outline" render={<Link href="/login" />}>
              {t.header.login}
            </Button>
            <Button
              className="bg-primary text-white hover:bg-primary-hover"
              render={<Link href="/register" />}
            >
              {t.header.register}
            </Button>
          </div>

          {/* Mobile menu trigger */}
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
              </nav>
              <div className="mt-6 flex flex-col gap-2 border-t border-border pt-6">
                <Button variant="outline" render={<Link href="/login" />}>
                  {t.header.login}
                </Button>
                <Button
                  className="bg-primary text-white hover:bg-primary-hover"
                  render={<Link href="/register" />}
                >
                  {t.header.register}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
