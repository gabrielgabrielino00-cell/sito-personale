"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingCart, Menu, X, ChevronDown } from "lucide-react";
import { navLinks, socialLinks } from "@/lib/data";
import Logo from "@/components/brand/Logo";
import SwapLink from "@/components/motion/SwapLink";
import { useHeaderScroll } from "@/hooks/useHeaderScroll";
import {
  WhatsappIcon,
  InstagramIcon,
  FacebookIcon,
  TikTokIcon,
} from "@/components/ui/SocialIcons";
import ThemeToggle from "@/components/theme/ThemeToggle";

const socialIcons = {
  Whatsapp: WhatsappIcon,
  Instagram: InstagramIcon,
  Facebook: FacebookIcon,
  Tiktok: TikTokIcon,
};

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const scrolled = useHeaderScroll();

  return (
    <header
      className={`header-swap sticky top-0 z-50 border-b border-white/10 bg-black/90 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-black/90 ${
        scrolled ? "is-scrolled" : ""
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-8">
        <Link
          href="/"
          className="shrink-0 text-white transition-opacity hover:opacity-90"
        >
          <Logo size="md" className="md:h-12" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) =>
            link.children ? (
              <div key={link.label} className="group relative">
                <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium uppercase tracking-wide text-gray-700 transition-colors hover:text-brand dark:text-gray-300 dark:hover:text-brand">
                  {link.label}
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                <div className="invisible absolute top-full left-0 min-w-[200px] rounded-lg border border-gray-100 bg-white py-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100 dark:border-white/10 dark:bg-[#141414]">
                  {link.children.map((child) => (
                    <SwapLink
                      key={child}
                      href="#categorie"
                      className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-brand dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-brand"
                    >
                      {child}
                    </SwapLink>
                  ))}
                </div>
              </div>
            ) : link.href.startsWith("#") && link.href !== "#" ? (
              <SwapLink
                key={link.label}
                href={link.href}
                className="px-4 py-2 text-sm font-medium uppercase tracking-wide text-gray-700 transition-colors hover:text-brand dark:text-gray-300 dark:hover:text-brand"
              >
                {link.label}
              </SwapLink>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="px-4 py-2 text-sm font-medium uppercase tracking-wide text-gray-700 transition-colors hover:text-brand dark:text-gray-300 dark:hover:text-brand"
              >
                {link.label}
              </a>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <ThemeToggle />

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
                className="hidden h-9 w-9 items-center justify-center rounded-full text-gray-500 transition-all hover:bg-brand hover:text-white sm:flex dark:text-gray-400"
              >
                <Icon className="h-4 w-4" />
              </a>
            );
          })}

          <button
            aria-label="Carrello"
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-600 transition-all hover:bg-gray-100 hover:text-brand dark:text-gray-300 dark:hover:bg-white/10"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
              0
            </span>
          </button>

          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 lg:hidden dark:text-gray-300"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-4 lg:hidden dark:border-white/10 dark:bg-[#0a0a0a]">
          {navLinks.map((link) =>
            link.children ? (
              <div key={link.label}>
                <button
                  onClick={() => setCatOpen(!catOpen)}
                  className="flex w-full items-center justify-between py-3 text-sm font-medium uppercase text-gray-700 dark:text-gray-300"
                >
                  {link.label}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${catOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {catOpen &&
                  link.children.map((child) => (
                    <SwapLink
                      key={child}
                      href="#categorie"
                      className="block py-2 pl-4 text-sm text-gray-500 dark:text-gray-400"
                      onClick={() => setMenuOpen(false)}
                    >
                      {child}
                    </SwapLink>
                  ))}
              </div>
            ) : link.href.startsWith("#") && link.href !== "#" ? (
              <SwapLink
                key={link.label}
                href={link.href}
                className="block py-3 text-sm font-medium uppercase text-gray-700 dark:text-gray-300"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </SwapLink>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="block py-3 text-sm font-medium uppercase text-gray-700 dark:text-gray-300"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ),
          )}
        </div>
      )}
    </header>
  );
}