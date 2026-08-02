"use client";

import { motion, type Variants } from "framer-motion";
import {
  ShieldCheck,
  MessageCircle,
  Sparkles,
  BadgeCheck,
  Scale,
  Truck,
} from "lucide-react";

import { useUIStore } from "@/store/ui-store";

const points = [
  {
    icon: ShieldCheck,
    bn: {
      title: "নিরাপদ এসক্রো পেমেন্ট",
      desc: "পণ্য হাতে পাওয়ার আগ পর্যন্ত টাকা সুরক্ষিত থাকে।",
    },
    en: {
      title: "Secure Escrow Payment",
      desc: "Funds stay protected until you receive your order.",
    },
  },
  {
    icon: MessageCircle,
    bn: {
      title: "সরাসরি কৃষকের সাথে চ্যাট",
      desc: "দরদাম করুন, ছবি চান, মধ্যস্বত্বভোগী ছাড়াই কথা বলুন।",
    },
    en: {
      title: "Direct Chat with Farmers",
      desc: "Negotiate, ask for photos, talk with no middlemen.",
    },
  },
  {
    icon: Sparkles,
    bn: {
      title: "AI কৃষি পরামর্শ",
      desc: "ফসলের রোগ বা সার নিয়ে বাংলায় প্রশ্ন করুন, তাৎক্ষণিক উত্তর পান।",
    },
    en: {
      title: "AI Farming Advisory",
      desc: "Ask about crop disease or fertilizer, get instant answers.",
    },
  },
  {
    icon: BadgeCheck,
    bn: {
      title: "যাচাইকৃত বিক্রেতা",
      desc: "প্রতিটা কৃষক ও বিক্রেতার পরিচয় যাচাই করা হয়।",
    },
    en: {
      title: "Verified Sellers",
      desc: "Every farmer and seller identity is verified.",
    },
  },
  {
    icon: Scale,
    bn: {
      title: "ন্যায্য বিরোধ নিষ্পত্তি",
      desc: "সমস্যা হলে dedicated dispute resolution টিম সাহায্য করে।",
    },
    en: {
      title: "Fair Dispute Resolution",
      desc: "A dedicated team steps in when something goes wrong.",
    },
  },
  {
    icon: Truck,
    bn: {
      title: "দ্রুত ডেলিভারি ট্র্যাকিং",
      desc: "অর্ডার status রিয়েল-টাইমে দেখুন, কখন পৌঁছাবে জানুন।",
    },
    en: {
      title: "Real-time Delivery Tracking",
      desc: "Track your order status live, know exactly when it arrives.",
    },
  },
];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export function WhyFarmIQ() {
  const { locale } = useUIStore();

  return (
    <section className="relative overflow-hidden border-y border-border bg-surface py-20">
      {/* Background Subtle Accent */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[800px] -translate-x-1/2 bg-gradient-to-b from-primary/5 to-transparent blur-3xl" />

      <div className="relative mx-auto max-w-[1200px] px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center sm:text-left"
        >
          <h2 className="font-bangla text-3xl font-extrabold tracking-tight text-foreground lg:text-[34px]">
            {locale === "bn" ? "কেন FarmIQ বেছে নেবেন" : "Why Choose FarmIQ"}
          </h2>
          <p className="mt-2 font-bangla text-base text-muted-foreground">
            {locale === "bn"
              ? "প্রতিটা লেনদেনে যা নিশ্চিত করা হয়"
              : "What we guarantee in every transaction"}
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {points.map((p, i) => {
            const Icon = p.icon;

            return (
              <motion.div
                key={i}
                variants={item}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="group relative overflow-hidden rounded-2xl border border-border bg-background p-7 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5"
              >
                {/* Green Bottom Border Line on Hover */}
                <span className="absolute bottom-0 left-0 h-[3px] w-0 bg-primary transition-all duration-300 ease-out group-hover:w-full" />

                {/* Icon Wrapper */}
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-md group-hover:shadow-primary/20">
                  <Icon
                    className="h-6 w-6 transition-transform duration-300 group-hover:scale-110"
                    strokeWidth={2}
                  />
                </div>

                {/* Content */}
                <h3 className="mb-2 font-bangla text-lg font-bold text-foreground transition-colors group-hover:text-primary">
                  {locale === "bn" ? p.bn.title : p.en.title}
                </h3>
                <p className="font-bangla text-[14.5px] leading-relaxed text-muted-foreground">
                  {locale === "bn" ? p.bn.desc : p.en.desc}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
