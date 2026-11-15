import { Product, BadgeType } from "./data";

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
        <img
          src={product.iconSrc}
          alt=""
          aria-hidden="true"
          className="w-12 h-12 object-contain"
        />
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
        {/* <div className="flex items-center gap-1.5 text-sm text-stone-400">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1V9M7 9L4 6M7 9L10 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 11H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span>
            <strong className="text-stone-600 font-semibold">{product.downloads}</strong> downloads
          </span>
        </div> */}

        {/* CTA */}
        <a
          href={product.ctaHref}
          target={product.ctaExternal ? "_blank" : undefined}
          rel={product.ctaExternal ? "noopener noreferrer" : undefined}
          download={product.ctaDownload ? "i2Snatcher.zip" : undefined}
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
