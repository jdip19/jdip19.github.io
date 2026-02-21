export default function CTA() {
  return (
    <section className="py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary-500 to-primary-600 p-12 sm:p-16 text-center">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-white opacity-5 blur-2xl" />
            <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-primary-400 opacity-30 blur-2xl" />
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
                backgroundSize: "32px 32px",
              }}
            />
          </div>

          <div className="relative">
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white mb-6 leading-tight">
              Ready to move{" "}
              <em className="not-italic">quicker?</em>
            </h2>
            <p className="text-primary-100 text-lg sm:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
              Join thousands of creators and developers already using Quiclab
              tools to eliminate repetitive work and ship faster.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="#products"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white text-primary-600 font-semibold text-base hover:bg-primary-50 transition-all duration-200 shadow-lg hover:-translate-y-0.5"
              >
                Explore All Tools
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8H13M8.5 3.5L13 8L8.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <a
                href="#why"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border-2 border-white/40 text-white font-semibold text-base hover:bg-white/10 transition-all duration-200"
              >
                Learn More
              </a>
            </div>

            {/* Stats row */}
            <div className="mt-14 pt-10 border-t border-white/20 grid grid-cols-3 gap-8 max-w-lg mx-auto">
              {[
                { label: "Total Downloads", value: "4,000+" },
                { label: "Products", value: "3 Tools" },
                { label: "Cost to Start", value: "$0" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="font-display text-3xl text-white mb-1">{stat.value}</div>
                  <div className="text-primary-200 text-xs tracking-wide">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
