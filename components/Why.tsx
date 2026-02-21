import { whyPoints } from "./data";

function Icon({ type }: { type: string }) {
  if (type === "bolt") {
    return (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M13 2L4 13H11L9 20L18 9H11L13 2Z" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="#f9731620" />
      </svg>
    );
  }
  if (type === "sparkle") {
    return (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 2V6M11 16V20M2 11H6M16 11H20M4.93 4.93L7.76 7.76M14.24 14.24L17.07 17.07M17.07 4.93L14.24 7.76M7.76 14.24L4.93 17.07" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="11" cy="11" r="3" fill="#f9731620" stroke="#f97316" strokeWidth="1.5" />
      </svg>
    );
  }
  if (type === "heart") {
    return (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 19C11 19 3 14 3 8C3 5.8 4.8 4 7 4C8.5 4 9.8 4.8 10.5 6L11 7L11.5 6C12.2 4.8 13.5 4 15 4C17.2 4 19 5.8 19 8C19 14 11 19 11 19Z" stroke="#f97316" strokeWidth="1.5" strokeLinejoin="round" fill="#f9731620" />
      </svg>
    );
  }
  return null;
}

export default function Why() {
  return (
    <section id="why" className="py-24 sm:py-32 bg-stone-900">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-stone-800 border border-stone-700">
            <span className="text-xs font-medium text-stone-400 tracking-wide uppercase">
              Why Quiclab
            </span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl text-white mb-4 leading-tight">
            Opinionated by{" "}
            <em className="text-primary-400 not-italic">design</em>
          </h2>
          <p className="text-stone-400 text-lg leading-relaxed">
            We build tools the way we&apos;d want to use them ourselves — fast,
            focused, and free to start.
          </p>
        </div>

        {/* Value points */}
        <div className="grid md:grid-cols-3 gap-8">
          {whyPoints.map((point, i) => (
            <div
              key={point.id}
              className="relative bg-stone-800 rounded-3xl p-8 border border-stone-700 hover:border-primary-500/40 hover:bg-stone-800/80 transition-all duration-300 group"
            >
              {/* Number */}
              <div className="absolute top-8 right-8 font-display text-5xl text-stone-700 group-hover:text-stone-600 transition-colors duration-300 select-none">
                0{i + 1}
              </div>

              {/* Icon */}
              <div className="w-11 h-11 rounded-xl bg-stone-700 flex items-center justify-center mb-6 group-hover:bg-primary-500/20 transition-colors duration-300">
                <Icon type={point.icon} />
              </div>

              <h3 className="font-display text-xl text-white mb-3">{point.title}</h3>
              <p className="text-stone-400 leading-relaxed text-[15px]">{point.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
