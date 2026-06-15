import { Mail, Phone, Check, Star, Headphones, ShieldCheck, Truck } from "lucide-react";
import { socialLinks, footerLinks, contactInfo } from "@/lib/data";
import Logo from "@/components/brand/Logo";
import {
  WhatsappIcon,
  InstagramIcon,
  FacebookIcon,
  TikTokIcon,
} from "@/components/ui/SocialIcons";

const socialIcons = {
  Whatsapp: WhatsappIcon,
  Instagram: InstagramIcon,
  Facebook: FacebookIcon,
  Tiktok: TikTokIcon,
};

const contactIcons = {
  mail: Mail,
  phone: Phone,
  check: Check,
};

const trustHighlights = [
  { icon: Star, label: "Qualità premium" },
  { icon: Headphones, label: "Assistenza 24/7" },
  { icon: ShieldCheck, label: "Pagamenti sicuri" },
  { icon: Truck, label: "Consegna veloce" },
] as const;

type ContattiSectionProps = {
  embedded?: boolean;
};

export default function ContattiSection({ embedded = false }: ContattiSectionProps) {
  return (
    <section
      id="contatti"
      className={
        embedded
          ? "flex min-h-[58vh] flex-col border-t border-white/10 bg-transparent py-10 md:min-h-[62vh] md:py-12"
          : "border-t border-white/10 bg-[#050505] py-14 pb-20 text-gray-300 md:py-16"
      }
    >
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 md:px-8">
        {embedded ? (
          <div className="mb-8 text-center">
            <h2
              data-contatti-title
              className="text-2xl font-bold tracking-wide text-white uppercase md:text-3xl"
            >
              Contatti
            </h2>
            <p
              data-contatti-subtitle
              className="mx-auto mt-3 max-w-xl text-sm text-gray-500"
            >
              Siamo qui per aiutarti — contattaci quando vuoi.
            </p>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-12">
          <div data-contatti-block>
            <div className="mb-4 text-white">
              <Logo size={embedded ? "md" : "lg"} />
            </div>
            <p className="mb-5 text-sm leading-relaxed text-gray-500">
              Esplora le ultime novità in elettronica all&apos;avanguardia, dai
              smartphone agli elettrodomestici. Approfitta di offerte esclusive
              e spedizione veloce e affidabile su ogni ordine.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon =
                  socialIcons[social.label as keyof typeof socialIcons];
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    data-contatti-social
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-gray-300 transition-all hover:bg-brand hover:text-white"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          <div data-contatti-block>
            <h6 className="mb-4 text-sm font-bold tracking-wider text-white uppercase">
              Collegamenti rapidi
            </h6>
            <ul className="space-y-2.5">
              {footerLinks.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-gray-500 transition-colors hover:text-brand"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div data-contatti-block>
            <h6 className="mb-4 text-sm font-bold tracking-wider text-white uppercase">
              Mettiti in contatto
            </h6>
            <ul className="space-y-2.5">
              {contactInfo.map((item) => {
                const Icon = contactIcons[item.icon];
                return (
                  <li key={item.text} className="flex items-start gap-3">
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                    <span className="text-sm text-gray-500">{item.text}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {embedded ? (
          <div data-contatti-footer className="mt-auto pt-10 md:pt-12">
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.12] bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-transparent px-5 py-9 md:px-10 md:py-11">
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-brand/12 to-transparent"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -right-20 -bottom-20 h-56 w-56 rounded-full bg-brand/[0.07] blur-3xl"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -left-16 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-white/[0.03] blur-3xl"
                aria-hidden
              />

              <div className="relative flex flex-col items-center text-center">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_0_40px_rgba(249,115,22,0.12)]">
                  <Logo size="xl" className="text-white" />
                </div>

                <p className="text-[10px] font-semibold tracking-[0.32em] text-brand uppercase">
                  Elettronica51
                </p>
                <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-gray-400">
                  Il tuo punto di riferimento per tecnologia e elettronica — qualità,
                  assistenza dedicata e spedizione veloce su ogni ordine.
                </p>

                <div className="mt-7 grid w-full max-w-xl grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {trustHighlights.map(({ icon: Icon, label }) => (
                    <div
                      key={label}
                      className="flex flex-col items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-2 py-3"
                    >
                      <Icon className="h-4 w-4 text-brand" strokeWidth={1.75} />
                      <span className="text-[10px] leading-tight font-medium tracking-wide text-gray-400 uppercase">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                  {socialLinks.map((social) => {
                    const Icon =
                      socialIcons[social.label as keyof typeof socialIcons];
                    return (
                      <a
                        key={`footer-${social.label}`}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.label}
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-gray-300 transition-all hover:border-brand/40 hover:bg-brand hover:text-white"
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    );
                  })}
                </div>

                <p className="mt-8 w-full border-t border-white/10 pt-5 text-xs tracking-wide text-gray-500">
                  © All Rights Reserved, elettronica51.net.
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}