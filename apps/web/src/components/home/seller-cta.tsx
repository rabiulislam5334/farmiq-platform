"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ImageIcon, ArrowRight, Sparkles } from "lucide-react";

import { useUIStore } from "@/store/ui-store";
import { Button } from "@/components/ui/button";

export function SellerCta() {
  const { locale } = useUIStore();

  return (
    <section className="py-20">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="relative overflow-hidden rounded-[32px] border border-white/20 bg-gradient-to-br from-[#1b4332] via-[#2d6a4f] to-[#b76b2f] p-8 shadow-2xl sm:p-12 lg:p-16"
        >
          {/* Ambient Background Glows */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-[#b76b2f]/30 blur-3xl" />

          {/* Grid Noise overlay for tactile feel */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />

          <div className="relative z-10 flex flex-col items-start gap-10 lg:flex-row lg:items-center lg:justify-between">
            {/* Content Left */}
            <div className="max-w-xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
                <span>
                  {locale === "bn"
                    ? "সহজ বিক্রয় মাধ্যম"
                    : "Easy Selling Platform"}
                </span>
              </div>

              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-[38px] lg:leading-[1.2]">
                {locale === "bn"
                  ? "আপনার ফসল বিক্রি শুরু করুন আজই"
                  : "Start Selling Your Harvest Today"}
              </h2>

              <p className="mt-4 text-base leading-relaxed text-white/80 lg:text-lg">
                {locale === "bn"
                  ? "বিনামূল্যে রেজিস্ট্রেশন করুন, ৫ মিনিটে প্রথম পণ্য তালিকাভুক্ত করুন, সরাসরি সেরা দামে ক্রেতা খুঁজে পান।"
                  : "Register for free, list your first product in 5 minutes, and find direct buyers for the best price."}
              </p>

              {/* Action Button */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button
                  asChild
                  size="lg"
                  className="group relative h-12 overflow-hidden rounded-full bg-white px-8 font-semibold text-[#1b4332] shadow-lg transition-all duration-300 hover:bg-white/90 hover:shadow-xl active:scale-[0.98]"
                >
                  <Link href="/sell" className="flex items-center gap-2">
                    <span>
                      {locale === "bn"
                        ? "বিক্রেতা হিসেবে শুরু করুন"
                        : "Start as a Seller"}
                    </span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Glassmorphic Image Frame */}
            <div className="group relative w-full lg:w-auto">
              <div className="relative flex h-[220px] w-full items-center justify-center rounded-2xl border border-white/25 bg-white/10 backdrop-blur-md transition-all duration-300 hover:border-white/40 hover:bg-white/15 lg:h-[260px] lg:w-[360px]">
                <div className="flex flex-col items-center gap-3 text-white/70 transition-transform duration-300 group-hover:scale-105">
                  <div className="rounded-full bg-white/10 p-4 backdrop-blur-sm">
                    <ImageIcon className="h-8 w-8 text-white" />
                  </div>
                  <span className="text-xs font-medium tracking-wide text-white/80">
                    {locale === "bn"
                      ? "কৃষকের/ফসলের ছবি এখানে বসবে"
                      : "Image will be placed here"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
