import { CategoryChips } from "@/components/home/category-chips";
import { FarmTips } from "@/components/home/farm-tips";
import { FeaturedProducts } from "@/components/home/featured-products";
import { Hero } from "@/components/home/hero";
import { SellerCta } from "@/components/home/seller-cta";
import { StatsStrip } from "@/components/home/stats-strip";
import { WhyFarmIQ } from "@/components/home/why-farmiq";

export default function HomePage() {
  return (
    <>
      <Hero />
      <CategoryChips />
      <FeaturedProducts />
      <WhyFarmIQ />
      <StatsStrip />
      <SellerCta />
      <FarmTips />

      {/*  */}
      {/* */}
      {/*  */}
      {/* <SellerCta /> */}
    </>
  );
}
