import {
  useState,
  useMemo,
  useCallback,
  memo,
  lazy,
  Suspense,
  type ReactNode,
} from "react";
import { FixedSizeList as List } from "react-window";

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

// ─── 1. React.memo ─────────────────────────────────────────────────────────
let childRenderCount = 0;

const ExpensiveChild = memo(function ExpensiveChild({
  value,
}: {
  value: string;
}) {
  childRenderCount++;
  return (
    <div className="bg-gray-800 rounded-lg p-3 text-sm">
      <span className="text-gray-400">Child render count: </span>
      <span className="text-violet-300 font-mono">{childRenderCount}</span>
      <span className="text-gray-500"> · value: </span>
      <span className="text-gray-200">{value}</span>
    </div>
  );
});

function MemoDemo() {
  const [count, setCount] = useState(0);
  const [childVal, setChildVal] = useState("hello");
  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <button
          className="btn-secondary text-sm"
          onClick={() => setCount((c) => c + 1)}
        >
          Parent re-render ({count})
        </button>
        <button
          className="btn-primary text-sm"
          onClick={() =>
            setChildVal((v) => (v === "hello" ? "world" : "hello"))
          }
        >
          Change child prop
        </button>
      </div>
      <ExpensiveChild value={childVal} />
      <p className="text-xs text-gray-600">
        Click "Parent re-render" — child doesn't re-render because{" "}
        <code>memo</code> skips it when props haven't changed.
      </p>
    </div>
  );
}

// ─── 2. useMemo ────────────────────────────────────────────────────────────
function UseMemoDemo() {
  const [query, setQuery] = useState("");
  const [multiplier, setMultiplier] = useState(2);

  const LARGE_LIST = Array.from({ length: 10_000 }, (_, i) => `Item ${i + 1}`);

  const filtered = useMemo(
    () =>
      LARGE_LIST.filter((item) =>
        item.toLowerCase().includes(query.toLowerCase()),
      ),
    [query], // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <input
          className="input flex-1"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter 10k items…"
        />
        <button
          className="btn-secondary text-sm"
          onClick={() => setMultiplier((m) => m + 1)}
        >
          Unrelated re-render (×{multiplier})
        </button>
      </div>
      <p className="text-xs text-gray-500">
        Matched: <span className="text-violet-300">{filtered.length}</span> of
        10,000. Filtering only re-runs when <code>query</code> changes — not on
        every parent render.
      </p>
    </div>
  );
}

// ─── 3. useCallback ────────────────────────────────────────────────────────
const CallbackChild = memo(function CallbackChild({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button className="btn-secondary text-sm" onClick={onClick}>
      {label}
    </button>
  );
});

function UseCallbackDemo() {
  const [count, setCount] = useState(0);

  // ✅ Stable reference — CallbackChild won't re-render unnecessarily
  const handleClick = useCallback(() => setCount((c) => c + 1), []);

  return (
    <div className="space-y-3">
      <CallbackChild onClick={handleClick} label={`Clicked ${count} times`} />
      <pre>{`// ✅ Wrap in useCallback when passing to memo'd children
const handleClick = useCallback(() => {
  setCount(c => c + 1);
}, []); // stable reference

// ❌ Inline arrow recreated on every render → memo bust
<Child onClick={() => setCount(c => c + 1)} />`}</pre>
    </div>
  );
}

// ─── 4. Lazy / Suspense ────────────────────────────────────────────────────
const LazyCard = lazy(
  () =>
    new Promise<{ default: () => ReactNode }>((resolve) =>
      setTimeout(
        () =>
          resolve({
            default: () => (
              <div className="bg-violet-900 rounded-lg p-4 text-violet-200 text-sm">
                🎉 Lazy-loaded component ready!
              </div>
            ),
          }),
        1500,
      ),
    ),
);

