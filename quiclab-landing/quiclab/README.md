# Quiclab — Landing Page

A modern, production-ready Next.js landing page for the Quiclab brand.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Google Fonts** (Instrument Serif + DM Sans)

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Deploy on Vercel

1. Push to GitHub
2. Import repo at [vercel.com/new](https://vercel.com/new)
3. Click **Deploy** — zero config needed

## Adding New Products

Open `components/data.ts` and add a new entry to the `products` array:

```ts
{
  id: "newproduct",
  name: "NewProduct",
  tagline: "Short tagline",
  description: "Product description here.",
  badge: "Free", // "Free" | "Freemium" | "Pro"
  downloads: "500+",
  ctaLabel: "Try NewProduct",
  ctaHref: "https://yourlink.com",
  iconColor: "#0284c7",   // any hex color
  accentBg: "bg-sky-50",  // Tailwind bg class
  icon: "text",           // "text" | "image" | "data"
}
```

That's it — the homepage grid updates automatically.

## Project Structure

```
quiclab/
├── app/
│   ├── layout.tsx      # Root layout + metadata + JSON-LD
│   ├── page.tsx        # Homepage
│   ├── globals.css     # Global styles + fonts
│   └── sitemap.ts      # Auto-generated sitemap
├── components/
│   ├── data.ts         # Products & content data
│   ├── Navbar.tsx
│   ├── Hero.tsx
│   ├── Products.tsx
│   ├── ProductCard.tsx
│   ├── Why.tsx
│   ├── CTA.tsx
│   └── Footer.tsx
├── public/
│   ├── favicon.svg
│   └── robots.txt
└── next.config.js
```

## SEO Features

- ✅ Next.js Metadata API (title, description, keywords)
- ✅ OpenGraph tags
- ✅ Twitter Card tags
- ✅ JSON-LD Organization schema
- ✅ Semantic HTML (`<header>`, `<main>`, `<section>`, `<article>`, `<footer>`)
- ✅ `robots.txt`
- ✅ `sitemap.ts` (auto-generated)
- ✅ Canonical URL
- ✅ `aria-label` on interactive elements

## Customization

- **Brand color**: search `primary-500` / `#f97316` in the codebase to change the accent
- **Base URL**: update `BASE_URL` in `app/layout.tsx` and `app/sitemap.ts`
- **Social handles**: update Twitter/GitHub links in `Footer.tsx` and `layout.tsx`
- **OG image**: add `/public/og-image.png` (1200×630px)
