"use client";

import * as React from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Search, CheckCircle2 } from "lucide-react";

import { useUIStore } from "@/store/ui-store";
import { dictionary } from "@/lib/dictionary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CLOUD_TRANSFORM = "q_auto,f_auto,w_1280";
const CLOUD_BASE = `https://res.cloudinary.com/dhenkqgra/video/upload/${CLOUD_TRANSFORM}`;

const heroVideos = [
  `${CLOUD_BASE}/v1785603253/348928_medium_euunbm.mp4`,
  `${CLOUD_BASE}/v1785604572/184808-874264370_medium_rnlcal.mp4`,
  `${CLOUD_BASE}/v1785654910/84624-585553977_medium_hgvbz6.mp4`,
  `${CLOUD_BASE}/v1785604924/39737-423345396_medium_sk3icz.mp4`,
  `${CLOUD_BASE}/v1785603535/306459_medium_maup4u.mp4`,
] as const;

const SLIDE_DURATION = 6000;

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
  const [currentVideoIndex, setCurrentVideoIndex] = React.useState(0);
  const [videoReady, setVideoReady] = React.useState(false);
  const [inView, setInView] = React.useState(true);
  const [reduceMotion, setReduceMotion] = React.useState(false);
  const sectionRef = React.useRef<HTMLElement>(null);

  const currentVideo = heroVideos[currentVideoIndex] ?? heroVideos[0];

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  React.useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) setInView(entry.isIntersecting);
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (reduceMotion || !inView) return;
    const timer = setInterval(() => {
      setCurrentVideoIndex((prev) => (prev + 1) % heroVideos.length);
    }, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [reduceMotion, inView]);

  React.useEffect(() => {
    const nextIndex = (currentVideoIndex + 1) % heroVideos.length;
    const nextSrc = heroVideos[nextIndex];
    if (!nextSrc) return;

    const preload = document.createElement("video");
    preload.src = nextSrc;
    preload.preload = "auto";
  }, [currentVideoIndex]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    console.log("Searching for:", query);
  };

  const trustPoints =
    locale === "bn"
      ? ["যাচাইকৃত কৃষক", "নিরাপদ পেমেন্ট", "২৪ ঘণ্টা ডেলিভারি"]
      : ["Verified farmers", "Secure payment", "24-hour delivery"];

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[580px] items-center overflow-hidden bg-zinc-950 lg:min-h-[640px]"
    >
      {/* Loading placeholder */}
      <div
        className={`absolute inset-0 bg-gradient-to-br from-primary/40 to-zinc-900 transition-opacity duration-500 ${
          videoReady ? "opacity-0" : "opacity-100"
        }`}
      />

      {/* Video background */}
      {!reduceMotion && (
        <AnimatePresence>
          <motion.video
            key={currentVideo}
            src={currentVideo}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay={inView}
            muted
            loop
            playsInline
            onCanPlay={() => setVideoReady(true)}
          />
        </AnimatePresence>
      )}

      {/* Overlay — বাম দিকে dark (text-এর জন্য), ডান দিকে clear */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-r from-black/75 via-black/35 to-black/10" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/50 via-transparent to-black/20" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto w-full max-w-[1200px] px-6 py-20 lg:px-8 lg:py-28"
      >
        <motion.div
          variants={item}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-4 py-1.5 text-[13px] font-semibold text-white shadow-sm backdrop-blur-md"
        >
          <motion.span
            className="h-2 w-2 rounded-full bg-success"
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="font-bangla">
            {locale === "bn"
              ? "৫০০+ কৃষক এখন অনলাইনে সক্রিয়"
              : "500+ farmers active online now"}
          </span>
        </motion.div>

        <motion.h1
          variants={item}
          className="max-w-2xl font-bangla text-4xl font-extrabold leading-[1.25] text-white sm:text-5xl lg:text-[56px]"
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
          className="mt-5 max-w-lg font-bangla text-base leading-relaxed text-white/90 sm:text-lg"
        >
          {locale === "bn"
            ? "মধ্যস্বত্বভোগী ছাড়াই কৃষকের কাছ থেকে সরাসরি টাটকা ফসল কিনুন, ন্যায্য দামে বিক্রি করুন।"
            : "Buy fresh produce directly from farmers, sell at fair prices — no middlemen."}
        </motion.p>

        <motion.form
          variants={item}
          onSubmit={handleSearch}
          className="mt-8 flex max-w-lg items-center rounded-2xl border border-white/20 bg-white/95 p-1.5 shadow-2xl backdrop-blur-md transition-all focus-within:ring-2 focus-within:ring-primary/50"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.header.search}
              className="border-none bg-transparent pl-10 pr-3 font-bangla text-foreground shadow-none placeholder:text-muted-foreground/70 focus-visible:ring-0"
            />
          </div>
          <Button
            type="submit"
            className="rounded-xl bg-primary px-6 font-bangla font-semibold text-white transition-transform hover:bg-primary-hover active:scale-95"
          >
            {locale === "bn" ? "খুঁজুন" : "Search"}
          </Button>
        </motion.form>

        <motion.div
          variants={item}
          className="mt-8 flex flex-wrap gap-3 sm:gap-4"
        >
          {trustPoints.map((point) => (
            <div
              key={point}
              className="flex items-center gap-2 rounded-full border border-white/15 bg-black/50 px-3.5 py-1.5 text-[13.5px] font-medium text-white/90 shadow-sm backdrop-blur-md"
            >
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span className="font-bangla">{point}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {!reduceMotion && (
        <div className="absolute bottom-6 right-8 z-10 flex gap-2">
          {heroVideos.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentVideoIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentVideoIndex
                  ? "w-6 bg-accent"
                  : "w-2 bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Go to video ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
