"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sprout,
  ShieldCheck,
  Users,
  MapPin,
  Target,
  Heart,
} from "lucide-react";

import { useUIStore } from "@/store/ui-store";
import { Button } from "@/components/ui/button";

const VALUES = [
  {
    icon: ShieldCheck,
    bn: {
      title: "স্বচ্ছতা",
      desc: "প্রতিটা লেনদেনে ন্যায্য দাম ও পরিষ্কার তথ্য।",
    },
    en: {
      title: "Transparency",
      desc: "Fair pricing and clear information in every transaction.",
    },
  },
  {
    icon: Users,
    bn: { title: "কৃষক প্রথম", desc: "কৃষকের স্বার্থকে সবসময় সবার আগে রাখি।" },
    en: {
      title: "Farmers First",
      desc: "We always put farmers' interests first.",
    },
  },
  {
    icon: Heart,
    bn: {
      title: "বিশ্বাসযোগ্যতা",
      desc: "প্রতিটা সম্পর্ক তৈরি হয় বিশ্বাসের উপর ভিত্তি করে।",
    },
    en: { title: "Trust", desc: "Every relationship is built on trust." },
  },
];

export default function AboutPage() {
  const { locale } = useUIStore();

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-border bg-surface py-16">
        <div className="mx-auto max-w-[800px] px-6 text-center lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Sprout className="h-7 w-7 text-primary" />
            </div>
            <h1 className="font-bangla text-3xl font-bold lg:text-4xl">
              {locale === "bn" ? "আমাদের সম্পর্কে" : "About FarmIQ"}
            </h1>
            <p className="mt-4 font-bangla text-[16px] leading-relaxed text-muted-foreground">
              {locale === "bn"
                ? "FarmIQ একটি সরাসরি কৃষি মার্কেটপ্লেস, যেখানে বাংলাদেশের কৃষকরা মধ্যস্বত্বভোগী ছাড়াই সরাসরি ক্রেতাদের কাছে তাদের ফসল বিক্রি করতে পারেন — ন্যায্য দামে, সহজে।"
                : "FarmIQ is a direct agricultural marketplace where farmers across Bangladesh can sell their produce directly to buyers — no middlemen, fair prices, made simple."}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16">
        <div className="mx-auto grid max-w-[1100px] grid-cols-1 items-center gap-10 px-6 lg:grid-cols-2 lg:px-8">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <h2 className="font-bangla text-2xl font-bold">
              {locale === "bn" ? "আমাদের লক্ষ্য" : "Our Mission"}
            </h2>
            <p className="mt-3 font-bangla text-[15px] leading-relaxed text-muted-foreground">
              {locale === "bn"
                ? "প্রচলিত কৃষি সরবরাহ ব্যবস্থায় অনেক স্তরের মধ্যস্বত্বভোগী থাকে, যার ফলে কৃষক ন্যায্য দাম পান না, আর ক্রেতাকে বেশি দাম দিতে হয়। FarmIQ এই ব্যবধান দূর করতে চায় — প্রযুক্তি ব্যবহার করে কৃষক ও ক্রেতাকে সরাসরি সংযুক্ত করে।"
                : "Traditional agricultural supply chains involve many layers of middlemen, leaving farmers underpaid while buyers overpay. FarmIQ aims to close that gap by connecting farmers and buyers directly through technology."}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="rounded-2xl border border-border bg-surface p-5 text-center">
              <div className="font-sans text-2xl font-bold text-primary">
                ৫,২০০+
              </div>
              <div className="mt-1 font-bangla text-xs text-muted-foreground">
                {locale === "bn" ? "নিবন্ধিত কৃষক" : "Registered Farmers"}
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-5 text-center">
              <div className="font-sans text-2xl font-bold text-primary">
                ৬৪
              </div>
              <div className="mt-1 font-bangla text-xs text-muted-foreground">
                {locale === "bn" ? "জেলায় সক্রিয়" : "Districts Active"}
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-5 text-center">
              <div className="font-sans text-2xl font-bold text-primary">
                ১৮,০০০+
              </div>
              <div className="mt-1 font-bangla text-xs text-muted-foreground">
                {locale === "bn" ? "সম্পন্ন অর্ডার" : "Completed Orders"}
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-5 text-center">
              <div className="font-sans text-2xl font-bold text-primary">
                ৪.৮/৫
              </div>
              <div className="mt-1 font-bangla text-xs text-muted-foreground">
                {locale === "bn" ? "গড় রেটিং" : "Average Rating"}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="border-t border-border bg-surface py-16">
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-center font-bangla text-2xl font-bold"
          >
            {locale === "bn" ? "আমাদের মূল্যবোধ" : "Our Values"}
          </motion.h2>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {VALUES.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="rounded-xl border border-border bg-background p-6 text-center"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <v.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bangla text-lg font-bold">
                  {locale === "bn" ? v.bn.title : v.en.title}
                </h3>
                <p className="mt-2 font-bangla text-sm leading-relaxed text-muted-foreground">
                  {locale === "bn" ? v.bn.desc : v.en.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-[700px] px-6 text-center lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <MapPin className="mx-auto mb-4 h-8 w-8 text-primary" />
            <h2 className="font-bangla text-2xl font-bold">
              {locale === "bn"
                ? "আমাদের সাথে যুক্ত হোন"
                : "Join the FarmIQ Community"}
            </h2>
            <p className="mt-2 font-bangla text-[15px] text-muted-foreground">
              {locale === "bn"
                ? "কৃষক বা ক্রেতা — যেই হোন না কেন, আজই শুরু করুন"
                : "Whether you're a farmer or a buyer, start today"}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button
                asChild
                className="bg-primary text-white hover:bg-primary-hover"
              >
                <Link href="/register">
                  {locale === "bn" ? "রেজিস্ট্রেশন করুন" : "Sign Up"}
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/products">
                  {locale === "bn" ? "পণ্য দেখুন" : "Browse Products"}
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
