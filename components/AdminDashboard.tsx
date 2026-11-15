import Head from "next/head";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "@/styles/Admin.module.css";

const FUNCTION_URL = "https://kmkjuuytbgpozrigspgw.supabase.co/functions/v1/admin-licenses";
const SESSION_KEY = "quicktext-admin-session";

type FieldType = "text" | "email" | "number" | "boolean" | "datetime";

type ResourceField = {
  key: string;
  label: string;
  type: FieldType;
  editable?: boolean;
  create?: boolean;
  required?: boolean;
  defaultValue?: string | number | boolean;
};

type ManagedResource = {
  id: string;
  tool: string;
  title: string;
  description: string;
  projectUrl: string;
  projectConfigured: boolean;
  primaryKey: string;
  permissions: { view: boolean; create: boolean; edit: boolean; delete: boolean };
  fields: ResourceField[];
};

type ResourceRow = Record<string, unknown>;

type ApiResponse = {
  error?: string;
  token?: string;
  licenseKey?: string;
  email?: string;
  resources?: ManagedResource[];
  rows?: ResourceRow[];
  hasMore?: boolean;
  total?: number;
};

class AdminRequestError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "AdminRequestError";
  }
}

async function request(
  action: string,
  payload: Record<string, unknown> = {},
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

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function displayValue(value: unknown, type: FieldType): string {
  if (value === null || value === undefined || value === "") return "—";
  if (type === "boolean") return value ? "Yes" : "No";
  if (type === "datetime" && typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
  }
  return String(value);
}

function inputValue(field: ResourceField, value: unknown): string | number | boolean {
  if (value === null || value === undefined) return field.type === "boolean" ? false : "";
  if (field.type === "boolean") return Boolean(value);
  if (field.type === "number") return Number(value);
  return String(value);
}

type ResourcePanelProps = {
  resource: ManagedResource;
  rows: ResourceRow[];
  total: number;
  hasMore: boolean;
  loading: string;
  token: string;
  onRefresh: (resourceId: string, append?: boolean) => Promise<void>;
  onStatus: (message: string, kind: "error" | "success") => void;
  onUnauthorized: () => void;
};

type DashboardView = "overview" | string;

function ResourcePanel({
  resource,
  rows,
  total,
  hasMore,
  loading,
  token,
  onRefresh,
  onStatus,
  onUnauthorized,
}: ResourcePanelProps) {
  const [filter, setFilter] = useState("");
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, unknown>>({});
  const [createValues, setCreateValues] = useState<Record<string, unknown>>({});
  const [busy, setBusy] = useState(false);

  const createFields = resource.fields.filter((field) => field.create);
  const editFields = resource.fields.filter((field) => field.editable);
  const isLoading = loading.startsWith("Loading");
  const visibleRows = useMemo(() => {
    const query = filter.trim().toLocaleLowerCase();
    if (!query) return rows;
    return rows.filter((row) => resource.fields.some((field) =>
      String(row[field.key] ?? "").toLocaleLowerCase().includes(query)
    ));
  }, [filter, resource.fields, rows]);

  function beginEdit(row: ResourceRow) {
    const key = String(row[resource.primaryKey]);
    setEditingKey(key);
    setEditValues(Object.fromEntries(
      editFields.map((field) => [field.key, inputValue(field, row[field.key])]),
    ));
  }

  async function saveEdit(row: ResourceRow) {
    setBusy(true);
    try {
      await request("update-resource", {
        resourceId: resource.id,
        key: row[resource.primaryKey],
        values: editValues,
      }, token);
      setEditingKey(null);
      onStatus(`${resource.title} record updated.`, "success");
      await onRefresh(resource.id);
    } catch (error) {
      if (error instanceof AdminRequestError && error.status === 401) onUnauthorized();
      onStatus(errorMessage(error, `Could not update ${resource.title}.`), "error");
    } finally {
      setBusy(false);
    }
  }

  async function createRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    try {
      await request("create-resource", {
        resourceId: resource.id,
        values: createValues,
      }, token);
      setCreateValues({});
      onStatus(`${resource.title} record created.`, "success");
      await onRefresh(resource.id);
    } catch (error) {
      if (error instanceof AdminRequestError && error.status === 401) onUnauthorized();
      onStatus(errorMessage(error, `Could not create ${resource.title}.`), "error");
    } finally {
      setBusy(false);
    }
  }

  async function deleteRecord(row: ResourceRow) {
    const key = String(row[resource.primaryKey]);
    if (!window.confirm(`Permanently delete this ${resource.title} record (${key})?`)) return;
    setBusy(true);
    try {
      await request("delete-resource", {
        resourceId: resource.id,
        key: row[resource.primaryKey],
      }, token);
      onStatus(`${resource.title} record deleted.`, "success");
      await onRefresh(resource.id);
    } catch (error) {
      if (error instanceof AdminRequestError && error.status === 401) onUnauthorized();
      onStatus(errorMessage(error, `Could not delete ${resource.title}.`), "error");
    } finally {
      setBusy(false);
    }
  }

  function renderInput(
    field: ResourceField,
    value: unknown,
    onChange: (value: unknown) => void,
    idSuffix: string,
  ) {
    const id = `${resource.id}-${idSuffix}-${field.key}`;
    if (field.type === "boolean") {
      return (
        <input
          id={id}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(event.currentTarget.checked)}
        />
      );
    }
    return (
      <input
        id={id}
        type={field.type === "datetime" ? "text" : field.type}
        min={field.type === "number" ? "0" : undefined}
        step={field.type === "number" ? "1" : undefined}
        required={field.required}
        value={value === null || value === undefined ? "" : String(value)}
        onChange={(event) => {
          const next = event.currentTarget.value;
          onChange(field.type === "number" ? (next === "" ? null : Number(next)) : next);
        }}
      />
    );
  }

  return (
    <section className={styles.resourceCard} aria-labelledby={`${resource.id}-heading`}>
      <div className={`${styles.topline} ${styles.resourceHeading}`}>
        <div>
          <p className={styles.resourceTool}>{resource.tool}</p>
          <h2 id={`${resource.id}-heading`}>{resource.title}</h2>
          <p className={styles.resourceDescription}>{resource.description}</p>
        </div>
        <button
          className={styles.secondary}
          type="button"
          disabled={busy || isLoading}
          onClick={() => void onRefresh(resource.id)}
        >
          Refresh
        </button>
      </div>
      <div className={styles.permissionList} aria-label="Allowed actions">
        {resource.permissions.view && <span>View</span>}
        {resource.permissions.create && <span>Create</span>}
        {resource.permissions.edit && <span>Edit</span>}
        {resource.permissions.delete && <span>Delete</span>}
      </div>

      {resource.permissions.create && createFields.length > 0 && (
        <form className={styles.resourceCreateForm} onSubmit={createRecord}>
          <h3>Add record</h3>
          <div className={styles.resourceFormFields}>
            {createFields.map((field) => (
              <label key={field.key} htmlFor={`${resource.id}-${field.key}`}>
                {field.label}
                {renderInput(
                  field,
                  createValues[field.key] ?? field.defaultValue ?? "",
                  (value) => setCreateValues((current) => ({ ...current, [field.key]: value })),
                  "new",
                )}
              </label>
            ))}
          </div>
          <button type="submit" disabled={busy}>Add record</button>
        </form>
      )}

      <div className={styles.resourceTableToolbar}>
        <span>
          {loading || `${total} record${total === 1 ? "" : "s"}${hasMore ? ` · ${rows.length} loaded` : ""}`}
        </span>
        <input
          aria-label={`Filter ${resource.title}`}
          placeholder={`Filter ${resource.title}...`}
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        />
      </div>
      <div className={styles.tableWrap}>
        <table>
          <thead>
            <tr>
              {resource.fields.map((field) => <th key={field.key} scope="col">{field.label}</th>)}
              {(resource.permissions.edit || resource.permissions.delete) && (
                <th scope="col">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => {
              const rowKey = String(row[resource.primaryKey]);
              const isEditing = editingKey === rowKey;
              return (
                <tr key={rowKey}>
                  {resource.fields.map((field) => (
                    <td key={field.key}>
                      {isEditing && field.editable
                        ? renderInput(
                          field,
                          editValues[field.key],
                          (value) => setEditValues((current) => ({ ...current, [field.key]: value })),
                          rowKey,
                        )
                        : displayValue(row[field.key], field.type)}
                    </td>
                  ))}
                  {(resource.permissions.edit || resource.permissions.delete) && (
                    <td className={styles.resourceActions}>
                      {isEditing ? (
                        <>
                          <button
                            className={styles.secondary}
                            type="button"
                            disabled={busy}
                            onClick={() => setEditingKey(null)}
                          >
                            Cancel
                          </button>
                          <button
                            className={styles.approveButton}
                            type="button"
                            disabled={busy}
                            onClick={() => void saveEdit(row)}
                          >
                            Save
                          </button>
                        </>
                      ) : (
                        <>
                          {resource.permissions.edit && editFields.length > 0 && (
                            <button
                              className={styles.secondary}
                              type="button"
                              disabled={busy}
                              onClick={() => beginEdit(row)}
                            >
                              Edit
                            </button>
                          )}
                          {resource.permissions.delete && (
                            <button
                              className={styles.deleteButton}
                              type="button"
                              disabled={busy}
                              onClick={() => void deleteRecord(row)}
                            >
                              Delete
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {visibleRows.length === 0 && (
        <p className={styles.tableStatus}>
          {isLoading
            ? "Loading records..."
            : loading
              ? loading
              : filter
                ? "No records match this filter."
                : "No records found."}
        </p>
      )}
      {hasMore && (
        <button
          className={styles.secondary}
          type="button"
          disabled={isLoading}
          onClick={() => void onRefresh(resource.id, true)}
        >
          {loading ? "Loading..." : "Load more"}
        </button>
      )}
    </section>
  );
}

export default function AdminDashboard() {
  const [initialized, setInitialized] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [sessionToken, setSessionToken] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [licenseKey, setLicenseKey] = useState("");
  const [resources, setResources] = useState<ManagedResource[]>([]);
  const [resourceRows, setResourceRows] = useState<Record<string, ResourceRow[]>>({});
  const [resourceTotals, setResourceTotals] = useState<Record<string, number>>({});
  const [resourceLoading, setResourceLoading] = useState<Record<string, string>>({});
  const [resourceHasMore, setResourceHasMore] = useState<Record<string, boolean>>({});
  const resourceOffsets = useRef<Record<string, number>>({});
  const [status, setStatus] = useState("");
  const [statusKind, setStatusKind] = useState<"error" | "success" | "working">("error");
  const [loginBusy, setLoginBusy] = useState(false);
  const [createBusy, setCreateBusy] = useState(false);
  const [activeView, setActiveView] = useState<DashboardView>("overview");

  const toolGroups = useMemo(() => {
    const groups = new Map<string, ManagedResource[]>();
    for (const resource of resources) {
      groups.set(resource.tool, [...(groups.get(resource.tool) ?? []), resource]);
    }
    return [...groups.entries()];
  }, [resources]);

  const activeResource = resources.find((resource) => resource.id === activeView);

  const showStatus = useCallback((
    message: string,
    kind: "error" | "success" | "working" = "error",
  ) => {
    setStatus(message);
    setStatusKind(kind);
  }, []);

  const signOut = useCallback(() => {
    setAuthenticated(false);
    setSessionToken("");
    setResources([]);
    setResourceRows({});
    setResourceTotals({});
    setResourceLoading({});
    setResourceHasMore({});
    resourceOffsets.current = {};
    sessionStorage.removeItem(SESSION_KEY);
  }, []);

  const loadResource = useCallback(async (
    resourceId: string,
    token: string,
    append = false,
  ) => {
    const offset = append ? resourceOffsets.current[resourceId] ?? 0 : 0;
    setResourceLoading((current) => ({
      ...current,
      [resourceId]: append ? "Loading more..." : "Loading...",
    }));
    try {
      const data = await request("list-resource", { resourceId, offset }, token);
      if (!Array.isArray(data.rows)) throw new Error("The server returned an invalid resource list.");
      setResourceRows((current) => ({
        ...current,
        [resourceId]: append
          ? [...(current[resourceId] ?? []), ...data.rows!]
          : data.rows!,
      }));
      setResourceTotals((current) => ({ ...current, [resourceId]: data.total ?? data.rows!.length }));
      resourceOffsets.current[resourceId] = offset + data.rows.length;
      setResourceHasMore((current) => ({ ...current, [resourceId]: data.hasMore === true }));
      setResourceLoading((current) => ({ ...current, [resourceId]: "" }));
    } catch (error) {
      setResourceLoading((current) => ({
        ...current,
        [resourceId]: errorMessage(error, "Could not load records."),
      }));
      if (error instanceof AdminRequestError && error.status === 401) signOut();
    }
  }, [signOut]);

  const loadDashboard = useCallback(async (token: string) => {
    const data = await request("get-admin-registry", {}, token);
    if (!Array.isArray(data.resources)) throw new Error("The server returned an invalid tool registry.");
    setResources(data.resources);
    await Promise.all(
      data.resources
        .filter((resource) => resource.permissions.view)
        .map((resource) => loadResource(resource.id, token)),
    );
  }, [loadResource]);

  useEffect(() => {
    let cancelled = false;
    const savedToken = sessionStorage.getItem(SESSION_KEY) || "";
    if (!savedToken) {
      setInitialized(true);
      return () => { cancelled = true; };
    }

    setSessionToken(savedToken);
    request("session", {}, savedToken)
      .then(async () => {
        if (cancelled) return;
        setAuthenticated(true);
        await loadDashboard(savedToken);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        sessionStorage.removeItem(SESSION_KEY);
        setSessionToken("");
        showStatus(errorMessage(error, "Could not verify the saved session."));
      })
      .finally(() => {
        if (!cancelled) setInitialized(true);
      });

    return () => { cancelled = true; };
  }, [loadDashboard, showStatus]);

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
      await loadDashboard(data.token);
    } catch (error) {
      showStatus(errorMessage(error, "Sign-in failed."));
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
      await loadResource("quicktext-licenses", sessionToken);
    } catch (error) {
      if (error instanceof AdminRequestError && error.status === 401) signOut();
      showStatus(errorMessage(error, "License creation failed."));
    } finally {
      setCreateBusy(false);
    }
  }

  async function refreshResource(resourceId: string, append = false) {
    await loadResource(resourceId, sessionToken, append);
  }

  return (
    <>
      <Head>
        <title>Quiclab Tools Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className={styles.page}>
        <main className={styles.panel}>
          <p className={styles.eyebrow}>Quiclab Control Center</p>
          {!initialized ? (
            <p className={styles.intro}>Checking saved session...</p>
          ) : !authenticated ? (
            <section>
              <h1>Tools admin</h1>
              <p className={styles.intro}>Sign in to manage connected tools and their data.</p>
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
              <div className={styles.dashboardLayout}>
                <aside className={styles.sidebar}>
                  <div className={styles.sidebarBrand}>
                    <p className={styles.resourceTool}>Quiclab</p>
                    <strong>Admin console</strong>
                  </div>
                  <nav className={styles.sidebarNav} aria-label="Admin menu">
                    <button
                      type="button"
                      className={activeView === "overview" ? styles.navActive : ""}
                      aria-current={activeView === "overview" ? "page" : undefined}
                      onClick={() => setActiveView("overview")}
                    >
                      <span>Overview</span>
                      <small>All tools</small>
                    </button>
                    {toolGroups.map(([tool, toolResources]) => (
                      <div className={styles.navGroup} key={tool}>
                        <p>{tool}</p>
                        {toolResources.map((resource) => (
                          <button
                            key={resource.id}
                            type="button"
                            className={activeView === resource.id ? styles.navActive : ""}
                            aria-current={activeView === resource.id ? "page" : undefined}
                            onClick={() => setActiveView(resource.id)}
                          >
                            <span>{resource.title}</span>
                            <small>{resourceTotals[resource.id] ?? 0} records</small>
                          </button>
                        ))}
                      </div>
                    ))}
                  </nav>
                  <button
                    className={styles.sidebarSignOut}
                    type="button"
                    onClick={() => {
                      signOut();
                      showStatus("You have signed out.", "success");
                    }}
                  >
                    Sign out
                  </button>
                </aside>

                <div className={styles.dashboardContent}>
                  {activeView === "overview" ? (
                    <>
                      <div className={styles.dashboardHeader}>
                        <div>
                          <h1>Overview</h1>
                          <p className={styles.intro}>Monitor stats and open a tool to manage its data.</p>
                        </div>
                        <span className={styles.connectionBadge}>
                          {toolGroups.length} connected tool{toolGroups.length === 1 ? "" : "s"}
                        </span>
                      </div>
                      <div className={styles.toolOverviewGrid}>
                        {toolGroups.map(([tool, toolResources]) => {
                          const stats = toolResources.find((resource) => resource.id.endsWith("-stats"));
                          const statRow = stats ? resourceRows[stats.id]?.[0] : undefined;
                          const summaryResource = toolResources.find((resource) =>
                            resource.id.endsWith("-licenses") || resource.id.endsWith("-users")
                          );
                          return (
                            <section className={styles.toolOverviewCard} key={tool}>
                              <div>
                                <h2>{tool}</h2>
                                <p className={styles.resourceDescription}>
                                  {summaryResource?.projectUrl || "Supabase project"}
                                </p>
                              </div>
                              <div className={styles.overviewStats}>
                                {summaryResource && (
                                  <div>
                                    <span>{summaryResource.title}</span>
                                    <strong>{(resourceTotals[summaryResource.id] ?? 0).toLocaleString()}</strong>
                                  </div>
                                )}
                                {stats?.fields.filter((field) => field.key !== stats.primaryKey).map((field) => (
                                  <div key={field.key}>
                                    <span>{field.label}</span>
                                    <strong>{Number(statRow?.[field.key] ?? 0).toLocaleString()}</strong>
                                  </div>
                                ))}
                              </div>
                              <div className={styles.overviewActions}>
                                {toolResources.map((resource) => (
                                  <button
                                    className={styles.secondary}
                                    key={resource.id}
                                    type="button"
                                    onClick={() => setActiveView(resource.id)}
                                  >
                                    Manage {resource.title}
                                  </button>
                                ))}
                                {tool === "QuickText" && (
                                  <button
                                    className={styles.approveButton}
                                    type="button"
                                    onClick={() => setActiveView("quicktext-licenses")}
                                  >
                                    Generate key
                                  </button>
                                )}
                              </div>
                            </section>
                          );
                        })}
                      </div>
                    </>
                  ) : activeResource ? (
                    <>
                      <div className={styles.dashboardHeader}>
                        <div>
                          <p className={styles.resourceTool}>{activeResource.tool}</p>
                          <h1>{activeResource.title}</h1>
                          <p className={styles.intro}>{activeResource.projectUrl}</p>
                        </div>
                        <span
                          className={`${styles.connectionBadge} ${
                            activeResource.projectConfigured ? "" : styles.connectionWarning
                          }`}
                        >
                          {activeResource.projectConfigured ? "Server credentials configured" : "Setup required"}
                        </span>
                      </div>
                      {!activeResource.projectConfigured && (
                        <p className={styles.connectionError} role="alert">
                          The server is missing this project&apos;s URL or service-role key. Configure the
                          project secrets on the QuickText Supabase Edge Function, then redeploy it.
                        </p>
                      )}
                      {activeResource.id === "quicktext-licenses" && (
                        <section className={styles.resourceCard} aria-labelledby="create-license-heading">
                          <div className={styles.sectionHeading}>
                            <h2 id="create-license-heading">Generate a license key</h2>
                            <p>Create an unlimited QuickText Pro key for a customer.</p>
                          </div>
                          <form onSubmit={handleCreateLicense}>
                            <label htmlFor="license-email">Customer email</label>
                            <input
                              id="license-email"
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
                                onClick={async () => {
                                  try {
                                    await navigator.clipboard.writeText(licenseKey);
                                    showStatus("License key copied.", "success");
                                  } catch {
                                    showStatus("Copy failed. Select and copy the key manually.");
                                  }
                                }}
                              >
                                Copy key
                              </button>
                            </div>
                          )}
                        </section>
                      )}
                      <ResourcePanel
                        resource={activeResource}
                        rows={resourceRows[activeResource.id] ?? []}
                        total={resourceTotals[activeResource.id] ?? 0}
                        hasMore={resourceHasMore[activeResource.id] ?? false}
                        loading={resourceLoading[activeResource.id] ?? ""}
                        token={sessionToken}
                        onRefresh={refreshResource}
                        onStatus={showStatus}
                        onUnauthorized={signOut}
                      />
                    </>
                  ) : (
                    <p className={styles.intro}>This menu item is not available in the tool registry.</p>
                  )}
                  <p className={styles.finePrint}>
                    Connected Supabase tools are explicitly registered on the server. Their action permissions
                    are enforced by the Edge Function.
                  </p>
                </div>
              </div>
            </>
          )}
          <p className={`${styles.status} ${styles[statusKind]}`} role="status" aria-live="polite">
            {status}
          </p>
        </main>
      </div>
    </>
  );
}
