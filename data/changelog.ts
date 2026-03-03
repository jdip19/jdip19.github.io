// Version changelog data - organized by product
export interface VersionEntry {
  version: string;
  releaseDate: string;
  features: string[];
  fixes?: string[];
  improvements?: string[];
}

export interface ProductChangelog {
  name: string;
  slug: string;
  description: string;
  changelog: VersionEntry[];
}

export const CHANGELOGS: Record<string, ProductChangelog> = {
  quicktext: {
    name: "QuicText",
    slug: "quicktext",
    description: "Advanced text transformation and manipulation for Figma",
    changelog: [
      {
        version: "9.0.0",
        releaseDate: "March 3, 2026",
        features: [
          "New usage tracking system with Supabase integration",
          "Monetization support with license activation",
          "Device ID-based license management",
          "Real-time usage sync with backend",
        ],
        improvements: [
          "Optimized plugin performance",
          "Improved UI/UX for account management",
          "Better error handling and user notifications",
        ],
        fixes: [
          "Fixed postMessage error when UI is not open",
          "Fixed font loading issues for some text nodes",
        ],
      },
      {
        version: "8.5.0",
        releaseDate: "February 15, 2026",
        features: [
          "Date formatting options (dd-mm-yyyy, mm-dd-yyyy, yyyy-mm-dd)",
          "Prefix, between, and suffix text insertion",
        ],
        improvements: [
          "Better handling of mixed text styles",
          "Improved slug generation algorithm",
        ],
      },
      {
        version: "8.0.0",
        releaseDate: "January 10, 2026",
        features: [
          "Text case transformations (Title Case, Sentence Case, Upper/Lower)",
          "Line break insertion after full stops",
          "Symbol and punctuation removal",
          "Slug generation",
          "Text splitting into layers (by lines, words, letters)",
        ],
        improvements: [
          "Full TypeScript rewrite",
          "Better plugin architecture",
        ],
      },
    ],
  },
  i2snatcher: {
    name: "I2Snatcher",
    slug: "i2snatcher",
    description: "Image extraction and batch download tool",
    changelog: [
      {
        version: "3.2.0",
        releaseDate: "March 1, 2026",
        features: [
          "Batch image download with metadata",
          "Advanced filtering options",
        ],
        improvements: [
          "Faster image detection",
          "Better memory management for large batches",
        ],
        fixes: [
          "Fixed SSL certificate verification issues",
        ],
      },
      {
        version: "3.0.0",
        releaseDate: "January 5, 2026",
        features: [
          "Complete rewrite with modern architecture",
          "Support for more image formats",
        ],
      },
    ],
  },
  quickdata: {
    name: "QuicData",
    slug: "quickdata",
    description: "Data transformation and conversion tool",
    changelog: [
      {
        version: "2.1.0",
        releaseDate: "February 20, 2026",
        features: [
          "CSV to JSON conversion",
          "JSON to CSV export",
        ],
        improvements: [
          "Faster data processing",
          "Better Unicode handling",
        ],
      },
    ],
  },
};

// Helper function to get all products
export function getAllProducts() {
  return Object.values(CHANGELOGS).map(({ name, slug, description }) => ({
    name,
    slug,
    description,
  }));
}

// Legacy export for backward compatibility
export const CHANGELOG = CHANGELOGS.quicktext.changelog;
