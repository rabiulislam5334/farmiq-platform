"use client";

import * as React from "react";
import { motion } from "framer-motion";

interface Tip {
  image: string;
  title: string;
  subtitle: string;
  description: string;
  link?: string;
}

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

function TipCard({
  tip,
  index,
  hoveredIndex,
  setHoveredIndex,
}: {
  tip: Tip;
  index: number;
  hoveredIndex: number | null;
  setHoveredIndex: (index: number | null) => void;
}) {
  const isActive = hoveredIndex === index;

  return (
    <div
      className={`relative h-[450px] w-full cursor-pointer overflow-hidden rounded-lg shadow-xl transition-all duration-700 ease-[cubic-bezier(0.22,0.61,0.36,1)] ${
        isActive ? "lg:w-[40%]" : "lg:w-[15%]"
      }`}
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex(null)}
    >
      {/* Background image */}
      <img
        src={tip.image}
        alt={tip.title}
        className={`absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-in-out ${
          isActive ? "scale-110" : "scale-100"
        }`}
      />

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Expanded content */}
      <div
        className={`absolute bottom-0 w-full p-6 text-white transition-all duration-[1000ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] ${
          isActive ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        }`}
        style={{
          willChange: "opacity, transform",
          transitionDelay: isActive ? "150ms" : "0ms",
        }}
      >
        <h4 className="mb-1 text-sm font-light text-accent">{tip.subtitle}</h4>
        <h3 className="mb-2 text-xl font-bold leading-tight">{tip.title}</h3>
        <p className="mb-4 text-xs leading-relaxed text-gray-200">
          {tip.description}
        </p>
        <GreenArrowButton link={tip.link} />
      </div>

      {/* Collapsed title */}
      <div
        className={`absolute bottom-0 left-0 w-full p-6 text-white transition-opacity duration-500 ease-in-out ${
          isActive ? "opacity-0" : "opacity-100"
        }`}
      >
        <h4 className="mb-1 text-sm font-light text-accent">{tip.subtitle}</h4>
        <h3 className="mb-2 text-xl font-bold leading-tight">{tip.title}</h3>
      </div>
    </div>
  );
}

const tipsData: Tip[] = [
  {
    image:
      "https://demo2.themelexus.com/agrile/wp-content/uploads/2024/11/project-2-1024x788.jpg",
    title: "Soil Health First",
    subtitle: "Eco and Agriculture",
    description:
      "Focus on natural fertilizers and crop rotation for better yield and sustained soil quality.",
  },
  {
    image:
      "https://demo2.themelexus.com/agrile/wp-content/uploads/2024/11/project-3-1024x788.jpg",
    title: "Water Management",
    subtitle: "Irrigation Strategies",
    description:
      "Implement drip irrigation systems to conserve water and ensure plants receive consistent moisture.",
  },
  {
    image:
      "https://demo2.themelexus.com/agrile/wp-content/uploads/2024/11/project-4-1024x788.jpg",
    title: "Pest Control",
    subtitle: "Natural Defenses",
    description:
      "Use integrated pest management (IPM) techniques with biological controls and natural deterrents.",
  },
  {
    image:
      "https://demo2.themelexus.com/agrile/wp-content/uploads/2024/11/project-9-1024x788.jpg",
    title: "Tractor Maintenance",
    subtitle: "Seasonal Checks",
    description:
      "Ensure machinery is serviced before planting and harvest to prevent costly downtime.",
  },
  {
    image:
      "https://demo2.themelexus.com/agrile/wp-content/uploads/2024/11/project-1-1024x788.jpg",
    title: "Harvest Timing",
    subtitle: "Optimal Freshness",
    description:
      "Harvest leafy greens early in the morning for maximum freshness and nutritional value.",
  },
];

export function FarmTips() {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
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
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="mb-12 text-center"
        >
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-accent">
            EXPLORE PROJECTS
          </p>
          <h2 className="text-4xl font-extrabold text-white sm:text-5xl">
            Recently Farm Tips
          </h2>
        </motion.div>

        {/* Cards */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="flex items-center justify-center gap-4 transition-all duration-700"
        >
          {tipsData.map((tip, index) => (
            <TipCard
              key={index}
              tip={tip}
              index={index}
              hoveredIndex={hoveredIndex}
              setHoveredIndex={setHoveredIndex}
            />
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
