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
  ctaExternal?: boolean;
  ctaDownload?: boolean;
  iconColor: string;
  accentBg: string;
  iconSrc: string;
}

export const products: Product[] = [
  {
    id: "quictext",
    name: "QuicText",
    tagline: "Text Automation for Figma",
    description:
      "Transform text in Figma while preserving styles. Quickly change letter case, replace placeholder copy, and format text across your designs.",
    badge: "Freemium",
    downloads: "2,300+",
    ctaLabel: "Install on Figma",
    ctaHref: "https://www.figma.com/community/plugin/1365014672422582628/QuicText",
    ctaExternal: true,
    iconColor: "#f97316",
    accentBg: "bg-primary-50",
    iconSrc: "/tool-icons/quictext.png",
  },
  {
    id: "i2snatcher",
    name: "I2Snatcher",
    tagline: "Browser Extension for Icons & Images",
    description:
      "Copy or download SVG icons from Flaticon, map icon colors in the side panel, and download images from the active browser tab.",
    badge: "Free",
    downloads: "1,100+",
    ctaLabel: "Download for Chrome",
    ctaHref: "/downloads/i2Snatcher.zip",
    ctaDownload: true,
    iconColor: "#16a34a",
    accentBg: "bg-green-50",
    iconSrc: "/tool-icons/i2snatcher.png",
  },
  {
    id: "quicdata",
    name: "QuicData",
    tagline: "Google Sheets Sync for Figma",
    description:
      "Sync layer names and text content from Google Sheets to Figma. Update design content in bulk without editing each layer manually.",
    badge: "Freemium",
    downloads: "650+",
    ctaLabel: "Install on Figma",
    ctaHref: "https://www.figma.com/community/plugin/1507446170926529938/quickdata",
    ctaExternal: true,
    iconColor: "#7c3aed",
    accentBg: "bg-violet-50",
    iconSrc: "/tool-icons/quicdata.png",
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
