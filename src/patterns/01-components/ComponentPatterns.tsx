import {
  useState,
  createContext,
  useContext,
  useCallback,
  type ReactNode,
} from "react";

// ─── Shared ────────────────────────────────────────────────────────────────
function PageHeader({
  num,
  title,
  desc,
}: {
  num: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="mb-8">
      <span className="section-tag">{num}</span>
      <h1 className="text-white mb-2">{title}</h1>
      <p className="text-gray-400">{desc}</p>
    </div>
  );
}

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

// ─── 1. Compound Component (Tabs) ───────────────────────────────────────────
interface TabsCtx {
  active: string;
  setActive: (t: string) => void;
}
const TabsContext = createContext<TabsCtx | null>(null);
const useTabs = () => {
  const c = useContext(TabsContext);
  if (!c) throw new Error("Use inside <Tabs>");
  return c;
};

function Tabs({
  children,
  defaultTab,
}: {
  children: ReactNode;
  defaultTab: string;
}) {
  const [active, setActive] = useState(defaultTab);
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div>{children}</div>
    </TabsContext.Provider>
  );
}

function TabList({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-1 border-b border-gray-700 mb-4" role="tablist">
      {children}
    </div>
  );
}

function Tab({ id, children }: { id: string; children: ReactNode }) {
  const { active, setActive } = useTabs();
  const isActive = active === id;
  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => setActive(id)}
      className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
        isActive
          ? "border-violet-500 text-violet-300"
          : "border-transparent text-gray-500 hover:text-gray-300"
      }`}
    >
      {children}
    </button>
  );
}

function TabPanel({ id, children }: { id: string; children: ReactNode }) {
  const { active } = useTabs();
  if (active !== id) return null;
  return <div role="tabpanel">{children}</div>;
}

Tabs.List = TabList;
Tabs.Tab = Tab;
Tabs.Panel = TabPanel;

// ─── 2. Higher-Order Component ─────────────────────────────────────────────
function withLoadingState<T extends object>(Component: React.ComponentType<T>) {
  return function WithLoading({
    isLoading,
    ...props
  }: T & { isLoading: boolean }) {
    if (isLoading)
      return (
        <div className="animate-pulse text-gray-500 text-sm">
          Loading component…
        </div>
      );
    return <Component {...(props as T)} />;
  };
}

function UserCard({ name, role }: { name: string; role: string }) {
  return (
    <div className="flex items-center gap-3 bg-gray-800 rounded-lg px-4 py-3">
      <div className="w-10 h-10 rounded-full bg-violet-700 flex items-center justify-center text-white font-bold">
        {name[0]}
      </div>
      <div>
        <p className="text-gray-100 font-medium">{name}</p>
        <p className="text-gray-500 text-sm">{role}</p>
      </div>
    </div>
  );
}

const UserCardWithLoading = withLoadingState(UserCard);

// ─── 3. Render Props ────────────────────────────────────────────────────────
function Toggle({
  render,
}: {
  render: (on: boolean, toggle: () => void) => ReactNode;
}) {
  const [on, setOn] = useState(false);
  const toggle = useCallback(() => setOn((v) => !v), []);
  return <>{render(on, toggle)}</>;
}

// ─── 4. Controlled vs Uncontrolled ─────────────────────────────────────────
function ControlledInput() {
  const [value, setValue] = useState("");
  return (
    <div className="space-y-2">
      <label className="text-sm text-gray-400">
        Controlled (React owns value)
      </label>
      <input
        className="input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type here…"
      />
      <p className="text-xs text-gray-600">
        Live value: <code>{value || "(empty)"}</code>
      </p>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────
export default function ComponentPatterns() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        num="01"
        title="Component Patterns"
        desc="Core structural patterns for building reusable, composable UI components."
      />

      {/* Compound Component */}
      <SubSection
        title="Compound Component"
        tip="Use Context to share implicit state between parent and child sub-components. Keeps API ergonomic."
      >
        <Tabs defaultTab="jsx">
          <Tabs.List>
            <Tabs.Tab id="jsx">Preview</Tabs.Tab>
            <Tabs.Tab id="code">Pattern</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel id="jsx">
            <Tabs defaultTab="a">
              <Tabs.List>
                <Tabs.Tab id="a">Tab A</Tabs.Tab>
                <Tabs.Tab id="b">Tab B</Tabs.Tab>
                <Tabs.Tab id="c">Tab C</Tabs.Tab>
              </Tabs.List>
              <Tabs.Panel id="a">
                <p className="text-gray-400 text-sm p-2">Content for Tab A</p>
              </Tabs.Panel>
              <Tabs.Panel id="b">
                <p className="text-gray-400 text-sm p-2">Content for Tab B</p>
              </Tabs.Panel>
              <Tabs.Panel id="c">
                <p className="text-gray-400 text-sm p-2">Content for Tab C</p>
              </Tabs.Panel>
            </Tabs>
          </Tabs.Panel>
          <Tabs.Panel id="code">
            <pre>{`// Compound: parent + children share Context implicitly
