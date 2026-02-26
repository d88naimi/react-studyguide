import { useReducer, createContext, useContext, type ReactNode } from "react";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

// ─── Shared ────────────────────────────────────────────────────────────────
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

// ─── 1. Zustand store ──────────────────────────────────────────────────────
interface CartItem {
  id: number;
  name: string;
  qty: number;
  price: number;
}
interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty">) => void;
  removeItem: (id: number) => void;
  updateQty: (id: number, qty: number) => void;
  total: () => number;
  clear: () => void;
}

const SAMPLE_PRODUCTS = [
  { id: 1, name: "TypeScript Handbook", price: 29 },
  { id: 2, name: "React Patterns Book", price: 39 },
  { id: 3, name: "System Design Guide", price: 49 },
];

const useCartStore = create<CartStore>()(
  devtools(
    persist(
      (set, get) => ({
        items: [],
        addItem: (item) =>
          set((s) => {
            const existing = s.items.find((i) => i.id === item.id);
            if (existing)
              return {
                items: s.items.map((i) =>
                  i.id === item.id ? { ...i, qty: i.qty + 1 } : i,
                ),
              };
            return { items: [...s.items, { ...item, qty: 1 }] };
          }),
        removeItem: (id) =>
          set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
        updateQty: (id, qty) =>
          set((s) => ({
            items:
              qty <= 0
                ? s.items.filter((i) => i.id !== id)
                : s.items.map((i) => (i.id === id ? { ...i, qty } : i)),
          })),
        total: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
        clear: () => set({ items: [] }),
      }),
      { name: "cart-storage" },
    ),
  ),
);

function CartDemo() {
  const { items, addItem, removeItem, updateQty, total, clear } =
    useCartStore();
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {SAMPLE_PRODUCTS.map((p) => (
          <button
            key={p.id}
            className="btn-secondary text-xs"
            onClick={() => addItem(p)}
          >
            + {p.name} (${p.price})
          </button>
        ))}
      </div>
      {items.length === 0 ? (
        <p className="text-gray-600 text-sm">Cart is empty.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 bg-gray-800 rounded-lg px-3 py-2 text-sm"
            >
              <span className="flex-1 text-gray-200">{item.name}</span>
              <button
                className="text-gray-500 hover:text-gray-300"
                onClick={() => updateQty(item.id, item.qty - 1)}
              >
                −
              </button>
              <span className="text-gray-300 w-6 text-center">{item.qty}</span>
              <button
                className="text-gray-500 hover:text-gray-300"
                onClick={() => updateQty(item.id, item.qty + 1)}
              >
                +
              </button>
              <span className="text-violet-400 w-16 text-right">
                ${item.price * item.qty}
              </span>
              <button
                className="text-red-500 hover:text-red-400 ml-2"
                onClick={() => removeItem(item.id)}
              >
                ✕
              </button>
            </div>
          ))}
          <div className="flex justify-between items-center pt-2 border-t border-gray-700">
            <span className="text-gray-400 text-sm">Total</span>
            <span className="text-violet-300 font-semibold">${total()}</span>
          </div>
          <button className="btn-danger text-xs" onClick={clear}>
            Clear Cart
          </button>
        </div>
      )}
    </div>
  );
}

// ─── 2. useReducer ─────────────────────────────────────────────────────────
type CountAction =
  | { type: "increment" }
  | { type: "decrement" }
  | { type: "reset" }
  | { type: "setStep"; payload: number };
interface CountState {
  count: number;
  step: number;
}

function countReducer(state: CountState, action: CountAction): CountState {
  switch (action.type) {
    case "increment":
      return { ...state, count: state.count + state.step };
    case "decrement":
      return { ...state, count: state.count - state.step };
    case "reset":
      return { ...state, count: 0 };
    case "setStep":
      return { ...state, step: action.payload };
    default:
      return state;
  }
}

