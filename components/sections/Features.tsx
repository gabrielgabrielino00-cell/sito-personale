"use client";

import { Star, Calendar, CreditCard, Truck } from "lucide-react";
import { features } from "@/lib/data";
import StaggerSwap from "@/components/motion/StaggerSwap";

const iconMap = {
  star: Star,
  support: Calendar,
  payment: CreditCard,
  delivery: Truck,
};

export default function Features() {
  return (
    <section
      id="features"
      className="border-y border-white/10 bg-black py-16 pb-28 md:py-20 md:pb-32 dark:border-white/10 dark:bg-black"
    >
      <StaggerSwap className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 sm:grid-cols-2 lg:grid-cols-4 md:px-8">
        {features.map((feature) => {
          const Icon = iconMap[feature.icon];
          return (
            <div
              key={feature.title}
              className="feature-swap-card group flex flex-col items-center text-center"
            >
              <div className="feature-swap-icon mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand/10 text-brand dark:bg-brand/20">
                <Icon className="h-7 w-7" strokeWidth={1.5} />
              </div>
              <h3 className="mb-2 text-lg font-bold text-white">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          );
        })}
      </StaggerSwap>
    </section>
  );
}