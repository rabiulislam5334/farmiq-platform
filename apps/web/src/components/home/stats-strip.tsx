"use client";

import { motion, type Variants } from "framer-motion";
import { Users, ShoppingBag, MapPin, Star } from "lucide-react";

import { useUIStore } from "@/store/ui-store";

const stats = [
  {
    icon: Users,
    value: "৫,২০০+",
    en: "5,200+",
    bn: "নিবন্ধিত কৃষক",
    enLabel: "Registered Farmers",
  },
  {
    icon: ShoppingBag,
    value: "১৮,০০০+",
    en: "18,000+",
    bn: "সম্পন্ন অর্ডার",
    enLabel: "Completed Orders",
  },
  {
    icon: MapPin,
    value: "৬৪",
    en: "64",
    bn: "জেলায় সক্রিয়",
    enLabel: "Districts Active",
  },
  {
    icon: Star,
    value: "৪.৮/৫",
    en: "4.8/5",
    bn: "গড় রেটিং",
    enLabel: "Average Rating",
  },
];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export function StatsStrip() {
  const { locale } = useUIStore();

  return (
    <section className="py-10">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="relative overflow-hidden rounded-[24px] bg-primary p-4 shadow-xl sm:p-6 lg:p-8"
        >
          {/* Subtle Ambient Background Glow */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-black/10 blur-3xl" />

          <div className="relative z-10 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-0">
            {stats.map((s, i) => {
              const Icon = s.icon;

              return (
                <motion.div
                  key={i}
                  variants={item}
                  whileHover={{
                    y: -4,
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="group flex flex-col items-center justify-center rounded-2xl p-5 text-center transition-colors lg:border-r lg:border-white/15 lg:rounded-none lg:last:border-r-0 lg:first:rounded-l-2xl lg:last:rounded-r-2xl"
                >
                  {/* Icon with Subtle Hover Glow */}
                  <div className="mb-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-all duration-300 group-hover:bg-white group-hover:text-primary group-hover:shadow-lg group-hover:scale-110">
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Stat Value */}
                  <div className="font-sans text-[26px] font-extrabold tracking-tight text-white transition-transform duration-300 group-hover:scale-105 sm:text-[30px] lg:text-[34px]">
                    {locale === "bn" ? s.value : s.en}
                  </div>

                  {/* Stat Label */}
                  <div className="mt-1 font-bangla text-xs font-medium text-white/80 transition-colors group-hover:text-white sm:text-[13px]">
                    {locale === "bn" ? s.bn : s.enLabel}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
