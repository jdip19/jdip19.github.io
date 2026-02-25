export type BadgeType = "Free" | "Freemium" | "Pro";

export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  badge: BadgeType;
  downloads: string;
  ctaLabel: string;
  ctaHref: string;
  iconColor: string;
  accentBg: string;
  icon: string; // SVG path data or emoji-style identifier
}

export const products: Product[] = [
  {
    id: "quictext",
    name: "QuicText",
    tagline: "Text Automation for Figma",
    description:
      "Supercharge your Figma workflow with powerful text automation and formatting — rename layers, replace dummy text, and apply rules in bulk.",
    badge: "Freemium",
    downloads: "2,300+",
    ctaLabel: "Get QuicText",
    ctaHref: "#",
    iconColor: "#f97316",
    accentBg: "bg-primary-50",
    icon: "text",
  },
  {
    id: "i2snatcher",
    name: "I2Snatcher",
    tagline: "Fast WebP Image Converter",
    description:
      "Convert images to WebP in seconds. Drag, drop, and download — no fuss, no accounts, no waiting. Built for designers and developers who value their time.",
    badge: "Free",
    downloads: "1,100+",
    ctaLabel: "Try I2Snatcher",
    ctaHref: "#",
    iconColor: "#16a34a",
    accentBg: "bg-green-50",
    icon: "image",
  },
  {
    id: "quicdata",
    name: "QuicData",
    tagline: "Data Transformation & Automation",
    description:
      "Transform, clean, and automate your data pipelines without heavy tooling. Lightweight yet powerful enough for real-world workflows.",
    badge: "Freemium",
    downloads: "650+",
    ctaLabel: "Explore QuicData",
    ctaHref: "#",
    iconColor: "#7c3aed",
    accentBg: "bg-violet-50",
    icon: "data",
  },
];

export const whyPoints = [
  {
    id: "lightweight",
    icon: "bolt",
    title: "Built Lean, Ships Fast",
    description:
      "Every Quiclab tool is purpose-built to do one thing exceptionally well. No bloat, no steep learning curves — just results.",
  },
  {
    id: "creators",
    icon: "sparkle",
    title: "Made for Makers",
    description:
      "Whether you design in Figma, code for the web, or wrangle data — our tools slot into your existing workflow without disruption.",
  },
  {
    id: "open",
    icon: "heart",
    title: "Free First, Always",
    description:
      "Our core features are free forever. We believe great tools shouldn't be locked behind paywalls. Upgrade only if you want more.",
  },
];
