import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Head from "next/head"
import Footer from "@/components/Footer"
import Navbar from "@/components/Navbar"

export default function PaymentResult() {
  const router = useRouter()
  const [status, setStatus] = useState<"success" | "failed" | "unknown">("unknown")

  useEffect(() => {
    if (!router.isReady) return

    const s =
      router.query.status ||
      router.query.payment_status ||
      router.query.state

    if (s === "succeeded" || s === "paid" || s === "success") {
      setStatus("success")
    } else if (s === "failed" || s === "cancelled") {
      setStatus("failed")
    } else {
      setStatus("unknown")
    }
  }, [router.isReady])

  return (
    <>
      <Head>
        <title>
          {status === "success"
            ? "Payment Successful — Quiclab"
            : status === "failed"
            ? "Payment Failed — Quiclab"
            : "Processing Payment — Quiclab"}
        </title>
      </Head>

      <div className="grain min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-1 flex items-center justify-center px-5 py-24">
          {status === "success" && <SuccessCard />}
          {status === "failed" && <FailedCard />}
          {status === "unknown" && <ProcessingCard />}
        </main>

        <Footer />
      </div>
    </>
  )
}

function SuccessCard() {
  return (
    <div className="w-full max-w-md">
      {/* Background orb */}
      <div className="relative">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-primary-100 opacity-60 blur-3xl pointer-events-none" />

        <div className="relative bg-white rounded-3xl border border-stone-200 shadow-xl shadow-stone-100 p-10 text-center">
          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-primary-50 border-2 border-primary-200 flex items-center justify-center mx-auto mb-6">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path
                d="M8 18L14.5 24.5L28 11"
                stroke="#f97316"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-primary-100 border border-primary-200">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
            <span className="text-xs font-medium text-primary-700 tracking-wide uppercase">
              Payment Successful
            </span>
          </div>

          <h1 className="font-display text-3xl text-stone-900 mb-3">
            You&apos;re all set!
          </h1>
          <p className="text-stone-500 leading-relaxed mb-2">
            Your license key has been sent to your email.
          </p>
          <p className="text-stone-500 leading-relaxed mb-8">
            You can now return to the <strong className="text-stone-700">QuicText</strong> plugin and activate it.
          </p>

          {/* Divider */}
          <div className="border-t border-stone-100 mb-8" />

          {/* Info box */}
          <div className="bg-stone-50 rounded-2xl p-4 mb-8 text-left">
            <p className="text-xs text-stone-400 uppercase tracking-wide font-medium mb-2">What happens next</p>
            <ul className="space-y-2">
              {[
                "Check your inbox for the license key email",
                "Open QuicText in Figma",
                "Enter your key to unlock all features",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-stone-600">
                  <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-600 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ul>
          </div>

          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-full bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors duration-150 shadow-sm"
          >
            Back to Quiclab
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2.5 7H11.5M7.5 3L11.5 7L7.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  )
}

function FailedCard() {
  return (
    <div className="w-full max-w-md">
      <div className="relative">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-red-50 opacity-60 blur-3xl pointer-events-none" />

        <div className="relative bg-white rounded-3xl border border-stone-200 shadow-xl shadow-stone-100 p-10 text-center">
          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center mx-auto mb-6">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path
                d="M11 11L25 25M25 11L11 25"
                stroke="#ef4444"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-red-50 border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span className="text-xs font-medium text-red-600 tracking-wide uppercase">
              Payment Not Completed
            </span>
          </div>

          <h1 className="font-display text-3xl text-stone-900 mb-3">
            Something went wrong
          </h1>
          <p className="text-stone-500 leading-relaxed mb-2">
            No charges were made to your account.
          </p>
          <p className="text-stone-500 leading-relaxed mb-8">
            You can safely retry the payment from the <strong className="text-stone-700">QuicText</strong> plugin.
          </p>

          <div className="border-t border-stone-100 mb-8" />

          <div className="bg-stone-50 rounded-2xl p-4 mb-8 text-left">
            <p className="text-xs text-stone-400 uppercase tracking-wide font-medium mb-2">Common reasons</p>
            <ul className="space-y-2">
              {[
                "Card declined by your bank",
                "Incorrect card details entered",
                "Payment session expired",
              ].map((reason, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-stone-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-300 shrink-0 mt-2" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-full bg-stone-900 text-white font-medium hover:bg-primary-500 transition-colors duration-150 shadow-sm"
            >
              Return to Quiclab
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2.5 7H11.5M7.5 3L11.5 7L7.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProcessingCard() {
  return (
    <div className="w-full max-w-md">
      <div className="relative">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-primary-50 opacity-50 blur-3xl pointer-events-none" />

        <div className="relative bg-white rounded-3xl border border-stone-200 shadow-xl shadow-stone-100 p-10 text-center">
          {/* Spinner */}
          <div className="w-20 h-20 rounded-full bg-primary-50 border-2 border-primary-100 flex items-center justify-center mx-auto mb-6">
            <svg
              className="animate-spin"
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
            >
              <circle cx="16" cy="16" r="12" stroke="#fed7aa" strokeWidth="3" />
              <path
                d="M16 4C16 4 28 4 28 16"
                stroke="#f97316"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-primary-100 border border-primary-200">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
            <span className="text-xs font-medium text-primary-700 tracking-wide uppercase">
              Processing
            </span>
          </div>

          <h1 className="font-display text-3xl text-stone-900 mb-3">
            Processing payment…
          </h1>
          <p className="text-stone-500 leading-relaxed mb-8">
            Please wait while we confirm your payment. If you were charged, your license key will arrive by email shortly.
          </p>

          <div className="border-t border-stone-100 mb-8" />

          <div className="bg-primary-50 rounded-2xl p-4 text-sm text-primary-700 border border-primary-100">
            Do not close this tab. This usually takes just a few seconds.
          </div>
        </div>
      </div>
    </div>
  )
}