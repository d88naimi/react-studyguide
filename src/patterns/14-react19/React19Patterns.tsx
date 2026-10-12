import {
  createContext,
  useContext,
  useMemo,
  useOptimistic,
  useActionState,
  useId,
  useRef,
  useState,
  Suspense,
  use,
  type ReactNode,
  type Ref,
  type InputHTMLAttributes,
} from "react";
import { useFormStatus } from "react-dom";

// ─── Shared UI (same conventions as other pattern pages) ──────────────────
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

function Live({ children }: { children: ReactNode }) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-2">
      <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">
        Live demo
      </p>
      {children}
    </div>
  );
}

function Gotcha({ children }: { children: ReactNode }) {
  return (
    <div className="border border-amber-800 bg-amber-950 rounded-lg p-3 text-sm text-amber-300 space-y-1">
      <p className="font-semibold text-amber-200">Gotcha</p>
      {children}
    </div>
  );
}

// ─── 1. Actions + useOptimistic + useFormStatus ────────────────────────────
type Comment = { text: string; sending?: boolean };

function SubmitButton() {
  // useFormStatus reads the pending state of the nearest parent <form> —
  // it must be called from a component rendered *inside* that form.
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary text-sm" disabled={pending}>
      {pending ? "Posting…" : "Post"}
    </button>
  );
}

function AddCommentDemo() {
  const [comments, setComments] = useState<Comment[]>([
    { text: "First!" },
  ]);
  const [optimisticComments, addOptimistic] = useOptimistic(
    comments,
    (current, text: string) => [...current, { text, sending: true }],
  );

  async function action(formData: FormData) {
    const text = String(formData.get("text") || "");
    if (!text) return;
    addOptimistic(text);
    await new Promise((r) => setTimeout(r, 700)); // simulated network
    setComments((prev) => [...prev, { text }]);
  }

  return (
    <Live>
      <form action={action} className="flex gap-2">
        <label htmlFor="demo-comment-text" className="sr-only">
          Comment
        </label>
        <input
          id="demo-comment-text"
          name="text"
          className="input"
          placeholder="Write a comment…"
          autoComplete="off"
        />
        <SubmitButton />
      </form>
      <ul className="space-y-1 mt-3">
        {optimisticComments.map((c, i) => (
          <li
            key={i}
            className={`text-sm ${c.sending ? "text-gray-500 italic" : "text-gray-200"}`}
          >
            {c.text} {c.sending && "(sending…)"}
          </li>
        ))}
      </ul>
    </Live>
  );
}

// ─── 2. useActionState ──────────────────────────────────────────────────────
type SubscribeState = { status: "idle" | "error" | "success"; message: string };

async function subscribeAction(
  _prev: SubscribeState,
  formData: FormData,
): Promise<SubscribeState> {
  await new Promise((r) => setTimeout(r, 600)); // simulated server round trip
  const email = String(formData.get("email") || "");
  if (!email.includes("@")) {
    return { status: "error", message: "Enter a valid email address" };
  }
  return { status: "success", message: `Subscribed ${email}` };
}

function SubscribeDemo() {
  const [state, formAction, isPending] = useActionState<
    SubscribeState,
    FormData
  >(subscribeAction, {
    status: "idle",
    message: "",
  });

  return (
    <Live>
      <form action={formAction} className="flex gap-2" noValidate>
        <label htmlFor="demo-subscribe-email" className="sr-only">
          Email
        </label>
        <input
          id="demo-subscribe-email"
          name="email"
          type="email"
          className="input"
          placeholder="you@example.com"
          autoComplete="off"
        />
        <button className="btn-primary text-sm" disabled={isPending}>
          {isPending ? "Checking…" : "Subscribe"}
        </button>
      </form>
      {state.status !== "idle" && (
        <p
          role="status"
          aria-live="polite"
          className={`text-sm mt-2 ${state.status === "error" ? "text-red-400" : "text-green-400"}`}
        >
          {state.message}
        </p>
      )}
    </Live>
  );
}

// ─── 3. use() + Suspense ────────────────────────────────────────────────────
function fetchUser(id: number) {
  return new Promise<{ id: number; name: string }>((resolve) =>
    setTimeout(
      () => resolve({ id, name: id === 1 ? "Ada Lovelace" : "Alan Turing" }),
      800,
    ),
  );
}

function UserCard({ userPromise }: { userPromise: Promise<{ id: number; name: string }> }) {
  const user = use(userPromise); // suspends the tree until the promise resolves
  return <p className="text-gray-200">👤 {user.name}</p>;
}

