import { useState, useEffect, type ReactNode } from "react";

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

// ─── useWindowSize hook ──────────────────────────────────────────────────────
function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  useEffect(() => {
    const handler = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return size;
}

function useBreakpoint() {
  const { width } = useWindowSize();
  if (width < 640) return "xs";
  if (width < 768) return "sm";
  if (width < 1024) return "md";
  if (width < 1280) return "lg";
  return "xl";
}

function BreakpointIndicator() {
  const bp = useBreakpoint();
  const { width } = useWindowSize();
  const labels: Record<string, string> = {
    xs: "bg-red-900 text-red-300",
    sm: "bg-orange-900 text-orange-300",
    md: "bg-yellow-900 text-yellow-300",
    lg: "bg-green-900 text-green-300",
    xl: "bg-blue-900 text-blue-300",
  };
  return (
    <div className="flex items-center gap-3">
      <span className={`badge text-sm px-3 py-1 ${labels[bp]}`}>
        {bp.toUpperCase()} · {width}px
      </span>
      <span className="text-gray-500 text-sm">
        Resize the window to see it change
      </span>
    </div>
  );
}

// ─── Responsive grid ─────────────────────────────────────────────────────────
const CARDS = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  title: `Card ${i + 1}`,
  desc: "Responsive grid item using Tailwind breakpoints",
}));

function ResponsiveGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {CARDS.map((c) => (
        <div key={c.id} className="bg-gray-800 rounded-lg p-4 text-sm">
          <p className="text-gray-200 font-medium mb-1">{c.title}</p>
          <p className="text-gray-500 text-xs">{c.desc}</p>
        </div>
      ))}
    </div>
  );
}

export default function ResponsivePatterns() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="mb-8">
        <span className="section-tag">08</span>
        <h1 className="text-white mb-2">Responsive Design Patterns</h1>
        <p className="text-gray-400">
          Tailwind breakpoints, custom responsive hooks, and adaptive layouts.
        </p>
      </div>

      <SubSection
        title="Live Breakpoint Indicator"
        tip="Custom hook reads window.innerWidth and maps to Tailwind breakpoints."
      >
        <BreakpointIndicator />
        <pre>{`function useBreakpoint() {
  const { width } = useWindowSize();
  if (width < 640)  return 'xs';   // sm:
  if (width < 768)  return 'sm';   // md:
  if (width < 1024) return 'md';   // lg:
  if (width < 1280) return 'lg';   // xl:
  return 'xl';
}

// Use in component for conditional rendering:
const bp = useBreakpoint();
if (bp === 'xs') return <MobileView />;
return <DesktopView />;`}</pre>
      </SubSection>

      <SubSection
        title="Responsive Grid with Tailwind"
        tip="Mobile-first: define smallest layout first, then override at larger breakpoints."
      >
        <ResponsiveGrid />
        <pre>{`{/* 1 col on mobile, 2 on sm, 3 on lg */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>

{/* Responsive text */}
<h1 className="text-2xl md:text-4xl lg:text-5xl font-bold">Title</h1>

{/* Show/hide at breakpoints */}
<nav className="hidden md:flex gap-4">...</nav>
<button className="md:hidden">☰</button>`}</pre>
      </SubSection>

      <SubSection title="Responsive Sidebar Layout">
        <pre>{`// Collapsible sidebar pattern
function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bp = useBreakpoint();

  return (
    <div className="flex h-screen">
      {/* Sidebar — always visible on md+, drawer on mobile */}
      <aside className={
        bp === 'xs' || bp === 'sm'
          ? \`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform
             \${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}\`
          : 'w-64 shrink-0'
      }>
        ...
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && bp !== 'lg' && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />
      )}

      <main className="flex-1 overflow-y-auto">...</main>
    </div>
  );
}`}</pre>
      </SubSection>

      <SubSection title="Responsive Data Tables">
        <pre>{`// On mobile: convert table to card list
function UserTable({ users }) {
  const bp = useBreakpoint();

  if (bp === 'xs' || bp === 'sm') {
    return (
      <div className="space-y-2">
        {users.map(u => (
          <div key={u.id} className="card flex-col gap-1">
            <p className="font-medium">{u.name}</p>
            <p className="text-sm text-gray-500">{u.email}</p>
            <span className="badge">{u.role}</span>
          </div>
        ))}
      </div>
    );
  }

  return <table>...</table>;
}`}</pre>
      </SubSection>
    </div>
  );
}
