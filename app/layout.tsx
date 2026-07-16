import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { EasterEgg } from "@/components/EasterEgg";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://digitalcampfire-production.up.railway.app"),

  title: {
    default: "Digital Campfire",
    template: "%s • Digital Campfire",
  },

  description:
    "Five strangers. One conversation. Fifteen minutes. Anonymous conversations that disappear when the fire goes out.",

  applicationName: "Digital Campfire",

  keywords: [
    "anonymous chat",
    "group chat",
    "social app",
    "language exchange",
    "conversation",
    "campfire",
    "real time chat",
    "digital campfire",
  ],

  authors: [
    {
      name: "Arindal Char",
    },
  ],

  creator: "arindal1",
  publisher: "Digital Campfire",

  category: "Social",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },

  openGraph: {
    type: "website",
    url: "https://digitalcampfire.app",
    title: "Digital Campfire",
    description:
      "Five strangers. One conversation. Fifteen minutes.",
    siteName: "Digital Campfire",

    images: [
      {
        url: "/image1.png",
        width: 1200,
        height: 630,
        alt: "Digital Campfire",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Digital Campfire",
    description:
      "Five strangers. One conversation. Fifteen minutes.",
    images: ["/ss1.png"],
  },

  icons: {
    icon: [
      {
        url: "/icon256.png",
      },
      {
        url: "/icon512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],

    apple: "/icon128.png",
  },

  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full bg-background text-white antialiased">
        {children}
        <EasterEgg />
      </body>
    </html>
  );
}