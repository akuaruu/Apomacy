import type { Metadata } from "next";
import { Inter } from "next/font/google";
import NavbarWrapper from "@/components/shared/NavbarWrapper";
import FooterWrapper from "@/components/shared/FooterWrapper";
import { CartProvider } from "@/context/CartContext";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Apomacy",
  description: "Your Reliable Digital Pharmacy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <CartProvider>
          <NavbarWrapper />
          <main className="flex-1 bg-apomacy-bg">
            {children}
          </main>
          <FooterWrapper />
        </CartProvider>
      </body>
    </html>
  );
}