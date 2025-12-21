export default function PaymentCancelled() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#fafafa",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 480,
          padding: 32,
          background: "#ffffff",
          borderRadius: 12,
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: 24, marginBottom: 12 }}>
          ❌ Payment Cancelled
        </h1>

        <p style={{ color: "#555", lineHeight: 1.6, marginBottom: 20 }}>
          Your payment was not completed.
          <br />
          No charges were made.
        </p>

        <p style={{ color: "#777", fontSize: 14 }}>
          You can safely close this page and retry the purchase anytime from the
          QuickText plugin.
        </p>
      </div>
    </main>
  )
}
