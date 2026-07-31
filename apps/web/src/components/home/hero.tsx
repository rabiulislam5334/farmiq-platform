"use client";

import * as React from "react";
import { motion, type Variants } from "framer-motion";
import { Search, CheckCircle2 } from "lucide-react";

import { useUIStore } from "@/store/ui-store";
import { dictionary } from "@/lib/dictionary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const container: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export function Hero() {
  const { locale } = useUIStore();
  const t = dictionary[locale];
  const [query, setQuery] = React.useState("");

  const trustPoints =
    locale === "bn"
      ? ["যাচাইকৃত কৃষক", "নিরাপদ পেমেন্ট", "২৪ ঘণ্টা ডেলিভারি"]
      : ["Verified farmers", "Secure payment", "24-hour delivery"];

  return (
    <section className="relative overflow-hidden">
      {/* Video background — পরে বসাবেন */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster="/videos/hero-poster.jpg"
      >
        <source src="/videos/hero-farm.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative mx-auto max-w-[1200px] px-6 py-24 lg:px-8 lg:py-32"
      >
        <motion.div
          variants={item}
          className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[13px] font-semibold text-white backdrop-blur-sm"
        >
          <motion.span
            className="h-1.5 w-1.5 rounded-full bg-success"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          {locale === "bn"
            ? "৫০০+ কৃষক এখন অনলাইনে সক্রিয়"
            : "500+ farmers active online now"}
        </motion.div>

        <motion.h1
          variants={item}
          className="max-w-xl font-bangla text-4xl font-bold leading-tight text-white lg:text-[52px]"
        >
          {locale === "bn" ? (
            <>
              মাঠ থেকে সরাসরি
              <br />
              আপনার <span className="text-accent">নাগালে</span>
            </>
          ) : (
            <>
              Straight from the field,
              <br />
              <span className="text-accent">within reach</span>
            </>
          )}
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-5 max-w-md font-bangla text-lg text-white/85"
        >
          {locale === "bn"
            ? "মধ্যস্বত্বভোগী ছাড়াই কৃষকের কাছ থেকে সরাসরি টাটকা ফসল কিনুন, ন্যায্য দামে বিক্রি করুন।"
            : "Buy fresh produce directly from farmers, sell at fair prices — no middlemen."}
        </motion.p>

        <motion.div
          variants={item}
          className="mt-8 flex max-w-lg rounded-xl border border-white/20 bg-white/95 p-1.5 shadow-2xl backdrop-blur-sm"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.header.search}
              className="border-none bg-transparent pl-9 font-bangla shadow-none focus-visible:ring-0"
            />
          </div>
          <Button className="bg-primary text-white hover:bg-primary-hover">
            {locale === "bn" ? "খুঁজুন" : "Search"}
          </Button>
        </motion.div>

        <motion.div variants={item} className="mt-7 flex flex-wrap gap-6">
          {trustPoints.map((point) => (
            <div
              key={point}
              className="flex items-center gap-2 rounded-full bg-black/25 px-3 py-1.5 text-[13.5px] font-medium text-white backdrop-blur-sm"
            >
              <CheckCircle2 className="h-[18px] w-[18px] text-success" />
              <span className="font-bangla">{point}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
