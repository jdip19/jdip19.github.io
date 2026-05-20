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
    router.push("/himalayan-power");
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

      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '991674240162982');
            fbq('track', 'PageView');`,
        }}
      />

      <noscript>
        <img height="1" width="1" style={{ display: "none" }} src="https://www.facebook.com/tr?id=991674240162982&ev=PageView&noscript=1" alt="facebook pixel" />
      </noscript>

      <div className="grain">
        <Navbar />
        <main>
          <Hero />
          <Products />
          <Why />
          <CTA />
          <div className="mx-auto max-w-7xl px-6 py-8 text-center">
            <Link
              href="/#"
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              onClick={handleLeadClick}
            >
              View the Himalayan Shilajit
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}