function UseHookDemo() {
  const [id, setId] = useState(1);
  // Created with useMemo, keyed on id — NOT created fresh on every render,
  // which is the #1 mistake with use(): a brand-new promise on every
  // re-render never resolves in time and loops the Suspense fallback forever.
  const userPromise = useMemo(() => fetchUser(id), [id]);

  return (
    <Live>
      <div className="flex gap-2 mb-3">
        <button className="btn-secondary text-sm" onClick={() => setId(1)}>
          User 1
        </button>
        <button className="btn-secondary text-sm" onClick={() => setId(2)}>
          User 2
        </button>
      </div>
      <Suspense fallback={<p className="text-gray-500 text-sm">Loading…</p>}>
        <UserCard userPromise={userPromise} />
      </Suspense>
    </Live>
  );
}

// ─── 4. ref as a prop (no forwardRef) ───────────────────────────────────────
function TextField({
  ref,
  label,
  id,
  ...props
}: { ref?: Ref<HTMLInputElement>; label: string } & InputHTMLAttributes<HTMLInputElement>) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <div>
      <label htmlFor={inputId} className="text-sm text-gray-400 block mb-1">
        {label}
      </label>
      <input id={inputId} ref={ref} className="input" {...props} />
    </div>
  );
}

function RefAsPropDemo() {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <Live>
      <TextField
        ref={inputRef}
        label="Focus me programmatically"
        placeholder="Click the button…"
      />
      <button
        className="btn-secondary text-sm mt-2"
        onClick={() => inputRef.current?.focus()}
      >
        Focus input
      </button>
    </Live>
  );
}

// ─── 5. Context as a provider ───────────────────────────────────────────────
const ThemeContext = createContext<"light" | "dark">("dark");

function ThemeBadge() {
  const theme = useContext(ThemeContext);
  return (
    <span className="badge bg-gray-800 text-gray-300">theme: {theme}</span>
  );
}

function ContextProviderDemo() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  return (
    <Live>
      <ThemeContext value={theme}>
        <div className="flex items-center gap-3">
          <ThemeBadge />
          <button
            className="btn-secondary text-sm"
            onClick={() =>
              setTheme((t) => (t === "dark" ? "light" : "dark"))
            }
          >
            Toggle theme
          </button>
        </div>
      </ThemeContext>
    </Live>
  );
}

// ─── 6. Document metadata hoisting ──────────────────────────────────────────
function DocumentMetadataDemo() {
  const [active, setActive] = useState(false);
  return (
    <Live>
      <button
        className="btn-secondary text-sm"
        onClick={() => setActive((a) => !a)}
      >
        {active ? "Remove <title> override" : "Render a <title> here"}
      </button>
      {active && <title>React 19 Tips — overridden title!</title>}
      <p className="text-gray-500 text-sm mt-2">
        Check the browser tab — React hoisted that <code>&lt;title&gt;</code>{" "}
        straight to <code>&lt;head&gt;</code> on its own, no portal or helmet
        library involved. Works for <code>&lt;meta&gt;</code> and{" "}
        <code>&lt;link&gt;</code> too.
      </p>
    </Live>
  );
}

