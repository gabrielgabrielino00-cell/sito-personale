import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartPanel from "@/components/cart/CartPanel";

type LegalPageShellProps = {
  title: string;
  children: React.ReactNode;
};

export default function LegalPageShell({ title, children }: LegalPageShellProps) {
  return (
    <>
      <Header />
      <CartPanel />
      <main className="min-h-[calc(100svh-var(--header-h))] border-t border-white/10 bg-[#050505] py-14 pb-20 text-gray-300 md:py-16">
        <div className="mx-auto max-w-3xl px-4 md:px-8">
          <Link
            href="/"
            className="mb-8 inline-block text-sm text-gray-500 transition-colors hover:text-brand"
          >
            ← Torna alla home
          </Link>
          <h1 className="mb-8 text-2xl font-bold tracking-wide text-white uppercase md:text-3xl">
            {title}
          </h1>
          <div className="space-y-5 text-sm leading-relaxed text-gray-500">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}