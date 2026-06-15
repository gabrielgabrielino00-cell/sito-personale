export const navLinks = [
  { label: "Home", href: "#" },
  { label: "Prodotti", href: "#prodotti" },
  {
    label: "Categorie",
    href: "#categorie",
    children: [
      "Accessori",
      "Elettrodomestici",
      "Smartphone",
      "Elettronica",
      "Cuffie",
      "Audio",
      "Video Games",
    ],
  },
  { label: "Assistenza", href: "#assistenza" },
  { label: "Contatti", href: "#contatti" },
];

export const socialLinks = [
  { label: "Whatsapp", href: "https://api.whatsapp.com/send?phone=+393335210878" },
  { label: "Instagram", href: "https://www.instagram.com/elettronica51_/" },
  { label: "Facebook", href: "https://www.facebook.com/Elettronica51" },
  { label: "Tiktok", href: "https://www.tiktok.com/@elettronica51_" },
];

export type CategoryIcon =
  | "accessori"
  | "audio"
  | "cuffie"
  | "elettrodomestici"
  | "elettronica"
  | "smartphone"
  | "videogames";

export const categories: {
  name: string;
  slug: string;
  icon: CategoryIcon;
}[] = [
  { name: "Accessori", slug: "accessori", icon: "accessori" },
  { name: "Audio", slug: "audio", icon: "audio" },
  { name: "Cuffie", slug: "cuffie", icon: "cuffie" },
  {
    name: "Elettrodomestici",
    slug: "elettrodomestici",
    icon: "elettrodomestici",
  },
  { name: "Elettronica", slug: "elettronica", icon: "elettronica" },
  { name: "Smartphone", slug: "smartphone", icon: "smartphone" },
  { name: "Video Games", slug: "videogames", icon: "videogames" },
];

export const featuredProducts = [
  {
    id: 1,
    name: "APPLE IPAD AIR 2024 6 GENERATION 13 POLLICI 128GB M2 Wi-Fi BLUE",
    price: "920,00 €",
    image: "/products/ipad-air-2024.jpg",
  },
  {
    id: 2,
    name: "AirPods 3th Generazione",
    price: "179,00 €",
    image: "/products/airpods-3.jpg",
  },
  {
    id: 3,
    name: "Apple AirPods Pro 2th Generazione",
    price: "249,00 €",
    image: "/products/airpods-pro-2.jpg",
  },
  {
    id: 4,
    name: "Ipad 10th generazione 64gb Blue",
    price: "375,00 €",
    image: "/products/ipad-10th.jpg",
  },
  {
    id: 5,
    name: "Samsung galaxy A5 32gb",
    price: "115,00 €",
    image: "/products/samsung-a5.jpg",
  },
  {
    id: 6,
    name: "Xbox Elite Series 2 Wireless-Controller",
    price: "119,00 €",
    image: "/products/xbox-elite-2.jpg",
  },
  {
    id: 7,
    name: "JBL Tune 670 NC Auricolare",
    price: "69,00 €",
    image: "/products/jbl-tune-670.jpg",
  },
  {
    id: 8,
    name: "LENOVO V15 G3",
    price: "395,00 €",
    image: "/products/lenovo-v15.jpg",
  },
];

export const features = [
  {
    icon: "star" as const,
    title: "Migliore qualità",
    description: "Forniamo prodotti della migliore qualità",
  },
  {
    icon: "support" as const,
    title: "Assistenza 24 ore su 24, 7 giorni su 7",
    description: "Assistenza 24 ore su 24, 7 giorni su 7",
  },
  {
    icon: "payment" as const,
    title: "Pagamento in linea",
    description:
      "pagamento accettato tramite bonifico bancario o PayPal",
  },
  {
    icon: "delivery" as const,
    title: "Consegna veloce",
    description: "La consegna veloce è la nostra priorità",
  },
];

export const footerLinks = [
  "Chi siamo",
  "Contatti",
  "Refund and Returns Policy",
  "Privacy Policy",
];

export const contactInfo = [
  { icon: "mail" as const, text: "Email: elettronica51@hotmail.it" },
  { icon: "phone" as const, text: "Telefono: +393335210878" },
  { icon: "check" as const, text: "P. Iva 08215101216" },
  {
    icon: "check" as const,
    text: "Nome Azienda: Elettronica51 Di Riccio Francesco",
  },
];

export const LOGO_PATH = "/brand/logo.svg";