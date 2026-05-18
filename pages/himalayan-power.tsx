import Head from "next/head";
import Link from "next/link";
import { useState } from "react";

const faqItems = [
  {
    question: "What exactly is in this combo?",
    answer:
      "This special offering includes 10g of Himalayan Shilajit resin and a premium Shilajit capsule bottle, handcrafted for strength, stamina, and daily balance.",
  },
  {
    question: "Is Cash on Delivery available?",
    answer:
      "Yes. COD is available across India for this product, so you can pay only when the package reaches your doorstep.",
  },
  {
    question: "How should I use it?",
    answer:
      "Take one capsule in the morning with warm water, and apply a small pinch of resin as needed. Best taken with a healthy diet for optimum results.",
  },
  {
    question: "How fast will I see results?",
    answer:
      "Most customers notice improved energy, mental clarity, and recovery support within 7–14 days of regular use.",
  },
];

const reviews = [
  {
    name: "Rajesh Patel",
    rating: 5,
    text: "Excellent quality. Felt more energy and calm focus same week.",
  },
  {
    name: "Meera Joshi",
    rating: 5,
    text: "Great packaging and fast delivery. COD option was very convenient.",
  },
  {
    name: "Amit Chauhan",
    rating: 5,
    text: "Premium formula. This combo is worth every rupee.",
  },
];

const features = [
  "Boosts Energy & Stamina",
  "Enhances Mental Clarity",
  "Supports Immunity",
  "100% Pure Himalayan Resin",
];

