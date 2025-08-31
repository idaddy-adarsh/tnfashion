import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Layout from '@/components/layout/Layout';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "T&N - Redefine Your Style",
  description: "Discover bold, minimal designs that speak to the modern lifestyle. Premium fashion and accessories for the contemporary wardrobe.",
  keywords: ["fashion", "clothing", "accessories", "modern", "minimal", "lifestyle"],
  authors: [{ name: "T&N" }],
  creator: "T&N",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://tn-ecommerce.vercel.app",
    title: "T&N - Redefine Your Style",
    description: "Discover bold, minimal designs that speak to the modern lifestyle.",
    siteName: "T&N",
  },
  twitter: {
    card: "summary_large_image",
    title: "T&N - Redefine Your Style",
    description: "Discover bold, minimal designs that speak to the modern lifestyle.",
    creator: "@tn_fashion",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">
        <Layout>
          {children}
        </Layout>
      </body>
    </html>
  );
}
