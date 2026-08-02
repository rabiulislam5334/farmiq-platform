"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { useUIStore } from "@/store/ui-store";

interface Tip {
  image: string;
  title: { bn: string; en: string };
  subtitle: { bn: string; en: string };
  description: { bn: string; en: string };
  link?: string;
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function GreenArrowButton({ link = "#" }: { link?: string }) {
  return (
    <a
      href={link}
      className="inline-block rounded-full bg-primary p-2 transition-colors duration-200 hover:bg-primary-hover"
      aria-label="Read more details"
    >
      <svg
        className="h-4 w-4 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M14 5l7 7m0 0l-7 7m7-7H3"
        />
      </svg>
    </a>
  );
}

const textVariants = {
  collapsed: { transition: { staggerChildren: 0.04 } },
  expanded: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
};

const lineVariants = {
  collapsed: { opacity: 0.85, y: 0 },
  expanded: { opacity: 1, y: 0 },
};

const detailVariants = {
  collapsed: { opacity: 0, height: 0, y: 8 },
  expanded: { opacity: 1, height: "auto", y: 0 },
};

function TipCard({
  tip,
  index,
  hoveredIndex,
  setHoveredIndex,
  locale,
}: {
  tip: Tip;
  index: number;
  hoveredIndex: number | null;
  setHoveredIndex: (index: number | null) => void;
  locale: "bn" | "en";
}) {
  const isActive = hoveredIndex === index;

  return (
    <motion.div
      layout
      transition={{ layout: { duration: 0.6, ease: EASE } }}
      className={`relative h-[450px] w-full cursor-pointer overflow-hidden rounded-lg shadow-xl ${
        isActive ? "lg:w-[40%]" : "lg:w-[15%]"
      }`}
      onMouseEnter={() => setHoveredIndex(index)}
    >
      {/* Background image */}
      <motion.img
        src={tip.image}
        alt={tip.title[locale]}
        className="absolute inset-0 h-full w-full object-cover"
        animate={{ scale: isActive ? 1.08 : 1 }}
        transition={{ duration: 0.6, ease: EASE }}
      />

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Text content */}
      <motion.div
        className="absolute bottom-0 w-full p-6 text-white"
        initial={false}
        animate={isActive ? "expanded" : "collapsed"}
        variants={textVariants}
      >
        <motion.h4
          variants={lineVariants}
          transition={{ duration: 0.35, ease: EASE }}
          className="mb-1 font-bangla text-sm font-light text-accent"
        >
          {tip.subtitle[locale]}
        </motion.h4>
        <motion.h3
          variants={lineVariants}
          transition={{ duration: 0.35, ease: EASE }}
          className="mb-2 font-bangla text-xl font-bold leading-tight"
        >
          {tip.title[locale]}
        </motion.h3>
        <motion.div
          variants={detailVariants}
          transition={{ duration: 0.4, ease: EASE }}
          className="overflow-hidden"
        >
          <p className="mb-4 font-bangla text-xs leading-relaxed text-gray-200">
            {tip.description[locale]}
          </p>
          <GreenArrowButton link={tip.link} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

const tipsData: Tip[] = [
  {
    image:
      "https://demo2.themelexus.com/agrile/wp-content/uploads/2024/11/project-2-1024x788.jpg",
    title: { bn: "মাটির স্বাস্থ্য প্রথমে", en: "Soil Health First" },
    subtitle: { bn: "পরিবেশ ও কৃষি", en: "Eco and Agriculture" },
    description: {
      bn: "ভালো ফলন ও দীর্ঘমেয়াদী মাটির গুণমানের জন্য প্রাকৃতিক সার ও ফসল আবর্তনের উপর জোর দিন।",
      en: "Focus on natural fertilizers and crop rotation for better yield and sustained soil quality.",
    },
  },
  {
    image:
      "https://demo2.themelexus.com/agrile/wp-content/uploads/2024/11/project-3-1024x788.jpg",
    title: { bn: "সেচ ব্যবস্থাপনা", en: "Water Management" },
    subtitle: { bn: "সেচ কৌশল", en: "Irrigation Strategies" },
    description: {
      bn: "পানি সাশ্রয় করতে ড্রিপ ইরিগেশন ব্যবহার করুন, যাতে গাছ নিয়মিত পরিমাণে আর্দ্রতা পায়।",
      en: "Implement drip irrigation systems to conserve water and ensure plants receive consistent moisture.",
    },
  },
  {
    image:
      "https://demo2.themelexus.com/agrile/wp-content/uploads/2024/11/project-4-1024x788.jpg",
    title: { bn: "পোকা দমন", en: "Pest Control" },
    subtitle: { bn: "প্রাকৃতিক প্রতিরক্ষা", en: "Natural Defenses" },
    description: {
      bn: "জৈবিক নিয়ন্ত্রণ ও প্রাকৃতিক প্রতিরোধক ব্যবহার করে সমন্বিত পোকা দমন (IPM) পদ্ধতি অনুসরণ করুন।",
      en: "Use integrated pest management (IPM) techniques with biological controls and natural deterrents.",
    },
  },
  {
    image:
      "https://demo2.themelexus.com/agrile/wp-content/uploads/2024/11/project-9-1024x788.jpg",
    title: { bn: "ট্রাক্টর রক্ষণাবেক্ষণ", en: "Tractor Maintenance" },
    subtitle: { bn: "মৌসুমি পরীক্ষা", en: "Seasonal Checks" },
    description: {
      bn: "রোপণ ও ফসল কাটার আগে যন্ত্রপাতি সার্ভিসিং করান, যাতে অপ্রয়োজনীয় বিলম্ব এড়ানো যায়।",
      en: "Ensure machinery is serviced before planting and harvest to prevent costly downtime.",
    },
  },
  {
    image:
      "https://demo2.themelexus.com/agrile/wp-content/uploads/2024/11/project-1-1024x788.jpg",
    title: { bn: "ফসল তোলার সময়", en: "Harvest Timing" },
    subtitle: { bn: "সর্বোচ্চ সতেজতা", en: "Optimal Freshness" },
    description: {
      bn: "সর্বোচ্চ সতেজতা ও পুষ্টিগুণের জন্য শাক-সবজি সকালবেলা তুলুন।",
      en: "Harvest leafy greens early in the morning for maximum freshness and nutritional value.",
    },
  },
];

export function FarmTips() {
  const { locale } = useUIStore();
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: EASE }}
      className="relative hidden overflow-hidden font-inter lg:block lg:py-20"
    >
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div
          className="h-full w-full bg-cover bg-center opacity-70"
          style={{
            backgroundImage:
              "url('https://i.pinimg.com/736x/95/8a/d5/958ad58048ece99a72f5d34aad470bf1.jpg')",
          }}
        />
        <div className="absolute inset-0 bg-black/80" />
      </div>

      <div className="relative z-10 mx-auto w-11/12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-12 text-center"
        >
          <p className="font-bangla mb-2 text-sm font-semibold uppercase tracking-widest text-accent">
            {locale === "bn" ? "কৃষি টিপস" : "Explore Tips"}
          </p>
          <h2 className="font-bangla text-4xl font-extrabold text-white sm:text-5xl">
            {locale === "bn"
              ? "সাম্প্রতিক কৃষি পরামর্শ"
              : "Recently Added Farm Tips"}
          </h2>
        </motion.div>

        {/* Cards */}
        <motion.div
          layout
          className="flex items-center justify-center gap-4"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {tipsData.map((tip, index) => (
            <TipCard
              key={index}
              tip={tip}
              index={index}
              hoveredIndex={hoveredIndex}
              setHoveredIndex={setHoveredIndex}
              locale={locale}
            />
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
