import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import LoadingScreen from "@/components/LoadingScreen";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Elettronica51 — Tech Oggi",
  description:
    "Qualità, Convenienza, Velocità—Tutto Qui. Smartphone, audio, gaming e elettrodomestici.",
};

const themeScript = `
  (function () {
    var t = localStorage.getItem('theme') || 'dark';
    document.documentElement.classList.toggle('dark', t === 'dark');
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className={`${poppins.variable} h-full`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="ls-loading-active min-h-full bg-black font-sans text-gray-100 antialiased transition-colors duration-500 dark:bg-black dark:text-gray-100">
        <LoadingScreen />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}