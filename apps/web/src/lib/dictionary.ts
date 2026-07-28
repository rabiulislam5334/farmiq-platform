export const dictionary = {
  bn: {
    nav: {
      home: "হোম",
      products: "সব পণ্য",
      sell: "বিক্রেতা হোন",
      ai: "AI পরামর্শ",
      about: "আমাদের সম্পর্কে",
    },
    header: {
      login: "লগইন",
      register: "রেজিস্ট্রেশন",
      search: "খুঁজুন...",
    },
    footer: {
      tagline:
        "বাংলাদেশের কৃষকদের জন্য সরাসরি মার্কেটপ্লেস — মধ্যস্বত্বভোগী ছাড়াই ন্যায্যমূল্যে কেনাবেচা।",
      platform: "প্ল্যাটফর্ম",
      support: "সহায়তা",
      legal: "আইনি",
      contact: "যোগাযোগ",
      complaint: "অভিযোগ জানান",
      faq: "প্রায়শই জিজ্ঞাসিত প্রশ্ন",
      terms: "শর্তাবলী",
      privacy: "গোপনীয়তা নীতি",
      rights: "সর্বস্বত্ব সংরক্ষিত।",
      madeFor: "তৈরি হয়েছে বাংলাদেশের কৃষকদের জন্য",
    },
  },
  en: {
    nav: {
      home: "Home",
      products: "All Products",
      sell: "Become a Seller",
      ai: "AI Advisory",
      about: "About Us",
    },
    header: {
      login: "Log in",
      register: "Sign up",
      search: "Search products...",
    },
    footer: {
      tagline:
        "A direct marketplace for Bangladeshi farmers — fair trade without middlemen.",
      platform: "Platform",
      support: "Support",
      legal: "Legal",
      contact: "Contact",
      complaint: "Report an Issue",
      faq: "FAQ",
      terms: "Terms of Service",
      privacy: "Privacy Policy",
      rights: "All rights reserved.",
      madeFor: "Made for the farmers of Bangladesh",
    },
  },
} as const;

export type DictionaryKey = keyof typeof dictionary.bn;
