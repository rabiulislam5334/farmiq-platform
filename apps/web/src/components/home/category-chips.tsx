"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Wheat, Salad, Apple, Flame, Fish, Milk, Sprout } from "lucide-react";

import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/ui-store";

const categories = [
  { id: "all", icon: Wheat, bn: "সব পণ্য", en: "All Products" },
  { id: "rice", icon: Wheat, bn: "ধান ও চাল", en: "Rice & Grains" },
  { id: "vegetables", icon: Salad, bn: "শাকসবজি", en: "Vegetables" },
  { id: "fruits", icon: Apple, bn: "ফলমূল", en: "Fruits" },
  { id: "spices", icon: Flame, bn: "মসলা", en: "Spices" },
  { id: "fish", icon: Fish, bn: "মাছ", en: "Fish" },
  { id: "dairy", icon: Milk, bn: "দুগ্ধজাত", en: "Dairy" },
  { id: "seeds", icon: Sprout, bn: "বীজ ও সার", en: "Seeds & Fertilizer" },
] as const;

export function CategoryChips() {
  const { locale } = useUIStore();
  const [active, setActive] = React.useState<string>("all");

  return (
    <section className="border-b border-border py-9">
      <div className="relative mx-auto max-w-[1200px] px-6 lg:px-8">
        <div className="flex gap-3 overflow-x-auto pr-6 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((cat, i) => (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => setActive(cat.id)}
              className={cn(
                "flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-5 py-2.5 text-[14.5px] font-semibold font-bangla transition-colors",
                active === cat.id
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-surface text-foreground hover:border-primary/40",
              )}
            >
              <cat.icon className="h-[18px] w-[18px]" strokeWidth={2.2} />
              {locale === "bn" ? cat.bn : cat.en}
            </motion.button>
          ))}
        </div>

        <div className="pointer-events-none absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-background to-transparent lg:right-8" />
      </div>
    </section>
  );
}
