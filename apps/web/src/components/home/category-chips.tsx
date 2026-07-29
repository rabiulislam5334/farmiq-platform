"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/ui-store";

const categories = [
  { id: "all", emoji: "🌾", bn: "সব পণ্য", en: "All Products" },
  { id: "rice", emoji: "🌾", bn: "ধান ও চাল", en: "Rice & Grains" },
  { id: "vegetables", emoji: "🥬", bn: "শাকসবজি", en: "Vegetables" },
  { id: "fruits", emoji: "🍎", bn: "ফলমূল", en: "Fruits" },
  { id: "spices", emoji: "🌶️", bn: "মসলা", en: "Spices" },
  { id: "fish", emoji: "🐟", bn: "মাছ", en: "Fish" },
  { id: "dairy", emoji: "🥛", bn: "দুগ্ধজাত", en: "Dairy" },
  { id: "seeds", emoji: "🌱", bn: "বীজ ও সার", en: "Seeds & Fertilizer" },
] as const;

export function CategoryChips() {
  const { locale } = useUIStore();
  const [active, setActive] = React.useState<string>("all");
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // মাউস হুইল দিয়ে ডানে-বামে স্ক্রল
  const handleWheel = (e: React.WheelEvent) => {
    if (scrollRef.current && e.deltaY !== 0) {
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  return (
    <section className="border-b border-border py-6">
      {/* Container wrapper - overflow hidden যাতে ওভারলে কনটেইনারের বাইরে না যায় */}
      <div className="relative mx-auto max-w-[1200px] overflow-hidden px-4 sm:px-6 lg:px-8">
        {/* Scrollable track */}
        <div
          ref={scrollRef}
          onWheel={handleWheel}
          className="flex items-center gap-2 overflow-x-auto scroll-smooth py-2 pr-32 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {categories.map((cat, index) => {
            const isActive = active === cat.id;

            return (
              <motion.button
                key={cat.id}
                onClick={() => setActive(cat.id)}
                // Entrance Motion
                initial={{ opacity: 0, y: 1 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.03 }}
                // Interactive Motion
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                className={cn(
                  "flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-5 py-2.5 text-[14.5px] font-semibold transition-colors duration-200",
                  isActive
                    ? "border-primary bg-primary text-white shadow-sm"
                    : "border-border bg-surface text-foreground hover:border-primary/40 hover:bg-surface/80",
                )}
              >
                <motion.span
                  className="text-lg leading-none"
                  animate={{ scale: isActive ? 1.15 : 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  {cat.emoji}
                </motion.span>
                <span>{locale === "bn" ? cat.bn : cat.en}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Right-edge Gradient Overlay (FIXED) */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-20 bg-gradient-to-l from-background via-background/10 to-transparent" />
      </div>
    </section>
  );
}
