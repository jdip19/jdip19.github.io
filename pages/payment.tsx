import { useRouter } from "next/router"
import { useEffect, useState } from "react"

export default function PaymentResult() {
  const router = useRouter()
  const [status, setStatus] = useState<"success" | "failed" | "unknown">("unknown")


  useEffect(() => {
    if (!router.isReady) return

    const s =
      router.query.status ||
      router.query.payment_status ||
      router.query.state

    if (s === "success" || s === "paid" || s === "succeeded") {
      setStatus("success")
    } else if (s === "failed" || s === "cancelled") {
      setStatus("failed")
    } else {
      setStatus("unknown")
    }
  }, [router.isReady])

  if (status === "success") {
    return (
      <main style={{ padding: 40 }}>
        <h2>🎉 Payment received</h2>
        <p>Your license key has been sent to your email.</p>
        <p>You can now return to the QuickText plugin.</p>
      </main>
    )
  }

  if (status === "failed") {
    return (
      <main style={{ padding: 40 }}>
        <h2>❌ Payment not completed</h2>
        <p>No charges were made.</p>
        <p>You can retry from the plugin.</p>
      </main>
    )
  }

  return (
    <main style={{ padding: 40 }}>
      <h2>Processing payment…</h2>
      <p>If you were charged, your license will arrive by email shortly.</p>
    </main>
  )
}
