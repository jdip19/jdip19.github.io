import type { Metadata } from "next";
import "./globals.css";

const BASE_URL = "https://quiclab.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Quiclab — Lightweight Tools for Creators & Developers",
    template: "%s | Quiclab",
  },
  description:
    "Quiclab builds lightweight productivity tools for creators and developers. Try QuicText, I2Snatcher, and QuicData — free and freemium tools trusted by thousands.",
  keywords: [
    "productivity tools",
    "developer tools",
    "Figma plugin",
    "text automation",
    "image converter",
    "WebP converter",
    "data transformation",
    "QuicText",
    "I2Snatcher",
    "QuicData",
    "Quiclab",
  ],
  authors: [{ name: "Quiclab", url: BASE_URL }],
  creator: "Quiclab",
  publisher: "Quiclab",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "Quiclab",
    title: "Quiclab — Lightweight Tools for Creators & Developers",
    description:
      "Quiclab builds lightweight productivity tools for creators and developers. Trusted by thousands worldwide.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Quiclab — Lightweight Tools for Creators & Developers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Quiclab — Lightweight Tools for Creators & Developers",
    description:
      "Lightweight productivity tools for creators and developers. Free & Freemium.",
    images: ["/og-image.png"],
    creator: "@quiclab",
    site: "@quiclab",
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
  alternates: {
    canonical: BASE_URL,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Quiclab",
              url: BASE_URL,
              logo: `${BASE_URL}/logo.svg`,
              description:
                "Quiclab builds lightweight productivity tools for creators and developers.",
              sameAs: [
                "https://twitter.com/quiclab",
                "https://github.com/quiclab",
              ],
              founder: {
                "@type": "Organization",
                name: "Quiclab",
              },
              offers: [
                {
                  "@type": "SoftwareApplication",
                  name: "QuicText",
                  applicationCategory: "DesignApplication",
                  operatingSystem: "Figma",
                  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
                },
                {
                  "@type": "SoftwareApplication",
                  name: "I2Snatcher",
                  applicationCategory: "DeveloperApplication",
                  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
                },
                {
                  "@type": "SoftwareApplication",
                  name: "QuicData",
                  applicationCategory: "BusinessApplication",
                  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
                },
              ],
            }),
          }}
        />
      </head>
      <body className="grain">{children}</body>
    </html>
  );
}
