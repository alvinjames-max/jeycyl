import type { Metadata } from "next";
import { Fraunces, Work_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jeycyl Cakes | Artisan Celebration Cakes & Bakery Nairobi",
  description:
    "Order exquisite handcrafted cakes, cupcakes, and celebratory treats in Nairobi, Kenya. Baked fresh with premium ingredients, custom inscriptions, and same-day or scheduled delivery.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${workSans.variable} h-full scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-[#FBEEF2] text-[#3D1436] antialiased selection:bg-[#C9A227]/30 selection:text-[#3D1436]">
        <CartProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
