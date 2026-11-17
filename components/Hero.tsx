import { useEffect, useState } from "react";
import { products } from "./data";

const headlines = [
  "Make more.",
  "Repeat less.",
  "Create faster.",
  "Work smarter.",
];

export default function Hero() {
  const [headline, setHeadline] = useState(headlines[0]);
  const [clickPulse, setClickPulse] = useState<{
    x: number;
    y: number;
    id: number;
  } | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let phraseIndex = 0;
    let characterIndex = headlines[0].length;
    let deleting = true;
    let timeoutId: ReturnType<typeof setTimeout>;

    const typeNextCharacter = () => {
      const phrase = headlines[phraseIndex];

      if (deleting) {
        characterIndex -= 1;
        setHeadline(phrase.slice(0, characterIndex));
        if (characterIndex === 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % headlines.length;
          timeoutId = setTimeout(typeNextCharacter, 300);
          return;
        }
      } else {
        characterIndex += 1;
        setHeadline(phrase.slice(0, characterIndex));
        if (characterIndex === phrase.length) {
          deleting = true;
          timeoutId = setTimeout(typeNextCharacter, 1400);
          return;
        }
      }

      timeoutId = setTimeout(typeNextCharacter, deleting ? 45 : 90);
    };

    timeoutId = setTimeout(typeNextCharacter, 1400);
    return () => clearTimeout(timeoutId);
  }, []);

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const pointerX = (event.clientX - bounds.left - bounds.width / 2) * 0.06;
    const pointerY = (event.clientY - bounds.top - bounds.height / 2) * 0.06;
    event.currentTarget.style.setProperty(
      "--pointer-x",
      `${pointerX}px`,
    );
    event.currentTarget.style.setProperty(
      "--pointer-y",
      `${pointerY}px`,
    );
    event.currentTarget.style.setProperty(
      "--pointer-reverse-x",
      `${pointerX * -1.5}px`,
    );
    event.currentTarget.style.setProperty(
      "--pointer-reverse-y",
      `${pointerY * -1.5}px`,
    );
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    setClickPulse((pulse) => ({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
      id: (pulse?.id ?? 0) + 1,
    }));
  };

  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden pt-16"
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large primary orb */}
        <div
          className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-primary-100 to-primary-50 opacity-60 blur-3xl transition-transform duration-300 ease-out"
          style={{ transform: "translate(var(--pointer-x, 0px), var(--pointer-y, 0px))" }}
        />
        {/* Small accent */}
        <div
          className="absolute bottom-20 -left-20 w-72 h-72 rounded-full bg-gradient-to-tr from-amber-100 to-transparent opacity-40 blur-2xl transition-transform duration-500 ease-out"
          style={{ transform: "translate(var(--pointer-reverse-x, 0px), var(--pointer-reverse-y, 0px))" }}
        />
        {clickPulse && (
          <div
            key={clickPulse.id}
            className="absolute w-24 h-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-200/50 animate-ping"
            style={{ left: clickPulse.x, top: clickPulse.y }}
            onAnimationEnd={() => setClickPulse(null)}
          />
        )}
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `radial-gradient(circle, #0f0e0c 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative w-full max-w-6xl mx-auto px-5 sm:px-8 py-24">
        {/* Text content */}
        <div className="mx-auto max-w-3xl text-center">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full bg-primary-100 border border-primary-200">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
            <span className="text-xs font-medium text-primary-700 tracking-wide uppercase">
              Tools for Makers
            </span>
          </div>

          {/* Headline */}
          <h1
            aria-label="Make more. Repeat less."
            className="font-display text-[clamp(2rem,8vw,4.5rem)] text-stone-900 leading-[1.05] mb-6 whitespace-nowrap"
          >
            <span aria-hidden="true">{headline}</span>
            <span
              aria-hidden="true"
              className="ml-1 inline-block h-[0.8em] w-[2px] translate-y-[0.08em] animate-pulse bg-primary-500"
            />
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-stone-500 leading-relaxed mb-10 max-w-lg mx-auto">
            Quiclab builds lightweight productivity tools designed for creators
            and developers who refuse to waste time on repetitive work.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row justify-center gap-3">
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
          <div className="mt-10 flex items-center justify-center gap-4 text-sm text-stone-400">
            <div className="flex -space-x-2">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center"
                >
                  <img
                    src={product.iconSrc}
                    alt={product.name}
                    className="w-full h-full object-contain p-0.5"
                  />
                </div>
              ))}
            </div>
            <span>
              <strong className="text-stone-700">2500+</strong> downloads across all tools
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