function ReducerDemo() {
  const [state, dispatch] = useReducer(countReducer, { count: 0, step: 1 });
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <button
          className="btn-secondary text-sm"
          onClick={() => dispatch({ type: "decrement" })}
        >
          −
        </button>
        <span className="text-2xl font-mono text-violet-300 w-16 text-center">
          {state.count}
        </span>
        <button
          className="btn-secondary text-sm"
          onClick={() => dispatch({ type: "increment" })}
        >
          +
        </button>
        <button
          className="btn-danger text-xs ml-4"
          onClick={() => dispatch({ type: "reset" })}
        >
          Reset
        </button>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-400">Step:</label>
        {[1, 5, 10].map((s) => (
          <button
            key={s}
            className={`btn text-xs ${state.step === s ? "btn-primary" : "btn-secondary"}`}
            onClick={() => dispatch({ type: "setStep", payload: s })}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── 3. Context ─────────────────────────────────────────────────────────────
type Theme = "dark" | "light" | "purple";
const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (t: Theme) => void;
} | null>(null);
const useTheme = () => {
  const c = useContext(ThemeContext);
  if (!c) throw new Error("No ThemeProvider");
  return c;
};

function ThemedBox() {
  const { theme } = useTheme();
  const styles: Record<Theme, string> = {
    dark: "bg-gray-800 text-gray-100",
    light: "bg-white text-gray-900",
    purple: "bg-violet-900 text-violet-100",
  };
  return (
    <div
      className={`rounded-lg p-4 text-sm font-medium transition-all ${styles[theme]}`}
    >
      Current theme: <strong>{theme}</strong>
    </div>
  );
}

// ThemeContext demo is wired in the parent below

export default function StatePatterns() {
  const [theme, setTheme] = useReducer(
    (_: Theme, t: Theme) => t,
    "dark" as Theme,
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="mb-8">
        <span className="section-tag">02</span>
        <h1 className="text-white mb-2">State Management Patterns</h1>
        <p className="text-gray-400">
          Choosing the right state tool for the right scope.
        </p>
      </div>

      {/* Zustand */}
      <SubSection
        title="Zustand — Global Client State"
        tip="Use for shared UI state: cart, theme, auth, notifications. Lightweight alternative to Redux. Supports devtools + persist middleware."
      >
        <CartDemo />
        <pre>{`const useCartStore = create<CartStore>()(
  devtools(persist((set, get) => ({
    items: [],
    addItem: (item) => set(s => ({
      items: [...s.items, { ...item, qty: 1 }]
    })),
    total: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
  }), { name: 'cart-storage' }))
);`}</pre>
        <ul className="text-sm text-gray-500 list-disc list-inside space-y-1">
          <li>
            Subscribe to slices to avoid re-renders:{" "}
            <code>useStore(s =&gt; s.count)</code>
          </li>
          <li>Keep actions co-located with state</li>
          <li>
            Use <code>immer</code> middleware for complex nested updates
          </li>
        </ul>
      </SubSection>

      {/* useReducer */}
      <SubSection
        title="useReducer — Complex Local State"
        tip="Prefer useReducer when state transitions are complex, have related sub-values, or need to be easy to test in isolation."
      >
        <ReducerDemo />
        <pre>{`type Action = { type: 'increment' } | { type: 'setStep'; payload: number };
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment': return { ...state, count: state.count + state.step };
    case 'setStep':   return { ...state, step: action.payload };
    default:          return state;
  }
}
// ✅ Testable: reducer(initialState, { type: 'increment' })`}</pre>
      </SubSection>

      {/* Context */}
      <ThemeContext.Provider value={{ theme, setTheme }}>
        <SubSection
          title="React Context — Dependency Injection"
          tip="Context is best for low-frequency updates (theme, locale, user). For high-frequency updates use Zustand or a state manager."
        >
          <ThemedBox />
          <div className="flex gap-2">
            {(["dark", "light", "purple"] as Theme[]).map((t) => (
              <button
                key={t}
                className={`btn text-xs ${theme === t ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setTheme(t)}
              >
                {t}
              </button>
            ))}
          </div>
          <pre>{`const ThemeContext = createContext<{ theme: Theme; setTheme: (t: Theme) => void } | null>(null);

// In provider:
<ThemeContext.Provider value={{ theme, setTheme }}>
  {children}
</ThemeContext.Provider>

// Custom hook with null guard:
const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider');
  return ctx;
};`}</pre>
        </SubSection>
      </ThemeContext.Provider>

      {/* State rule of thumb */}
      <SubSection title="State Decision Guide">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-gray-500 border-b border-gray-800">
                <th className="py-2 pr-4">Situation</th>
                <th className="py-2">Tool</th>
              </tr>
            </thead>
            <tbody className="text-gray-300 space-y-2">
              {[
                ["Single component UI state", "useState"],
                ["Complex local transitions", "useReducer"],
                ["Server/async data", "TanStack Query"],
                ["Cross-component UI state", "Zustand (slice)"],
                ["Theme, locale, auth context", "React Context"],
                ["Forms", "React Hook Form (local)"],
                ["URL-derived state", "useSearchParams"],
              ].map(([sit, tool]) => (
                <tr key={sit} className="border-b border-gray-800/50">
                  <td className="py-2 pr-4 text-gray-400">{sit}</td>
                  <td className="py-2">
                    <code>{tool}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SubSection>
    </div>
  );
}