export default function React19Patterns() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="mb-8">
        <span className="section-tag">14</span>
        <h1 className="text-white mb-2">React 19 Tips &amp; Tricks</h1>
        <p className="text-gray-400">
          React 19 makes async work a first-class citizen: Actions, optimistic
          updates, and the <code>use</code> API replace most hand-rolled
          loading/error/data state.
        </p>
      </div>

      <SubSection title="Feature Overview">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="text-gray-500 border-b border-gray-800">
              <th className="py-2 pr-4">Feature</th>
              <th className="py-2 pr-4">What it does</th>
              <th className="py-2">Reach for it when</th>
            </tr>
          </thead>
          <tbody>
            {[
              [
                "Actions + useTransition",
                "Async functions run inside transitions with pending state handled for you",
                "Form submits and mutations",
              ],
              [
                "useActionState",
                "Returns state, a form action, and an isPending flag for one action",
                "A form that submits and shows a result or error",
              ],
              [
                "useFormStatus",
                "A child of a form reads that form's pending state",
                "A submit button that disables itself without prop drilling",
              ],
              [
                "useOptimistic",
                "Shows the expected result instantly, reverts if the request fails",
                "Likes, chat sends, adding a row to a list",
              ],
              [
                "use",
                "Reads a promise or context during render, can sit inside conditionals",
                "Reading data under Suspense, reading context after an early return",
              ],
              [
                "ref as a prop",
                "Function components receive ref directly — forwardRef is no longer needed",
                "Any reusable input or button component",
              ],
              [
                "Context as a provider",
                "Render <Context value={x}> instead of <Context.Provider value={x}>",
                "Every new context",
              ],
              [
                "Document metadata",
                "<title>, <meta>, <link> rendered in a component hoist to <head>",
                "Per-page SEO without a helper library",
              ],
              [
                "Server Components / Actions",
                "Components that run only on the server, plus 'use server' functions callable from the client",
                "Next.js-style apps, less client JavaScript",
              ],
              [
                "Activity (19.2)",
                "Hides UI but keeps its state, lowers update priority while hidden",
                "Tabs, sidebars, wizards that should keep their state",
              ],
              [
                "useEffectEvent (19.2)",
                "Pulls event-like logic out of an Effect so it stops forcing re-subscriptions",
                "An Effect that reads the latest props without resubscribing",
              ],
              [
                "React Compiler",
                "Build-time automatic memoization",
                "Replacing most hand-written useMemo, useCallback, memo",
              ],
            ].map(([feature, what, when]) => (
              <tr key={feature} className="border-b border-gray-800/50">
                <td className="py-2 pr-4 font-medium text-gray-200">
                  {feature}
                </td>
                <td className="py-2 pr-4 text-gray-400">{what}</td>
                <td className="py-2 text-gray-500">{when}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-gray-500 text-sm">
          React 19 also shipped clearer error reporting:{" "}
          <code>onCaughtError</code>, <code>onUncaughtError</code>, and{" "}
          <code>onRecoverableError</code> on <code>createRoot</code>, plus a
          single, clearer hydration-mismatch message.
        </p>
      </SubSection>

      <SubSection
        title="Actions + useOptimistic + useFormStatus"
        tip="addOptimistic() updates the UI immediately; the real list state replaces it once the simulated request resolves."
      >
        <AddCommentDemo />
      </SubSection>

      <SubSection
        title="useActionState"
        tip="One hook replaces hand-rolled isPending/error/data state for a single form action."
      >
        <SubscribeDemo />
      </SubSection>

      <SubSection
        title="use() with Suspense"
        tip="use() reads a promise (or context) during render and can sit inside conditionals, unlike regular hooks."
      >
        <UseHookDemo />
        <Gotcha>
          Pass a promise created outside render (via <code>useMemo</code>, a
          cache, or a Server Component) — never a promise created fresh
          inline, which restarts on every render and never resolves in time.
        </Gotcha>
      </SubSection>

      <SubSection
        title="ref as a prop"
        tip="Function components can declare ref as a regular prop now — forwardRef is no longer required for reusable components."
      >
        <RefAsPropDemo />
      </SubSection>

      <SubSection
        title="Context as a provider"
        tip="Render the context object directly as a JSX element instead of Context.Provider."
      >
        <ContextProviderDemo />
      </SubSection>

      <SubSection
        title="Document metadata hoisting"
        tip="<title>, <meta>, and <link> rendered anywhere in the tree are hoisted into <head> automatically."
      >
        <DocumentMetadataDemo />
      </SubSection>

      <SubSection title="useEffectEvent (19.2) — the interview favorite">
        <pre>{`function Room({ roomId, theme }) {
  // onConnected always sees the latest theme, but reading it here
  // does NOT add theme to the Effect's dependency array.
  const onConnected = useEffectEvent(() => showToast('Connected', theme));

  useEffect(() => {
    const conn = createConnection(roomId);
    conn.on('connected', onConnected);
    conn.connect();
    return () => conn.disconnect();
  }, [roomId]); // theme changes no longer reconnect
}`}</pre>
        <p className="text-gray-500 text-sm">
          Reach for <code>useEffectEvent</code> when an Effect needs the
          latest value but shouldn't re-run because of it — not an eslint
          disable comment on the dependency array.
        </p>
      </SubSection>

      <SubSection title="Do This, Not That">
        <ul className="space-y-2 text-sm text-gray-400 list-disc list-inside">
          <li>
            Do use Actions for mutations. Not a pile of{" "}
            <code>useState</code> for loading, error, and data.
          </li>
          <li>
            Do pass a promise created outside render (or from a cache) to{" "}
            <code>use</code>. Not a promise created inside the component.
          </li>
          <li>
            Do reach for <code>useEffectEvent</code> when an Effect needs the
            latest value but should not re-run. Not an eslint-disable on the
            dependency array.
          </li>
          <li>
            Do turn on the React Compiler for new code. Not{" "}
            <code>useMemo</code> on everything by habit — keep manual
            memoization only where the compiler skips a component or you need
            a stable value for an Effect dependency.
          </li>
          <li>
            Do name the tradeoff for <code>Activity</code>: hidden trees keep
            their state and their effects are cleaned up while hidden, so you
            pay in memory for what you preserve.
          </li>
        </ul>
      </SubSection>
    </div>
  );
}
