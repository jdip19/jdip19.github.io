"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? "bg-[#fefdf9]/90 backdrop-blur-md border-b border-stone-200/60 shadow-sm"
          : "bg-transparent"
        }`}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
        <img src="/quiclab.svg" alt="Quiclab Logo" className="h-8" />

        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-8">
          <a
            href="#products"
            className="text-sm text-stone-500 hover:text-stone-900 transition-colors duration-150"
          >
            Products
          </a>
          <a
            href="#why"
            className="text-sm text-stone-500 hover:text-stone-900 transition-colors duration-150"
          >
            Why Quiclab
          </a>
        </nav>

        {/* CTA */}
        <a
          href="#products"
          className="hidden md:inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full bg-primary-500 text-white hover:bg-primary-600 transition-colors duration-150 shadow-sm"
        >
          Explore Tools
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2.5 7H11.5M7.5 3L11.5 7L7.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    </header>
  );
}
