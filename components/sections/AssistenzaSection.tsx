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

type AssistenzaSectionProps = {
  embedded?: boolean;
};

export default function AssistenzaSection({ embedded = false }: AssistenzaSectionProps) {
  return (
    <section
      id="assistenza"
      className={
        embedded
          ? "border-t border-white/10 bg-transparent py-10 md:py-12"
          : "border-y border-white/10 bg-black py-16 pb-28 md:py-20 md:pb-32"
      }
    >
      <div className="mx-auto mb-12 max-w-7xl px-4 text-center md:px-8">
        <h2
          data-assistenza-title={embedded ? "" : undefined}
          className="text-2xl font-bold tracking-wide text-white uppercase md:text-3xl"
        >
          Assistenza
        </h2>
        <p
          data-assistenza-subtitle={embedded ? "" : undefined}
          className="mx-auto mt-3 max-w-xl text-sm text-gray-500"
        >
          Supporto dedicato, pagamenti sicuri e consegna rapida su ogni ordine.
        </p>
      </div>
      <StaggerSwap
        observe={!embedded}
        className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 sm:grid-cols-2 lg:grid-cols-4 md:px-8"
      >
        {features.map((feature) => {
          const Icon = iconMap[feature.icon];
          return (
            <div
              key={feature.title}
              data-assistenza-card={embedded ? "" : undefined}
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