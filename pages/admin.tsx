import Head from "next/head";
import { FormEvent, useCallback, useEffect, useState } from "react";
import styles from "@/styles/Admin.module.css";

const FUNCTION_URL = "https://kmkjuuytbgpozrigspgw.supabase.co/functions/v1/admin-licenses";
const SESSION_KEY = "quicktext-admin-session";

type License = {
  id: string | number;
  serial_key: string | null;
  email: string | null;
  plan: string | null;
  unlimited: boolean;
};

type ApiResponse = {
  error?: string;
  token?: string;
  licenseKey?: string;
  email?: string;
  licenses?: License[];
};

class AdminRequestError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "AdminRequestError";
  }
}

async function request(
  action: string,
  payload: Record<string, string> = {},
  token = "",
): Promise<ApiResponse> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({ action, ...payload }),
  });

  let data: ApiResponse = {};
  try {
    data = (await response.json()) as ApiResponse;
  } catch {
    if (response.ok) throw new Error("The server returned an invalid response.");
  }

  if (!response.ok) {
    throw new AdminRequestError(
      data.error || "The request could not be completed.",
      response.status,
    );
  }
  return data;
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export default function AdminPage() {
  const [initialized, setInitialized] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [sessionToken, setSessionToken] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [licenses, setLicenses] = useState<License[]>([]);
  const [licenseCount, setLicenseCount] = useState("Loading licenses...");
  const [tableStatus, setTableStatus] = useState("");
  const [status, setStatus] = useState("");
  const [statusKind, setStatusKind] = useState<"error" | "success" | "working">("error");
  const [licenseKey, setLicenseKey] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [createBusy, setCreateBusy] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState<string | number | null>(null);

  const showStatus = useCallback((message: string, kind: "error" | "success" | "working" = "error") => {
    setStatus(message);
    setStatusKind(kind);
  }, []);

  const signOut = useCallback(() => {
    setAuthenticated(false);
    setSessionToken("");
    setLicenses([]);
    sessionStorage.removeItem(SESSION_KEY);
  }, []);

  const loadLicenses = useCallback(async (token: string) => {
    setLicenseCount("Loading licenses...");
    setTableStatus("");
    try {
      const data = await request("list-licenses", {}, token);
      if (!Array.isArray(data.licenses)) {
        throw new Error("The server returned an invalid license list.");
      }
      setLicenses(data.licenses);
      const count = data.licenses.length;
      setLicenseCount(`${count} license${count === 1 ? "" : "s"}`);
      if (count === 0) setTableStatus("No QuickText licenses found.");
    } catch (error) {
      setLicenseCount("Could not load licenses");
      setTableStatus(getErrorMessage(error, "License list request failed."));
      if (error instanceof AdminRequestError && error.status === 401) signOut();
    }
  }, [signOut]);

  useEffect(() => {
    let cancelled = false;
    const savedToken = sessionStorage.getItem(SESSION_KEY) || "";

    if (!savedToken) {
      setInitialized(true);
      return () => {
        cancelled = true;
      };
    }

    setSessionToken(savedToken);
    request("session", {}, savedToken)
      .then(() => {
        if (cancelled) return;
        setAuthenticated(true);
        return loadLicenses(savedToken);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        sessionStorage.removeItem(SESSION_KEY);
        setSessionToken("");
        showStatus(getErrorMessage(error, "Could not verify the saved session."));
      })
      .finally(() => {
        if (!cancelled) setInitialized(true);
      });

    return () => {
      cancelled = true;
    };
  }, [loadLicenses, showStatus]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginBusy(true);
    showStatus("Signing in...", "working");
    try {
      const data = await request("login", { password });
      if (!data.token) throw new Error("The server did not return a session token.");
      sessionStorage.setItem(SESSION_KEY, data.token);
      setSessionToken(data.token);
      setPassword("");
      setAuthenticated(true);
      showStatus("", "success");
      await loadLicenses(data.token);
    } catch (error) {
      showStatus(getErrorMessage(error, "Sign-in failed."));
    } finally {
      setLoginBusy(false);
    }
  }

  async function handleCreateLicense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreateBusy(true);
    setLicenseKey("");
    showStatus("Creating license...", "working");
    try {
      const data = await request("create-license", { email }, sessionToken);
      if (!data.licenseKey) throw new Error("The server did not return a license key.");
      setLicenseKey(data.licenseKey);
      setEmail("");
      showStatus(`License created for ${data.email || email}.`, "success");
      await loadLicenses(sessionToken);
    } catch (error) {
      if (error instanceof AdminRequestError && error.status === 401) signOut();
      showStatus(getErrorMessage(error, "License creation failed."));
    } finally {
      setCreateBusy(false);
    }
  }

  async function handleDeleteLicense(license: License) {
    const key = license.serial_key || "this license";
    if (!window.confirm(`Delete license ${key}? This cannot be undone.`)) return;

    setDeleteBusy(license.id);
    showStatus("Deleting license...", "working");
    try {
      await request("delete-license", { id: String(license.id) }, sessionToken);
      showStatus("License deleted.", "success");
      await loadLicenses(sessionToken);
    } catch (error) {
      if (error instanceof AdminRequestError && error.status === 401) signOut();
      showStatus(getErrorMessage(error, "License deletion failed."));
    } finally {
      setDeleteBusy(null);
    }
  }

  async function handleCopyKey() {
    try {
      await navigator.clipboard.writeText(licenseKey);
      showStatus("License key copied.", "success");
    } catch {
      showStatus("Copy failed. Select and copy the key manually.");
    }
  }

  return (
    <>
      <Head>
        <title>QuickText License Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className={styles.page}>
        <main className={styles.panel}>
          <p className={styles.eyebrow}>QuickText</p>

          {!initialized ? (
            <p className={styles.intro}>Checking saved session...</p>
          ) : !authenticated ? (
            <section>
              <h1>License admin</h1>
              <p className={styles.intro}>Sign in to issue a Pro license key.</p>
              <form onSubmit={handleLogin}>
                <label htmlFor="admin-password">Admin password</label>
                <input
                  id="admin-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button type="submit" disabled={loginBusy}>
                  {loginBusy ? "Signing in..." : "Sign in"}
                </button>
              </form>
            </section>
          ) : (
            <>
              <div className={`${styles.topline} ${styles.adminTopline}`}>
                <div>
                  <h1>QuickText licenses</h1>
                  <p className={styles.intro}>View, create, and remove Pro license keys.</p>
                </div>
                <button
                  className={styles.secondary}
                  type="button"
                  onClick={() => {
                    signOut();
                    showStatus("You have signed out.", "success");
                  }}
                >
                  Sign out
                </button>
              </div>

              <section className={styles.section} aria-labelledby="create-heading">
                <div className={styles.sectionHeading}>
                  <h2 id="create-heading">Create a license</h2>
                  <p>Generate an unlimited QuickText Pro key for a customer.</p>
                </div>
                <form onSubmit={handleCreateLicense}>
                  <label htmlFor="license-email">Customer email</label>
                  <input
                    id="license-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    maxLength={254}
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                  <button type="submit" disabled={createBusy}>
                    {createBusy ? "Creating license..." : "Generate license key"}
                  </button>
                </form>
                {licenseKey && (
                  <div className={styles.license}>
                    <p className={styles.licenseLabel}>New QuickText Pro key</p>
                    <code>{licenseKey}</code>
                    <button
                      className={`${styles.secondary} ${styles.copy}`}
                      type="button"
                      onClick={handleCopyKey}
                    >
                      Copy key
                    </button>
                  </div>
                )}
              </section>

              <section className={styles.section} aria-labelledby="licenses-heading">
                <div className={`${styles.topline} ${styles.sectionHeading}`}>
                  <div>
                    <h2 id="licenses-heading">All QuickText licenses</h2>
                    <p>{licenseCount}</p>
                  </div>
                  <button
                    className={styles.secondary}
                    type="button"
                    onClick={() => loadLicenses(sessionToken)}
                  >
                    Refresh
                  </button>
                </div>
                <div className={styles.tableWrap}>
                  <table>
                    <thead>
                      <tr>
                        <th scope="col">License key</th>
                        <th scope="col">Customer email</th>
                        <th scope="col">Plan</th>
                        <th scope="col">Unlimited</th>
                        <th scope="col">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {licenses.map((license) => (
                        <tr key={license.id}>
                          <td><code>{license.serial_key || "—"}</code></td>
                          <td>{license.email || "—"}</td>
                          <td>{license.plan || "—"}</td>
                          <td>{license.unlimited ? "Yes" : "No"}</td>
                          <td>
                            <button
                              className={styles.deleteButton}
                              type="button"
                              disabled={deleteBusy === license.id}
                              onClick={() => handleDeleteLicense(license)}
                            >
                              {deleteBusy === license.id ? "Deleting..." : "Delete"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className={styles.tableStatus} role="status" aria-live="polite">
                  {tableStatus}
                </p>
              </section>
            </>
          )}

          <p className={`${styles.status} ${styles[statusKind]}`} role="status" aria-live="polite">
            {status}
          </p>
          <p className={styles.finePrint}>
            Access is checked by the license service. Keep generated keys private and share them
            only with their intended recipient.
          </p>
        </main>
      </div>
    </>
  );
}
