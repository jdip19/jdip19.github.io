import { products } from "./data";
import ProductCard from "./ProductCard";

export default function Products() {
  return (
    <section id="products" className="py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        {/* Section header */}
        <div className="max-w-2xl mb-16">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-stone-100 border border-stone-200">
            <span className="text-xs font-medium text-stone-500 tracking-wide uppercase">
              Our Products
            </span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl text-stone-900 mb-4 leading-tight">
            Tools you&apos;ll actually{" "}
            <em className="text-orange-500 not-italic">use</em>
          </h2>
          <p className="text-stone-500 text-lg leading-relaxed">
            No subscription bundles. No feature bloat. Each tool is built for
            one job — and does it exceptionally well.
          </p>
        </div>

        {/* Products grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
