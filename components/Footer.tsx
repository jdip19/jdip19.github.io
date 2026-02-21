import Link from "next/link";

const footerLinks = {
  Products: [
    { label: "QuicText", href: "#" },
    { label: "I2Snatcher", href: "#" },
    { label: "QuicData", href: "#" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Changelog", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-[#fefdf9]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4 w-fit">
              <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M3 9L7.5 4.5L12 9L7.5 13.5L3 9Z" fill="white" fillOpacity="0.9" />
                  <path d="M9 5L13.5 9L9 13" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="font-display text-xl text-stone-900">Quiclab</span>
            </Link>
            <p className="text-stone-500 text-sm leading-relaxed max-w-[220px]">
              Lightweight productivity tools for creators and developers.
            </p>
            {/* Social links */}
            <div className="flex gap-3 mt-6">
              {[
                {
                  label: "Twitter / X",
                  href: "https://twitter.com/quiclab",
                  path: "M4 4L10 10M10 4L4 10",
                  viewBox: "0 0 14 14",
                },
                {
                  label: "GitHub",
                  href: "https://github.com/quiclab",
                  path: "M7 2C4.24 2 2 4.24 2 7C2 9.2 3.4 11.07 5.37 11.73C5.62 11.78 5.71 11.63 5.71 11.49C5.71 11.36 5.71 10.98 5.71 10.49C4.34 10.79 4.05 9.85 4.05 9.85C3.82 9.27 3.49 9.12 3.49 9.12C3.03 8.81 3.52 8.82 3.52 8.82C4.02 8.85 4.29 9.33 4.29 9.33C4.74 10.1 5.44 9.87 5.73 9.73C5.78 9.41 5.91 9.18 6.05 9.06C4.95 8.93 3.79 8.51 3.79 6.63C3.79 6.08 3.99 5.63 4.3 5.28C4.25 5.15 4.07 4.64 4.35 3.94C4.35 3.94 4.77 3.8 5.71 4.46C6.1 4.35 6.55 4.3 7 4.3C7.45 4.3 7.9 4.35 8.29 4.46C9.23 3.8 9.65 3.94 9.65 3.94C9.93 4.64 9.75 5.15 9.7 5.28C10.01 5.63 10.21 6.08 10.21 6.63C10.21 8.52 9.04 8.93 7.94 9.06C8.11 9.21 8.27 9.52 8.27 9.99C8.27 10.68 8.27 11.24 8.27 11.49C8.27 11.63 8.36 11.78 8.62 11.73C10.59 11.07 12 9.2 12 7C12 4.24 9.76 2 7 2Z",
                  viewBox: "0 0 14 14",
                },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg border border-stone-200 flex items-center justify-center text-stone-400 hover:text-stone-700 hover:border-stone-400 transition-all duration-150"
                >
                  <svg width="14" height="14" viewBox={s.viewBox} fill="none">
                    <path d={s.path} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-5">
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-stone-600 hover:text-stone-900 transition-colors duration-150"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-stone-400">
          <p>© {new Date().getFullYear()} Quiclab. All rights reserved.</p>
          <p>Built with ♥ for makers everywhere.</p>
        </div>
      </div>
    </footer>
  );
}
