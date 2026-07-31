"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
  Heart,
  MapPin,
  Wheat,
  Fish,
  Flame,
  CircleDot,
  Plus,
} from "lucide-react";

import { useUIStore } from "@/store/ui-store";

const products = [
  {
    id: "1",
    nameBn: "বাসমতি চাল",
    nameEn: "Basmati Rice",
    locationBn: "পাবনা",
    locationEn: "Pabna",
    price: 68,
    icon: Wheat,
    bg: "from-[#F3E7C9] to-[#E8D4A0]",
    fresh: true,
  },
  {
    id: "2",
    nameBn: "দেশি আলু",
    nameEn: "Local Potato",
    locationBn: "মুন্সিগঞ্জ",
    locationEn: "Munshiganj",
    price: 25,
    icon: CircleDot,
    bg: "from-[#DCEBD8] to-[#B9D9B4]",
    fresh: true,
  },
  {
    id: "3",
    nameBn: "পদ্মার ইলিশ",
    nameEn: "Padma Hilsa",
    locationBn: "চাঁদপুর",
    locationEn: "Chandpur",
    price: 950,
    icon: Fish,
    bg: "from-[#F5DCC4] to-[#EBC29A]",
    fresh: false,
  },
  {
    id: "4",
    nameBn: "কাঁচা মরিচ",
    nameEn: "Green Chili",
    locationBn: "বগুড়া",
    locationEn: "Bogura",
    price: 40,
    icon: Flame,
    bg: "from-[#E2ECE0] to-[#C7DCC3]",
    fresh: true,
  },
];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const card: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export function FeaturedProducts() {
  const { locale } = useUIStore();

  return (
    <section className="py-16">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex items-end justify-between"
        >
          <div>
            <h2 className="font-bangla text-[28px] font-bold lg:text-[30px]">
              {locale === "bn" ? "আজকের সতেজ পণ্য" : "Today's Fresh Picks"}
            </h2>
            <p className="mt-1.5 font-bangla text-[15px] text-muted-foreground">
              {locale === "bn"
                ? "মাঠ থেকে সরাসরি সংগ্রহ করা, ২৪ ঘণ্টার মধ্যে তোলা"
                : "Collected straight from the field, within 24 hours"}
            </p>
          </div>
          <Link
            href="/products"
            className="flex items-center gap-1 font-bangla text-sm font-semibold text-primary hover:underline"
          >
            {locale === "bn" ? "সব দেখুন" : "See all"} →
          </Link>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-2 gap-5 lg:grid-cols-4"
        >
          {products.map((p) => (
            <motion.div
              key={p.id}
              variants={card}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.2 }}
              className="group overflow-hidden rounded-2xl border border-border bg-surface hover:shadow-xl"
            >
              <div
                className={`relative flex h-[150px] items-center justify-center bg-gradient-to-br ${p.bg}`}
              >
                {p.fresh && (
                  <span className="absolute left-2.5 top-2.5 rounded-full bg-success px-2.5 py-1 text-[11px] font-bold text-white">
                    {locale === "bn" ? "টাজা" : "FRESH"}
                  </span>
                )}
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  className="absolute right-2.5 top-2.5 flex h-[30px] w-[30px] items-center justify-center rounded-full bg-white/90"
                >
                  <Heart className="h-[15px] w-[15px] text-foreground" />
                </motion.button>
                <p.icon
                  className="h-11 w-11 text-foreground/70"
                  strokeWidth={1.8}
                />
              </div>

              <div className="p-4">
                <div className="mb-0.5 truncate font-bangla text-[15.5px] font-semibold">
                  {locale === "bn" ? p.nameBn : p.nameEn}
                </div>
                <div className="mb-2.5 flex items-center gap-1 font-bangla text-[12.5px] text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {locale === "bn" ? p.locationBn : p.locationEn}
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-base font-bold text-primary">
                    ৳{p.price}
                    <span className="ml-1 font-bangla text-xs font-medium text-muted-foreground">
                      /কেজি
                    </span>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary"
                  >
                    <Plus className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
