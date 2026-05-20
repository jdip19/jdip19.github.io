import Head from "next/head";
import Script from "next/script";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Products from "@/components/Products";
import Why from "@/components/Why";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import Link from "next/link";
import { navigate } from "next/dist/client/components/segment-cache/navigation";



import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  const handleLeadClick = () => {
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "Lead", { value: 10.0, currency: "USD" });
    }
    router.push("himalayan-shilajit-power-combo");
  };

  // ...

  return (
    <>
      <Head>
        <title>Quiclab — Lightweight Tools for Creators & Developers</title>
        <meta name="description" content="Quiclab builds lightweight productivity tools for creators and developers. Try QuicText, I2Snatcher, and QuicData — free and freemium tools trusted by thousands." />
        <meta name="keywords" content="productivity tools, developer tools, Figma plugin, QuicText, I2Snatcher, QuicData" />

        {/* OpenGraph */}
        <meta property="og:title" content="Quiclab — Lightweight Tools for Creators & Developers" />
        <meta property="og:description" content="Lightweight productivity tools for creators and developers. Free & Freemium." />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:url" content="https://quiclab.com" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Quiclab" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Quiclab — Lightweight Tools for Creators & Developers" />
        <meta name="twitter:description" content="Lightweight productivity tools for creators and developers." />
        <meta name="twitter:image" content="/og-image.png" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />

        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Quiclab",
              url: "https://quiclab.com",
              description: "Quiclab builds lightweight productivity tools for creators and developers.",
            }),
          }}
        />
      </Head>



      <div className="grain">
        <Navbar />
        <main>
          <Hero />
          <Products />
          <Why />
          <CTA />
        </main>
        <Footer />
      </div>
    </>
  );
}