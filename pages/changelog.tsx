import Head from "next/head";
import { useRouter } from "next/router";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CHANGELOGS, getAllProducts } from "@/data/changelog";
import Link from "next/link";

export default function Changelog() {
  const router = useRouter();
  const { product } = router.query;
  const productSlug = Array.isArray(product) ? product[0] : product;
  const allProducts = getAllProducts();

  // If product param is provided, show single product view
  if (productSlug) {
    const currentProduct = CHANGELOGS[productSlug];

    if (!currentProduct) {
      return (
        <>
          <Head>
            <title>Changelog — Quiclab</title>
          </Head>
          <div className="grain">
            <Navbar />
            <main style={{ padding: "2rem 1rem", maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
              <h1>Product not found</h1>
              <p>The product you're looking for doesn't exist.</p>
              <Link href="/changelog">
                <a style={{ color: "#007bff", textDecoration: "none" }}>View all products</a>
              </Link>
            </main>
            <Footer />
          </div>
        </>
      );
    }

    return (
      <>
        <Head>
          <title>Changelog — {currentProduct.name} | Quiclab</title>
          <meta name="description" content={`${currentProduct.name} changelog. See what's new, improvements, and bug fixes in each release.`} />
        </Head>

        <div className="grain">
          <Navbar />
          <main style={{ padding: "2rem 1rem", maxWidth: "900px", margin: "0 auto" }}>
            <Link href="/changelog">
              <a style={{ color: "#007bff", textDecoration: "none", fontSize: "0.9rem" }}>← Back to all products</a>
            </Link>
            <h1 style={{ marginBottom: "0.5rem", marginTop: "1rem" }}>{currentProduct.name} Changelog</h1>
            <p style={{ color: "#666", marginBottom: "2rem" }}>{currentProduct.description}</p>

            {/* Changelog Entries */}
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              {currentProduct.changelog.length === 0 ? (
                <p style={{ color: "#999", textAlign: "center", padding: "2rem" }}>No changelog entries yet.</p>
              ) : (
                currentProduct.changelog.map((entry) => (
                  <ChangelogEntry key={entry.version} entry={entry} />
                ))
              )}
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  // If no product param, show all products with tabs
  return (
    <>
      <Head>
        <title>Changelog — Quiclab</title>
        <meta name="description" content="Changelog for all Quiclab products. See what's new, improvements, and bug fixes in each release." />
      </Head>

      <div className="grain">
        <Navbar />
        <main style={{ padding: "2rem 1rem", maxWidth: "900px", margin: "0 auto" }}>
          <h1 style={{ marginBottom: "0.5rem" }}>Changelog</h1>
          <p style={{ color: "#666", marginBottom: "2rem" }}>
            See what's new, improvements, and bug fixes in all Quiclab products.
          </p>

          {/* Product Tabs */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", flexWrap: "wrap", borderBottom: "1px solid #eee", paddingBottom: "1rem" }}>
            {allProducts.map((prod) => (
              <Link key={prod.slug} href={`/changelog?product=${prod.slug}`}>
                <a style={{
                  padding: "0.5rem 1rem",
                  color: "#666",
                  textDecoration: "none",
                  cursor: "pointer",
                  fontWeight: "400",
                  transition: "all 0.2s",
                  borderBottom: "2px solid transparent",
                  hover: {
                    borderBottom: "2px solid #007bff",
                    color: "#007bff",
                  }
                }}>
                  {prod.name}
                </a>
              </Link>
            ))}
          </div>

          {/* All Products Changelog */}
          <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
            {allProducts.map((prod) => {
              const productData = CHANGELOGS[prod.slug];
              return (
                <div key={prod.slug}>
                  <h2 style={{ fontSize: "1.3rem", marginBottom: "1rem", paddingBottom: "0.5rem", borderBottom: "2px solid #007bff" }}>
                    {prod.name}
                  </h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    {productData.changelog.slice(0, 2).map((entry) => (
                      <ChangelogEntry key={`${prod.slug}-${entry.version}`} entry={entry} />
                    ))}
                    {productData.changelog.length > 2 && (
                      <Link href={`/changelog?product=${prod.slug}`}>
                        <a style={{ color: "#007bff", textDecoration: "none", fontWeight: "500" }}>
                          View all {prod.name} versions →
                        </a>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}

// Reusable changelog entry component
function ChangelogEntry({ entry }: { entry: any }) {
  return (
    <section
      style={{
        borderLeft: "3px solid #007bff",
        paddingLeft: "1.5rem",
        paddingBottom: "1.5rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: "1rem", marginBottom: "0.5rem" }}>
        <h3 style={{ margin: 0, fontSize: "1.2rem" }}>v{entry.version}</h3>
        <span style={{ color: "#999", fontSize: "0.9rem" }}>{entry.releaseDate}</span>
      </div>

      {entry.features.length > 0 && (
        <div style={{ marginBottom: "1rem" }}>
          <h4 style={{ margin: "0.5rem 0", color: "#007bff", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            ✨ Features
          </h4>
          <ul style={{ margin: "0.5rem 0 0 1.5rem", paddingLeft: 0 }}>
            {entry.features.map((feature: string, idx: number) => (
              <li key={idx} style={{ marginBottom: "0.3rem", color: "#333" }}>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}

      {entry.improvements && entry.improvements.length > 0 && (
        <div style={{ marginBottom: "1rem" }}>
          <h4 style={{ margin: "0.5rem 0", color: "#28a745", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            📈 Improvements
          </h4>
          <ul style={{ margin: "0.5rem 0 0 1.5rem", paddingLeft: 0 }}>
            {entry.improvements.map((improvement: string, idx: number) => (
              <li key={idx} style={{ marginBottom: "0.3rem", color: "#333" }}>
                {improvement}
              </li>
            ))}
          </ul>
        </div>
      )}

      {entry.fixes && entry.fixes.length > 0 && (
        <div>
          <h4 style={{ margin: "0.5rem 0", color: "#dc3545", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            🐛 Bug Fixes
          </h4>
          <ul style={{ margin: "0.5rem 0 0 1.5rem", paddingLeft: 0 }}>
            {entry.fixes.map((fix: string, idx: number) => (
              <li key={idx} style={{ marginBottom: "0.3rem", color: "#333" }}>
                {fix}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
