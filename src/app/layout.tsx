import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Layout from '@/components/layout/Layout';
import ErrorBoundary from '@/components/error/ErrorBoundary';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "T&N - Redefine Your Style",
    template: "%s | T&N",
  },
  description: "Discover bold, minimal designs that speak to the modern lifestyle. Premium fashion and accessories for the contemporary wardrobe. Shop T-shirts, accessories, and more.",
  keywords: [
    "T&N fashion",
    "modern clothing",
    "minimal design",
    "contemporary fashion",
    "premium t-shirts",
    "fashion accessories",
    "online clothing store",
    "lifestyle brand",
    "trendy apparel",
    "quality clothing"
  ],
  authors: [{ name: "T&N Fashion" }],
  creator: "T&N Fashion",
  publisher: "T&N Fashion",
  metadataBase: new URL("https://tnfashion.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://tnfashion.vercel.app",
    title: "T&N - Redefine Your Style",
    description: "Discover bold, minimal designs that speak to the modern lifestyle. Premium fashion and accessories for the contemporary wardrobe.",
    siteName: "T&N Fashion",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "T&N Fashion - Modern Clothing Brand",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "T&N - Redefine Your Style",
    description: "Discover bold, minimal designs that speak to the modern lifestyle.",
    creator: "@tn_fashion",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
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
        <ErrorBoundary>
          <Layout>
            {children}
          </Layout>
        </ErrorBoundary>
      </body>
    </html>
  );
}