export default function HimalayanPowerPage() {
  const [activeFaq, setActiveFaq] = useState(0);

  return (
    <>
      <Head>
        <title>Himalayan Shilajit Power Combo</title>
        <meta
          name="description"
          content="Himalayan Shilajit Power Combo landing page with COD availability, product details, FAQs and customer reviews."
        />
      </Head>

      <div className="min-h-screen bg-[#090f22] text-white">
        <header className="border-b border-white/10 bg-[#070b1a]/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Himalayan Shilajit</p>
              <h1 className="text-xl font-semibold text-white">Power Combo</h1>
            </div>
            <Link href="/" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 transition hover:bg-white/10">
              Back to Home
            </Link>
          </div>
        </header>

        <main className="relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top,_rgba(254,205,74,0.16),_transparent_45%)]" />
          <section className="relative mx-auto max-w-7xl px-6 py-10 lg:py-16">
            <div className="grid gap-8 lg:grid-cols-[1.2fr,0.8fr] lg:items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/10 px-4 py-2 text-sm font-medium text-amber-300 ring-1 ring-amber-400/15">
                  All India COD Available
                </div>

                <div className="space-y-4">
                  <p className="text-sm uppercase tracking-[0.35em] text-amber-300">Himalayan Shilajit Power Combo</p>
                  <h2 className="max-w-3xl text-5xl font-display font-semibold tracking-tight text-white sm:text-6xl">
                    Double Strength Ayurvedic Formula for Energy, Immunity and Mental Clarity.
                  </h2>
                  <p className="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                    10g pure resin paired with daily capsules to support a stronger body, sharper mind, and better recovery.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {features.map((feature) => (
                    <div key={feature} className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200 shadow-xl shadow-black/10">
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="rounded-[2rem] border border-white/10 bg-slate-950/40 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.3)] backdrop-blur-xl">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.35em] text-amber-200/90">Combo Price</p>
                      <p className="mt-2 text-4xl font-semibold text-white">Rs. 999</p>
                      <p className="mt-1 text-sm text-slate-400">One-time offer — includes Both Resin + Capsules</p>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <button className="btn-gold inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-[#08101f] shadow-[0_20px_40px_rgba(250,206,56,0.3)] transition hover:brightness-110">
                        Buy Combo Now
                      </button>
                      <button className="rounded-full border border-white/10 px-6 py-3 text-sm text-slate-200 transition hover:bg-white/5">
                        Learn More
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute left-1/2 top-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-gradient-to-br from-amber-400/20 to-transparent blur-3xl" />
                <div className="relative mx-auto max-w-sm overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-950/70 p-6 shadow-[0_50px_120px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                  <div className="overflow-hidden rounded-[2rem] bg-gradient-to-b from-[#0f1220] to-[#05070f] p-4">
                    <img
                      src="/images/sample-1200.jpg"
                      alt="Himalayan Shilajit Bottle"
                      className="h-[420px] w-full rounded-[2rem] object-cover object-top"
                    />
                  </div>
                  <div className="mt-6 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.35em] text-amber-300">Premium Blend</p>
                      <p className="text-2xl font-semibold text-white">Shilajit Capsule + Resin</p>
                    </div>
                    <div className="rounded-3xl bg-white/5 px-4 py-3 text-right text-sm text-slate-200">
                      <p className="font-semibold text-amber-300">Best Seller</p>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">COD Ready</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-6 pb-16">
            <div className="grid gap-6 lg:grid-cols-[1fr,0.9fr] lg:gap-8">
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-xl shadow-black/10">
                <h3 className="text-2xl font-semibold text-white">What’s included</h3>
                <ul className="mt-6 space-y-4 text-slate-300">
                  <li className="flex gap-4 rounded-3xl border border-white/5 bg-[#111827]/70 p-4">
                    <span className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full bg-amber-300/10 text-amber-300">1</span>
                    <div>
                      <p className="font-semibold text-white">10g Pure Himalayan Shilajit Resin</p>
                      <p className="text-sm text-slate-400">Unadulterated, hand-collected resin from high-altitude sources.</p>
                    </div>
                  </li>
                  <li className="flex gap-4 rounded-3xl border border-white/5 bg-[#111827]/70 p-4">
                    <span className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full bg-amber-300/10 text-amber-300">2</span>
                    <div>
                      <p className="font-semibold text-white">60 Shilajit Capsules</p>
                      <p className="text-sm text-slate-400">Daily capsule support for sustained energy and recovery.</p>
                    </div>
                  </li>
                  <li className="flex gap-4 rounded-3xl border border-white/5 bg-[#111827]/70 p-4">
                    <span className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full bg-amber-300/10 text-amber-300">3</span>
                    <div>
                      <p className="font-semibold text-white">COD Delivery Nationwide</p>
                      <p className="text-sm text-slate-400">Pay only when your order arrives at your doorstep.</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="space-y-6">
                <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-xl shadow-black/10">
                  <h3 className="text-2xl font-semibold text-white">Why choose this combo?</h3>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl border border-white/10 bg-[#0f172a]/80 p-5">
                      <p className="font-semibold text-white">Natural energy booster</p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">Promotes long-lasting vitality with a traditional herbal formula.</p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-[#0f172a]/80 p-5">
                      <p className="font-semibold text-white">Supports immunity</p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">Helps strengthen resilience during seasonal changes.</p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-[#0f172a]/80 p-5">
                      <p className="font-semibold text-white">Mental focus</p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">Enhances concentration and clarity without jitters.</p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-[#0f172a]/80 p-5">
                      <p className="font-semibold text-white">Ayurvedic strength</p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">Made with authentic Himalayan resin and herbal blend.</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-xl shadow-black/10">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.35em] text-amber-300">All ratings</p>
                      <h3 className="mt-3 text-3xl font-semibold text-white">4.9 / 5</h3>
                    </div>
                    <div className="rounded-3xl bg-[#06111f]/90 px-5 py-4 text-center text-sm text-slate-300">
                      <p className="text-2xl font-semibold text-white">500+</p>
                      <p>Happy customers</p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    {reviews.map((review) => (
                      <div key={review.name} className="rounded-3xl border border-white/10 bg-[#0f172a]/80 p-5">
                        <div className="mb-3 flex items-center gap-2 text-amber-300">
                          {Array.from({ length: review.rating }).map((_, index) => (
                            <span key={index}>★</span>
                          ))}
                        </div>
                        <p className="text-sm text-slate-300">{review.text}</p>
                        <p className="mt-5 text-sm font-semibold text-white">{review.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-6 pb-20">
            <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-xl shadow-black/10">
                <h3 className="text-2xl font-semibold text-white">Frequently asked questions</h3>
                <div className="mt-6 space-y-4">
                  {faqItems.map((item, index) => (
                    <div key={item.question} className="overflow-hidden rounded-3xl border border-white/10 bg-[#0e172e]/90">
                      <button
                        type="button"
                        onClick={() => setActiveFaq(activeFaq === index ? -1 : index)}
                        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                      >
                        <span className="font-medium text-white">{item.question}</span>
                        <span className="text-2xl text-amber-300">{activeFaq === index ? "–" : "+"}</span>
                      </button>
                      {activeFaq === index ? (
                        <div className="border-t border-white/10 px-6 py-5 text-sm leading-7 text-slate-300">
                          {item.answer}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-8 shadow-xl shadow-black/10">
                <h3 className="text-2xl font-semibold text-white">Order options</h3>
                <div className="mt-6 space-y-4">
                  <div className="rounded-3xl border border-white/10 bg-[#111827]/70 p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-lg font-semibold text-white">1 x Power Combo</p>
                        <p className="text-sm text-slate-400">Resin + Capsules package</p>
                      </div>
                      <span className="text-lg font-semibold text-amber-300">Rs. 999</span>
                    </div>
                    <button className="btn-gold mt-6 w-full rounded-full px-5 py-3 text-sm font-semibold text-[#08101f] transition hover:brightness-110">
                      Buy Combo Now
                    </button>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-[#111827]/70 p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-lg font-semibold text-white">Extra Resin Pack</p>
                        <p className="text-sm text-slate-400">10g pure resin refill</p>
                      </div>
                      <span className="text-lg font-semibold text-slate-200">Rs. 499</span>
                    </div>
                    <button className="mt-6 w-full rounded-full border border-white/10 px-5 py-3 text-sm text-slate-200 transition hover:bg-white/5">
                      Buy Resin
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