<Tabs defaultTab="a">
  <Tabs.List>
    <Tabs.Tab id="a">Tab A</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel id="a">Content A</Tabs.Panel>
</Tabs>

// Key insight: No prop threading — state lives in Context`}</pre>
          </Tabs.Panel>
        </Tabs>
        <ul className="text-sm text-gray-500 list-disc list-inside space-y-1">
          <li>Eliminates prop drilling for tightly related components</li>
          <li>Consumer controls composition / ordering</li>
          <li>
            Throw errors from context consumers that are used outside parent
          </li>
        </ul>
      </SubSection>

      {/* HOC */}
      <SubSection
        title="Higher-Order Component (HOC)"
        tip="Wraps a component to inject cross-cutting concerns (loading, auth, analytics). Prefer custom hooks for logic, HOCs for JSX injection."
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <button
              className="btn-secondary text-sm"
              onClick={() => setIsLoading((v) => !v)}
            >
              Toggle loading: {isLoading ? "ON" : "OFF"}
            </button>
          </div>
          <UserCardWithLoading
            isLoading={isLoading}
            name="Sarah Chen"
            role="Staff Engineer"
          />
        </div>
        <pre>{`function withLoadingState<T extends object>(Component: React.ComponentType<T>) {
  return function WithLoading({ isLoading, ...props }: T & { isLoading: boolean }) {
    if (isLoading) return <Skeleton />;
    return <Component {...(props as T)} />;
  };
}
const UserCardWithLoading = withLoadingState(UserCard);`}</pre>
      </SubSection>

      {/* Render Props */}
      <SubSection
        title="Render Props"
        tip="Pass a function as a prop to share stateful logic. Mostly superseded by custom hooks, but still useful for renderless component APIs."
      >
        <Toggle
          render={(on, toggle) => (
            <div className="flex items-center gap-4">
              <button className="btn-secondary text-sm" onClick={toggle}>
                Toggle: {on ? "✅ ON" : "⬜ OFF"}
              </button>
              {on && (
                <span className="text-green-400 text-sm animate-fade-in">
                  Visible content!
                </span>
              )}
            </div>
          )}
        />
        <pre>{`function Toggle({ render }) {
  const [on, setOn] = useState(false);
  return <>{render(on, () => setOn(v => !v))}</>;
}

<Toggle render={(on, toggle) => (
  <button onClick={toggle}>{on ? 'Hide' : 'Show'}</button>
)}/>`}</pre>
      </SubSection>

      {/* Controlled vs Uncontrolled */}
      <SubSection
        title="Controlled vs Uncontrolled Inputs"
        tip="Controlled = React owns value via state. Uncontrolled = DOM owns value via ref. Prefer controlled for form validation."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ControlledInput />
          <div className="space-y-2">
            <label className="text-sm text-gray-400">
              Uncontrolled (DOM owns value)
            </label>
            <input
              className="input"
              defaultValue="initial"
              ref={(el) => {
                /* access via ref */ void el;
              }}
              placeholder="Not controlled by React"
            />
            <p className="text-xs text-gray-600">
              Use <code>defaultValue</code> + <code>ref</code>
            </p>
          </div>
        </div>
      </SubSection>

      {/* Composition */}
      <SubSection
        title="Composition over Inheritance"
        tip="Prefer composing components via children and props rather than class inheritance or deep coupling."
      >
        <pre>{`// ✅ Composition: slot children into Card
function Card({ children, footer }) {
  return (
    <div className="card">
      {children}
      {footer && <div className="border-t mt-4 pt-4">{footer}</div>}
    </div>
  );
}

// ❌ Avoid: specialized subclasses
class DashboardCard extends BaseCard { ... }`}</pre>
      </SubSection>
    </div>
  );
}
