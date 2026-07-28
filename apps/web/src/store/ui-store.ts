import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Locale = "bn" | "en";

interface UIState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      locale: "bn",
      setLocale: (locale) => set({ locale }),
      toggleLocale: () => set({ locale: get().locale === "bn" ? "en" : "bn" }),
    }),
    {
      name: "farmiq-ui-store",
    },
  ),
);
