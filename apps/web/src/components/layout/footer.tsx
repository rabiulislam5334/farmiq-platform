"use client";

import Link from "next/link";
import { Sprout } from "lucide-react";

import { useUIStore } from "@/store/ui-store";
import { dictionary } from "@/lib/dictionary";

export function Footer() {
  const { locale } = useUIStore();
  const t = dictionary[locale];

  const year = new Date().getFullYear();

  return (
    <footer className="mt-6 bg-[#1A2118] pt-14 pb-7 text-[#C8CFC4]">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 border-b border-white/10 pb-9 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="mb-2.5 flex items-center gap-2 text-xl font-bold text-white">
              <Sprout className="h-6 w-6" />
              FarmIQ
            </div>
            <p className="max-w-[260px] font-bangla text-[13.5px] leading-relaxed text-[#9BA893]">
              {t.footer.tagline}
            </p>
          </div>

          <div>
            <h4 className="mb-3.5 text-sm text-white">{t.footer.platform}</h4>
            <div className="flex flex-col gap-2.5">
              <Link
                href="/products"
                className="font-bangla text-[13.5px] text-[#9BA893] hover:text-white"
              >
                {t.nav.products}
              </Link>
              <Link
                href="/sell"
                className="font-bangla text-[13.5px] text-[#9BA893] hover:text-white"
              >
                {t.nav.sell}
              </Link>
              <Link
                href="/ai"
                className="font-bangla text-[13.5px] text-[#9BA893] hover:text-white"
              >
                {t.nav.ai}
              </Link>
            </div>
          </div>

          <div>
            <h4 className="mb-3.5 text-sm text-white">{t.footer.support}</h4>
            <div className="flex flex-col gap-2.5">
              <Link
                href="/contact"
                className="font-bangla text-[13.5px] text-[#9BA893] hover:text-white"
              >
                {t.footer.contact}
              </Link>
              <Link
                href="/complaint"
                className="font-bangla text-[13.5px] text-[#9BA893] hover:text-white"
              >
                {t.footer.complaint}
              </Link>
              <Link
                href="/faq"
                className="font-bangla text-[13.5px] text-[#9BA893] hover:text-white"
              >
                {t.footer.faq}
              </Link>
            </div>
          </div>

          <div>
            <h4 className="mb-3.5 text-sm text-white">{t.footer.legal}</h4>
            <div className="flex flex-col gap-2.5">
              <Link
                href="/terms"
                className="font-bangla text-[13.5px] text-[#9BA893] hover:text-white"
              >
                {t.footer.terms}
              </Link>
              <Link
                href="/privacy"
                className="font-bangla text-[13.5px] text-[#9BA893] hover:text-white"
              >
                {t.footer.privacy}
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-6 text-[12.5px] text-[#77836F] sm:flex-row sm:justify-between">
          <div className="font-bangla">
            © {year} FarmIQ। {t.footer.rights}
          </div>
          <div className="font-bangla">{t.footer.madeFor} 🌾</div>
        </div>
      </div>
    </footer>
  );
}