function LazySuspenseDemo() {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-3">
      <button
        className="btn-primary text-sm"
        onClick={() => setShow((v) => !v)}
      >
        {show ? "Unmount" : "Load lazy component (1.5s delay)"}
      </button>
      {show && (
        <Suspense
          fallback={
            <div className="animate-pulse text-gray-500 text-sm">
              Loading chunk…
            </div>
          }
        >
          <LazyCard />
        </Suspense>
      )}
    </div>
  );
}

// ─── 5. Virtualization ─────────────────────────────────────────────────────
const BIG_DATA = Array.from({ length: 100_000 }, (_, i) => ({
  id: i,
  name: `User ${i + 1}`,
  score: Math.floor(Math.random() * 100),
}));

function VirtualizationDemo() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">
        Rendering 100,000 rows with <code>react-window</code> — only visible
        rows mount in DOM.
      </p>
      <List
        height={240}
        itemCount={BIG_DATA.length}
        itemSize={40}
        width="100%"
        className="scrollbar-thin scrollbar-track-gray-900 scrollbar-thumb-gray-700"
      >
        {({ index, style }) => (
          <div
            style={style}
            className="flex items-center gap-3 px-3 border-b border-gray-800/60 text-sm"
          >
            <span className="text-gray-600 font-mono w-16">
              #{BIG_DATA[index].id}
            </span>
            <span className="text-gray-300 flex-1">{BIG_DATA[index].name}</span>
            <span className="text-violet-400">{BIG_DATA[index].score} pts</span>
          </div>
        )}
      </List>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────
export default function PerformancePatterns() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="mb-8">
        <span className="section-tag">03</span>
        <h1 className="text-white mb-2">Performance Optimization</h1>
        <p className="text-gray-400">
          Prevent unnecessary renders and keep the UI fast at scale.
        </p>
      </div>

      <SubSection
        title="React.memo — Skip Re-renders"
        tip="Memoize a component so it only re-renders when its props change. Use with useCallback and useMemo to keep prop references stable."
      >
        <MemoDemo />
        <ul className="text-sm text-gray-500 list-disc list-inside space-y-1">
          <li>
            Only effective if parent re-renders frequently and child renders are
            expensive
          </li>
          <li>Profile first — premature memoization adds complexity</li>
          <li>
            memo does a shallow comparison by default; pass custom comparator if
            needed
          </li>
        </ul>
      </SubSection>

      <SubSection
        title="useMemo — Memoize Expensive Calculations"
        tip="Cache derived data so it's recomputed only when dependencies change, not on every render."
      >
        <UseMemoDemo />
      </SubSection>

      <SubSection
        title="useCallback — Stable Function References"
        tip="Wrap event handlers/callbacks in useCallback when passing them to memo'd children or including them in effect deps."
      >
        <UseCallbackDemo />
      </SubSection>

      <SubSection
        title="lazy() + Suspense — Code Splitting"
        tip="Split large pages or heavy components into separate JS chunks loaded on demand. Reduces initial bundle size."
      >
        <LazySuspenseDemo />
        <pre>{`// Route-level code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));

<Suspense fallback={<PageSkeleton />}>
  <Routes>
    <Route path="/dash" element={<Dashboard />} />
  </Routes>
</Suspense>`}</pre>
      </SubSection>

      <SubSection
        title="Virtualization — React Window"
        tip="Only render what's visible. Essential for lists with 1,000+ items."
      >
        <VirtualizationDemo />
      </SubSection>

      <SubSection title="Performance Checklist">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-400">
          {[
            ["🔍 Profile first", "Use React DevTools Profiler"],
            ["📦 Bundle analysis", "vite-bundle-visualizer"],
            ["🖼 Image optimization", "lazy loading, WebP, next/image"],
            [
              "🔁 Avoid object literals in JSX",
              "{ a: 1 } recreated every render",
            ],
            ["🗃 State colocation", "Lift state only as high as needed"],
            ["⚡ useTransition", "Mark non-urgent updates"],
          ].map(([title, desc]) => (
            <div key={title as string} className="bg-gray-800 rounded-lg p-3">
              <p className="font-medium text-gray-200">{title}</p>
              <p className="text-gray-500 text-xs mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </SubSection>
    </div>
  );
}
