import { Product, BadgeType } from "./data";

function ProductIcon({ icon, color }: { icon: string; color: string }) {
  if (icon === "text") {
    return (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M4 6H24M4 10H16M4 14H20M4 18H13" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <circle cx="21" cy="18" r="4" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="1.5" />
        <path d="M21 16.5V19.5M19.5 18H22.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (icon === "image") {
    return (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="3" y="5" width="22" height="18" rx="3" stroke={color} strokeWidth="1.5" fill={`${color}18`} />
        <circle cx="9" cy="11" r="2" fill={color} />
        <path d="M3 19L9 13L13 17L17 13L25 21" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (icon === "data") {
    return (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="3" y="5" width="10" height="7" rx="2" stroke={color} strokeWidth="1.5" fill={`${color}18`} />
        <rect x="15" y="5" width="10" height="7" rx="2" stroke={color} strokeWidth="1.5" fill={`${color}18`} />
        <rect x="9" y="16" width="10" height="7" rx="2" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.2" />
        <path d="M8 12L8 16M20 12L20 16M14 16L14 19" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  return null;
}

function Badge({ type }: { type: BadgeType }) {
  const styles: Record<BadgeType, string> = {
    Free: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Freemium: "bg-primary-100 text-primary-700 border-primary-200",
    Pro: "bg-violet-100 text-violet-700 border-violet-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border tracking-wide uppercase ${styles[type]}`}
    >
      {type}
    </span>
  );
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group relative bg-white rounded-3xl border border-stone-200 p-8 hover:border-stone-300 hover:shadow-xl hover:shadow-stone-100 hover:-translate-y-1 transition-all duration-300 flex flex-col">
      {/* Icon */}
      <div
        className={`w-14 h-14 rounded-2xl ${product.accentBg} flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300`}
      >
        <ProductIcon icon={product.icon} color={product.iconColor} />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-2xl text-stone-900">{product.name}</h3>
        <Badge type={product.badge} />
      </div>

      {/* Tagline */}
      <p className="text-sm font-medium text-stone-400 mb-3 tracking-wide">{product.tagline}</p>

      {/* Description */}
      <p className="text-stone-600 leading-relaxed text-[15px] mb-8 flex-1">{product.description}</p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto">
        {/* Downloads */}
        <div className="flex items-center gap-1.5 text-sm text-stone-400">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1V9M7 9L4 6M7 9L10 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 11H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span>
            <strong className="text-stone-600 font-semibold">{product.downloads}</strong> downloads
          </span>
        </div>

        {/* CTA */}
        <a
          href={product.ctaHref}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 shadow-sm"
          style={{ backgroundColor: product.iconColor }}
          aria-label={`${product.ctaLabel} — ${product.name}`}
        >
          {product.ctaLabel}
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M2 6.5H11M7 2.5L11 6.5L7 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>

      {/* Hover accent line */}
      <div
        className="absolute bottom-0 left-8 right-8 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ backgroundColor: product.iconColor }}
      />
    </article>
  );
}
