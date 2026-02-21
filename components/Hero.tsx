export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large primary orb */}
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-primary-100 to-primary-50 opacity-60 blur-3xl" />
        {/* Small accent */}
        <div className="absolute bottom-20 -left-20 w-72 h-72 rounded-full bg-gradient-to-tr from-amber-100 to-transparent opacity-40 blur-2xl" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `radial-gradient(circle, #0f0e0c 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-5 sm:px-8 py-24 grid lg:grid-cols-2 gap-16 items-center">
        {/* Text content */}
        <div>
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full bg-primary-100 border border-primary-200">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
            <span className="text-xs font-medium text-primary-700 tracking-wide uppercase">
              Tools for Makers
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-stone-900 leading-[1.05] mb-6">
            Build faster.{" "}
            <span className="italic text-primary-500">Create</span>{" "}
            better.
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-stone-500 leading-relaxed mb-10 max-w-lg">
            Quiclab builds lightweight productivity tools designed for creators
            and developers who refuse to waste time on repetitive work.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="#products"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-stone-900 text-white font-medium hover:bg-primary-500 transition-all duration-200 shadow-md hover:shadow-primary-200 hover:-translate-y-0.5"
            >
              Explore Tools
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8H13M8.5 3.5L13 8L8.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a
              href="#why"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border border-stone-200 text-stone-700 font-medium hover:border-stone-400 hover:bg-stone-50 transition-all duration-200"
            >
              Why Quiclab
            </a>
          </div>

          {/* Social proof */}
          <div className="mt-10 flex items-center gap-4 text-sm text-stone-400">
            <div className="flex -space-x-2">
              {["#f97316", "#16a34a", "#7c3aed", "#0284c7"].map((color, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full border-2 border-[#fefdf9] flex items-center justify-center text-white text-[10px] font-bold"
                  style={{ backgroundColor: color }}
                >
                  {["A", "B", "C", "D"][i]}
                </div>
              ))}
            </div>
            <span>
              <strong className="text-stone-700">4,000+</strong> downloads across all tools
            </span>
          </div>
        </div>

        {/* Illustration / Visual */}
        <div className="relative flex items-center justify-center">
          <div className="relative w-full max-w-md mx-auto animate-[float_6s_ease-in-out_infinite]">
            {/* Main card illustration */}
            <div className="relative bg-white rounded-3xl shadow-2xl shadow-stone-200 p-8 border border-stone-100">
              {/* Mock UI header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="w-24 h-2 rounded-full bg-stone-100" />
              </div>

              {/* Mock content rows */}
              {[
                { w: "w-full", color: "bg-primary-100", accent: true },
                { w: "w-4/5", color: "bg-stone-100", accent: false },
                { w: "w-3/4", color: "bg-stone-100", accent: false },
                { w: "w-5/6", color: "bg-stone-100", accent: false },
              ].map((row, i) => (
                <div key={i} className="flex items-center gap-3 mb-3">
                  <div
                    className={`h-2.5 rounded-full ${row.w} ${row.color} ${row.accent ? "opacity-100" : "opacity-60"}`}
                  />
                  {row.accent && (
                    <div className="shrink-0 px-2 py-0.5 rounded-full bg-primary-500 text-white text-[9px] font-bold">
                      AUTO
                    </div>
                  )}
                </div>
              ))}

              {/* Mock button */}
              <div className="mt-6 h-9 rounded-xl bg-primary-500 flex items-center justify-center">
                <div className="w-20 h-2 rounded-full bg-white opacity-90" />
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-lg shadow-stone-200 px-4 py-2.5 border border-stone-100">
              <div className="text-[11px] text-stone-400 mb-0.5">Downloads</div>
              <div className="text-lg font-display text-stone-900">4,000<span className="text-primary-500">+</span></div>
            </div>

            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg shadow-stone-200 px-4 py-2.5 border border-stone-100">
              <div className="text-[11px] text-stone-400 mb-0.5">Products</div>
              <div className="text-lg font-display text-stone-900">3 Tools</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
