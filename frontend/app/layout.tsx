import type { Metadata } from "next";
import NavbarWrapper from "@/components/shared/NavbarWrapper";
import FooterWrapper from "@/components/shared/FooterWrapper";
import { CartProvider } from "@/context/CartContext";
import "./globals.css";

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
    <html lang="en" className="h-full antialiased">
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