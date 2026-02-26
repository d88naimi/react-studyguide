import { useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";

function SubSection({
  title,
  tip,
  children,
}: {
  title: string;
  tip?: string;
  children: ReactNode;
}) {
  return (
    <section className="card space-y-4">
      <div>
        <h2 className="text-gray-100">{title}</h2>
        {tip && <p className="text-gray-500 text-sm mt-1">{tip}</p>}
      </div>
      {children}
    </section>
  );
}

// ─── Mock auth ───────────────────────────────────────────────────────────────
function useAuth() {
  const [authed, setAuthed] = useState(false);
  return {
    authed,
    login: () => setAuthed(true),
    logout: () => setAuthed(false),
  };
}

// ─── Nested routes demo (inline) ────────────────────────────────────────────
function NestedDemo() {
  const tabs = ["overview", "members", "settings"];
  return (
    <div className="space-y-3">
      <div className="flex gap-1 border-b border-gray-700">
        {tabs.map((t) => (
          <Link
            key={t}
            to={`/routing/project/${t}`}
            className="px-4 py-2 text-sm capitalize text-gray-400 hover:text-gray-200 border-b-2 border-transparent hover:border-violet-500 transition-colors"
          >
            {t}
          </Link>
        ))}
      </div>
      <p className="text-gray-600 text-sm italic">
        Click a tab above — nested child renders in &lt;Outlet /&gt;
      </p>
    </div>
  );
}

// ─── Search params demo ──────────────────────────────────────────────────────
function SearchParamsDemo() {
  const [searchParams, setSearchParams] = useSearchParams();
  const role = searchParams.get("role") ?? "";
  const status = searchParams.get("status") ?? "";

  const set = (key: string, val: string) =>
    setSearchParams((prev) => {
      const n = new URLSearchParams(prev);
      val ? n.set(key, val) : n.delete(key);
      return n;
    });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <div>
          <label className="text-xs text-gray-500 block mb-1">
            Role filter
          </label>
          <select
            className="input text-sm"
            value={role}
            onChange={(e) => set("role", e.target.value)}
          >
            <option value="">All roles</option>
            {["engineer", "designer", "manager"].map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">
            Status filter
          </label>
          <select
            className="input text-sm"
            value={status}
            onChange={(e) => set("status", e.target.value)}
          >
            <option value="">All statuses</option>
            {["active", "inactive"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="bg-gray-800 rounded-lg p-3 text-xs font-mono text-gray-400">
        URL:{" "}
        <span className="text-violet-300">
          {window.location.search || "(no params)"}
        </span>
      </div>
      <p className="text-xs text-gray-600">
        Search params live in the URL — shareable, bookmarkable, browser-back
        compatible.
      </p>
    </div>
  );
}

// ─── Protected route demo ────────────────────────────────────────────────────
function ProtectedDemo() {
  const { authed, login, logout } = useAuth();
  return (
    <div className="space-y-3">
      <div className="flex gap-3 items-center">
        <span
          className={`badge ${authed ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"}`}
        >
          {authed ? "🔓 Authenticated" : "🔒 Not authenticated"}
        </span>
        <button
          className={authed ? "btn-danger text-sm" : "btn-primary text-sm"}
          onClick={authed ? logout : login}
        >
          {authed ? "Logout" : "Login"}
        </button>
      </div>
      <div className="bg-gray-800 rounded-lg p-3">
        {authed ? (
          <p className="text-green-300 text-sm">
            ✅ Protected content — only accessible when authenticated
          </p>
        ) : (
          <p className="text-red-400 text-sm">
            🚫 RequireAuth redirects to /login when not authenticated
          </p>
        )}
      </div>
    </div>
  );
}

export default function RoutingPatterns() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="mb-8">
        <span className="section-tag">07</span>
        <h1 className="text-white mb-2">Routing Patterns</h1>
        <p className="text-gray-400">
          React Router v6 — nested routes, protected routes, search params, lazy
          routes.
        </p>
      </div>

      <SubSection
        title="Nested Routes with Outlet"
        tip="Parent route renders layout, child routes render in <Outlet />. This avoids re-mounting shared UI on tab navigation."
      >
        <NestedDemo />
        <pre>{`// App.tsx — nested route config
<Route path="/project/:id" element={<ProjectLayout />}>
  <Route index         element={<ProjectOverview />} />
  <Route path="members" element={<ProjectMembers />} />
  <Route path="settings" element={<ProjectSettings />} />
</Route>

// ProjectLayout.tsx
function ProjectLayout() {
  return (
    <div>
      <ProjectTabs />  {/* nav stays mounted */}
      <Outlet />       {/* child swaps here */}
    </div>
  );
}`}</pre>
      </SubSection>

      <SubSection
        title="Protected Routes"
        tip="Wrap restricted routes in an auth guard. Use <Navigate replace> to redirect without adding to history stack."
      >
        <ProtectedDemo />
        <pre>{`function RequireAuth({ children }: { children: ReactNode }) {
  const { authed } = useAuth();
  const location = useLocation();
  if (!authed) {
    // Pass 'from' so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

// Or as a layout route:
<Route element={<RequireAuth />}>
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/settings"  element={<Settings />} />
</Route>`}</pre>
      </SubSection>

      <SubSection
        title="URL Search Params as State"
        tip="Store filter/sort/page in search params so state survives refresh, is shareable, and integrates with browser history."
      >
        <SearchParamsDemo />
        <pre>{`const [searchParams, setSearchParams] = useSearchParams();
const role = searchParams.get('role') ?? '';

// Update without clobbering other params:
setSearchParams(prev => {
  const next = new URLSearchParams(prev);
  next.set('role', newRole);
  return next;
});`}</pre>
      </SubSection>

      <SubSection title="Programmatic Navigation">
        <pre>{`const navigate = useNavigate();

// Go to a route
navigate('/dashboard');

// Pass state (not in URL)
navigate('/checkout', { state: { items } });

// Go back
navigate(-1);

// Replace history entry (no back button)
navigate('/login', { replace: true });

// Access route params
const { id } = useParams<{ id: string }>();`}</pre>
      </SubSection>

      <SubSection title="Route-Level Code Splitting">
        <pre>{`// App.tsx
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings  = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings"  element={<Settings />} />
        <Route path="*"          element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}`}</pre>
      </SubSection>
    </div>
  );
}
