import Footer from "@/components/layout/Footer";

import ProductCarousel from "@/components/sections/ProductCarousel";
import CloudDivider from "@/components/motion/CloudDivider";
import ScrollProgress from "@/components/motion/ScrollProgress";
import MotionBoot from "@/components/motion/MotionBoot";
import ScrollSwapSection from "@/components/motion/ScrollSwapSection";
import SiteSlide from "@/components/motion/SiteSlide";

type HomePageProps = {
  productsSectionRef?: React.RefObject<HTMLDivElement | null>;
  productsHidden?: boolean;
  productsPinned?: boolean;
};

export default function HomePage({
  productsSectionRef,
  productsHidden = false,
  productsPinned = false,
}: HomePageProps) {
  return (
    <>
      <MotionBoot />
      <ScrollProgress />
      <main className="motion-page bg-black">
        <div
          ref={productsSectionRef}
          id="prodotti"
          className={`${
            productsPinned
              ? "products-pinned fixed inset-x-0 bottom-0 z-[45] max-h-[38vh] overflow-hidden border-t border-white/[0.08] bg-[#080808] shadow-[0_-16px_48px_rgba(0,0,0,0.5)]"
              : "relative"
          }`}
          style={
            productsHidden
              ? { opacity: 0, pointerEvents: "none", transform: "translateY(72px)" }
              : undefined
          }
        >
          <SiteSlide nextTarget="#assistenza" reveal delay={80}>
            <ProductCarousel />
          </SiteSlide>
        </div>

        <ScrollSwapSection delay={60}>
          <CloudDivider tone="ink" />
        </ScrollSwapSection>
      </main>

      <SiteSlide topTarget="#hero">
        <Footer />
      </SiteSlide>
    </>
  );
}