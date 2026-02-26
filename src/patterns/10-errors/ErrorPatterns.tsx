import { useState, type ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";

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

// ─── Fallback UI ─────────────────────────────────────────────────────────────
function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div className="bg-red-950 border border-red-800 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-red-400 text-lg">⚠</span>
        <p className="text-red-300 font-medium text-sm">Component crashed</p>
      </div>
      <p className="text-red-400 text-xs font-mono">{error.message}</p>
      <button className="btn-danger text-xs" onClick={resetErrorBoundary}>
        ↺ Try Again
      </button>
    </div>
  );
}

// ─── A component that can throw ──────────────────────────────────────────────
function BuggyComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error("Simulated render error: null reference");
  return (
    <div className="bg-green-900 border border-green-700 rounded-lg p-3 text-green-300 text-sm">
      ✅ Component rendered successfully
    </div>
  );
}

function ErrorBoundaryDemo() {
  const [shouldThrow, setShouldThrow] = useState(false);
  return (
    <div className="space-y-3">
      <button
        className={shouldThrow ? "btn-secondary text-sm" : "btn-danger text-sm"}
        onClick={() => setShouldThrow((v) => !v)}
      >
        {shouldThrow ? "Fix component" : "Throw error"}
      </button>
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={() => setShouldThrow(false)}
        resetKeys={[shouldThrow]}
      >
        <BuggyComponent shouldThrow={shouldThrow} />
      </ErrorBoundary>
    </div>
  );
}

// ─── Async error handling ────────────────────────────────────────────────────
type AsyncState<T> = {
  status: "idle" | "loading" | "success" | "error";
  data?: T;
  error?: string;
};

function AsyncErrorDemo() {
  const [state, setState] = useState<AsyncState<{ message: string }>>({
    status: "idle",
  });

  const fetchData = async (fail: boolean) => {
    setState({ status: "loading" });
    await new Promise((r) => setTimeout(r, 700));
    if (fail) {
      setState({
        status: "error",
        error:
          "Network error: Failed to fetch /api/data (503 Service Unavailable)",
      });
    } else {
      setState({
        status: "success",
        data: { message: "Data loaded successfully!" },
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          className="btn-primary text-sm"
          onClick={() => fetchData(false)}
          disabled={state.status === "loading"}
        >
          Fetch (success)
        </button>
        <button
          className="btn-danger text-sm"
          onClick={() => fetchData(true)}
          disabled={state.status === "loading"}
        >
          Fetch (fail)
        </button>
        <button
          className="btn-secondary text-sm"
          onClick={() => setState({ status: "idle" })}
        >
          Reset
        </button>
      </div>

      {state.status === "loading" && (
        <div className="animate-pulse text-gray-500 text-sm">Loading…</div>
      )}
      {state.status === "success" && (
        <div className="bg-green-900 border border-green-700 rounded-lg p-3 text-green-300 text-sm">
          ✅ {state.data?.message}
        </div>
      )}
      {state.status === "error" && (
        <div className="bg-red-950 border border-red-800 rounded-lg p-3 space-y-2">
          <p className="text-red-300 font-medium text-sm">Request failed</p>
          <p className="text-red-400 text-xs font-mono">{state.error}</p>
          <button
            className="btn-danger text-xs"
            onClick={() => fetchData(false)}
          >
            ↺ Retry
          </button>
        </div>
      )}
    </div>
  );
}

export default function ErrorPatterns() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="mb-8">
        <span className="section-tag">10</span>
        <h1 className="text-white mb-2">Error Handling Patterns</h1>
        <p className="text-gray-400">
          React ErrorBoundary, async error states, global error handling.
        </p>
      </div>

      <SubSection
        title="ErrorBoundary — Catch Render Errors"
        tip="Wrap subtrees in ErrorBoundary. Render errors crash the whole app without it. Use react-error-boundary for a production-ready implementation."
      >
        <ErrorBoundaryDemo />
        <pre>{`import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>Something went wrong: {error.message}</p>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

<ErrorBoundary
  FallbackComponent={ErrorFallback}
  onError={(error, info) => logToSentry(error, info)}
  onReset={() => clearErrorState()}
>
  <RiskyComponent />
</ErrorBoundary>`}</pre>
      </SubSection>

      <SubSection
        title="Async Error States"
        tip="Model async operations as explicit state machines: idle → loading → success | error. Never leave errors silent."
      >
        <AsyncErrorDemo />
        <pre>{`// Pattern: typed async state machine
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

// With TanStack Query this is handled automatically:
const { isLoading, isError, error, data } = useQuery({ ... });`}</pre>
      </SubSection>

      <SubSection title="Global Error Handler Pattern">
        <pre>{`// Axios interceptor — handle auth/server errors globally:
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      authStore.logout();
      navigate('/login');
    }
    if (error.response?.status >= 500) {
      toast.error('Server error — please try again');
      logToSentry(error);
    }
    return Promise.reject(error);
  }
);

// TanStack Query global error handler:
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      throwOnError: (error) => error.status >= 500, // error boundary
    },
  },
  queryCache: new QueryCache({
    onError: (error) => toast.error(error.message),
  }),
});`}</pre>
      </SubSection>

      <SubSection title="Error Boundary Placement Strategy">
        <ul className="text-sm text-gray-400 list-disc list-inside space-y-2">
          <li>
            <strong className="text-gray-200">App level</strong> — catch
            catastrophic failures, show friendly error page
          </li>
          <li>
            <strong className="text-gray-200">Route level</strong> — isolate
            page crashes, keep nav working
          </li>
          <li>
            <strong className="text-gray-200">Widget level</strong> — isolate
            sidebar/chart crashes, keep main content visible
          </li>
          <li>
            Always log to Sentry/Datadog in the <code>onError</code> callback
          </li>
          <li>
            Never swallow errors silently — always surface to user in some way
          </li>
        </ul>
      </SubSection>
    </div>
  );
}
