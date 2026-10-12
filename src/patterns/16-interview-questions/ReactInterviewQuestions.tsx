type QA = { q: string; a: string };

function QAList({ items }: { items: QA[] }) {
  return (
    <div className="space-y-2">
      {items.map(({ q, a }) => (
        <details
          key={q}
          className="group bg-gray-800 border border-gray-700 rounded-lg px-4 py-3"
        >
          <summary className="cursor-pointer text-sm text-gray-200 font-medium marker:text-violet-500">
            {q}
          </summary>
          <p className="text-sm text-gray-400 mt-2 leading-relaxed">{a}</p>
        </details>
      ))}
    </div>
  );
}

function Category({
  title,
  tip,
  items,
}: {
  title: string;
  tip?: string;
  items: QA[];
}) {
  return (
    <section className="card space-y-4">
      <div>
        <h2 className="text-gray-100">{title}</h2>
        {tip && <p className="text-gray-500 text-sm mt-1">{tip}</p>}
      </div>
      <QAList items={items} />
    </section>
  );
}

const FRESHER_QUESTIONS: QA[] = [
  {
    q: "What is React?",
    a: "A JavaScript library for building component-based UIs. It renders a virtual representation of the DOM and updates the real DOM efficiently when state changes.",
  },
  {
    q: "What are the advantages of using React?",
    a: "A fast virtual-DOM diffing algorithm, a large reusable-component ecosystem, a gentle learning curve for anyone who knows JS, and support for both client and server rendering.",
  },
  {
    q: "What are the limitations of React?",
    a: "It's only the view layer — routing, state management, and data fetching need separate libraries. JSX has a learning curve, and the fast-moving ecosystem means conventions shift often.",
  },
  {
    q: "What is useState() in React?",
    a: "A Hook that adds local state to a function component. It returns a `[value, setValue]` pair; calling the setter schedules a re-render with the new value.",
  },
  {
    q: "What are keys in React?",
    a: "Stable, unique identifiers on list items that let React's reconciler match old and new elements across renders, instead of re-creating the whole list.",
  },
  {
    q: "What is JSX?",
    a: "Syntactic sugar that compiles HTML-like markup into `React.createElement` calls, letting you describe UI structure directly inside JavaScript.",
  },
  {
    q: "What are the differences between functional and class components?",
    a: "Function components use Hooks for state/lifecycle and are plain functions returning JSX. Class components extend `React.Component`, use `this.state`, and implement lifecycle methods like `componentDidMount`.",
  },
  {
    q: "What is the virtual DOM and how does React use it?",
    a: "An in-memory tree of JS objects mirroring the real DOM. React diffs the new tree against the previous one and applies only the minimal set of real DOM mutations needed.",
  },
  {
    q: "What are the differences between controlled and uncontrolled components?",
    a: "A controlled input's value lives in React state and is set via `value`/`onChange`. An uncontrolled input manages its own value in the DOM, read via a ref when needed.",
  },
  {
    q: "What are props in React?",
    a: "Read-only data passed from a parent component to a child, similar to function arguments. A component must never mutate its own props.",
  },
  {
    q: "Explain React state and props",
    a: "Props are immutable and owned by the parent; state is mutable (via its setter) and owned by the component itself. Both trigger a re-render when they change.",
  },
  {
    q: "Explain the types of side effects in a React component",
    a: "Effects that need cleanup (subscriptions, timers, event listeners — return a cleanup function from `useEffect`) and effects that don't (logging, one-off fetches with no teardown needed).",
  },
  {
    q: "What is prop drilling in React?",
    a: "Passing a prop through several intermediate components that don't use it themselves, just to get it to a deeply nested child. Context or a store can avoid it.",
  },
  {
    q: "What are error boundaries?",
    a: "Components that implement `componentDidCatch`/`getDerivedStateFromError` to catch errors thrown during rendering in their child tree and show fallback UI instead of crashing the whole app.",
  },
  {
    q: "What are React Hooks?",
    a: "Functions like `useState` and `useEffect` that let function components use state, lifecycle behavior, and other React features without being written as classes.",
  },
  {
    q: "What rules must be followed when using Hooks?",
    a: "Only call Hooks at the top level of a function component or custom Hook (never inside loops, conditions, or nested functions), and always call them in the same order on every render.",
  },
  {
    q: "What is the use of the useEffect Hook?",
    a: "It runs side effects after render. An optional dependency array controls how often it re-runs, and an optional returned function cleans up before the next run or on unmount.",
  },
  {
    q: "Why do Hooks make use of refs?",
    a: "`useRef` holds a mutable value that persists across renders without causing a re-render when it changes — used for DOM node access, storing timers, or keeping a previous value.",
  },
  {
    q: "What are Custom Hooks?",
    a: "Functions whose name starts with `use` that call other Hooks internally, letting you extract and reuse stateful logic (like a debounce or fetch pattern) across components.",
  },
];

const EXPERIENCED_QUESTIONS: QA[] = [
  {
    q: "How do you build a switching component for rendering different pages?",
    a: "Map route keys to components in a plain object, then render `const Page = routes[key]; return <Page />;` instead of a long if/else or switch chain.",
  },
  {
    q: "How do you re-render a view when the browser is resized?",
    a: "Add a `resize` listener in a `useEffect` that updates state with the new dimensions, and remove the listener in the cleanup function.",
  },
  {
    q: "How do you pass data between sibling components with React Router?",
    a: "Lift the shared state to the nearest common ancestor or route loader, or pass it via URL search params / route state so both siblings can read it independently.",
  },
  {
    q: "How do you perform an automatic redirect after login?",
    a: "Use React Router's `<Navigate to=\"/dashboard\" />` (or `navigate()` from `useNavigate`) once the login request resolves successfully.",
  },
  {
    q: "Do React Hooks work with static typing?",
    a: "Yes — TypeScript infers generic types for `useState`, and you can explicitly type Hooks like `useState<User | null>(null)` or `useRef<HTMLDivElement>(null)`.",
  },
  {
    q: "What is Strict Mode in React?",
    a: "A development-only wrapper (`<StrictMode>`) that intentionally double-invokes some functions and warns about legacy APIs and unsafe lifecycle methods to surface bugs early.",
  },
  {
    q: "How do you prevent unnecessary re-renders in React?",
    a: "Wrap components in `React.memo`, memoize expensive values with `useMemo`, memoize callbacks with `useCallback` so memoized children don't see new prop identities, and colocate state close to where it's used.",
  },
  {
    q: "What are the different ways to style a React component?",
    a: "Inline `style` objects, plain CSS/Sass files, CSS Modules (scoped class names), CSS-in-JS libraries, and utility frameworks like Tailwind.",
  },
  {
    q: "Name a few techniques to optimize React app performance",
    a: "Code-split with `lazy`/`Suspense`, memoize with `useMemo`/`useCallback`/`React.memo`, virtualize long lists, debounce expensive inputs, and keep state as local as possible.",
  },
  {
    q: "How do you pass data between React components?",
    a: "Parent to child via props; child to parent via a callback prop the child invokes; between unrelated components via Context, a store, or lifting state up.",
  },
  {
    q: "What are Higher-Order Components (HOCs)?",
    a: "Functions that take a component and return a new enhanced component, used to share cross-cutting logic (auth checks, data fetching) without duplicating it in each component.",
  },
  {
    q: "What are the different phases of the component lifecycle?",
    a: "Mounting (first render and DOM insertion), updating (re-renders from new props/state), and unmounting (cleanup and removal from the DOM).",
  },
  {
    q: "What are the lifecycle methods of React?",
    a: "For class components: `constructor`, `render`, `componentDidMount`, `componentDidUpdate`, `componentWillUnmount`. Function components express the same timing with `useEffect` and its cleanup.",
  },
  {
    q: "What are the different types of Hooks in React?",
    a: "Basic Hooks (`useState`, `useEffect`, `useContext`), additional Hooks (`useReducer`, `useMemo`, `useCallback`, `useRef`, `useLayoutEffect`), and custom Hooks you write yourself.",
  },
  {
    q: "How do Hooks compare to classes?",
    a: "Hooks let you reuse stateful logic via plain functions instead of HOCs or render props, avoid `this` binding issues, and group related logic together instead of splitting it across lifecycle methods.",
  },
  {
    q: "Do Hooks cover everything classes could do?",
    a: "Almost — `getSnapshotBeforeUpdate` and `componentDidCatch` (error boundaries) still require a class component; there's no Hook equivalent for them yet.",
  },
  {
    q: "What is React Router?",
    a: "The standard client-side routing library for React, mapping URL paths to components and supporting nested routes, dynamic params, and programmatic navigation without full page reloads.",
  },
  {
    q: "Can Hooks replace Redux?",
    a: "For small-to-medium apps, `useState`/`useReducer` plus Context often suffice. Redux (or Zustand) still earns its keep for large apps needing time-travel debugging, middleware, or state shared very widely.",
  },
  {
    q: "Explain conditional rendering in React",
    a: "Rendering different JSX based on a condition, typically with a ternary, `&&` for simple show/hide, or an early `return null` — all plain JavaScript, no special React syntax.",
  },
];

const ARCHITECTURE_QUESTIONS: QA[] = [
  {
    q: "What is reconciliation and how does React's diffing algorithm work?",
    a: "The process of comparing the new element tree to the previous one to compute the minimal DOM mutations. React assumes same-type elements at the same position are related and uses keys to match list children in roughly O(n) time instead of a full tree diff.",
  },
  {
    q: "What is forwardRef, and when do you need it?",
    a: "A way to let a parent attach a ref directly to a DOM node (or imperative handle) inside a child component, since refs don't pass through props like normal values.",
  },
  {
    q: "What is server-side rendering (SSR) and how does it differ from client-side rendering?",
    a: "SSR renders the initial HTML on the server so the user sees content immediately and crawlers can index it; CSR ships a near-empty HTML shell and renders everything via JS in the browser after it loads.",
  },
  {
    q: "How do you manage global state, and how do Context, Redux, and modern alternatives compare?",
    a: "Context is built-in and fine for low-frequency updates shared widely (theme, auth user); Redux adds predictable, debuggable state transitions with middleware for complex apps; libraries like Zustand split the difference with less boilerplate.",
  },
  {
    q: "What are common React performance optimization techniques?",
    a: "Memoization (`memo`/`useMemo`/`useCallback`), code splitting with `lazy`/`Suspense`, list virtualization for long lists, and avoiding unnecessary state updates higher in the tree than needed.",
  },
];

const MODERN_PATTERNS_QUESTIONS: QA[] = [
  {
    q: "What is the Context API, and when should you use it instead of prop drilling?",
    a: "A built-in way to share a value with any descendant without passing it through every intermediate component. Best for data that changes rarely and is needed broadly, like theme or the current user.",
  },
  {
    q: "What is React.memo, and how does it differ from useMemo and useCallback?",
    a: "`React.memo` skips re-rendering a component if its props are shallowly equal to last time. `useMemo` memoizes a computed value; `useCallback` memoizes a function reference — both help `memo` actually take effect.",
  },
  {
    q: "What is useReducer, and when would you use it over useState?",
    a: "A Hook for managing state via a reducer function and dispatched actions — useful when several state fields update together or the next state depends heavily on the previous one.",
  },
  {
    q: "What are React Suspense and React.lazy, and how do they enable code splitting?",
    a: "`lazy()` defers loading a component's code until it's first rendered; `<Suspense>` shows a fallback while that (or any async resource) is still loading, splitting the bundle into smaller chunks.",
  },
  {
    q: "What are React Portals, and when would you use them?",
    a: "`createPortal` renders children into a DOM node outside the parent hierarchy — used for modals, tooltips, and dropdowns that need to escape a parent's `overflow: hidden` or z-index stacking context.",
  },
  {
    q: "What is React.Fragment, and why is it useful?",
    a: "A wrapper (`<>...</>`) that groups multiple children without adding an extra DOM node, useful when a component must return multiple elements but a wrapping `<div>` would break styling or semantics.",
  },
  {
    q: "What is the difference between useEffect and useLayoutEffect?",
    a: "`useEffect` runs asynchronously after the browser paints. `useLayoutEffect` runs synchronously after DOM mutations but before paint — use it only when you need to measure or adjust the DOM before the user sees it, since it can block rendering.",
  },
];

export default function ReactInterviewQuestions() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="mb-8">
        <span className="section-tag">16</span>
        <h1 className="text-white mb-2">React Interview Questions</h1>
        <p className="text-gray-400">
          Conceptual Q&amp;A reference covering core React fundamentals
          through modern Hooks and architecture topics. For hands-on
          exercises, see{" "}
          <span className="text-violet-400">15 · Interview Exercises</span>.
        </p>
      </div>

      <Category
        title="Fundamentals"
        tip="The baseline questions every React interview opens with."
        items={FRESHER_QUESTIONS}
      />

      <Category
        title="Applied & Intermediate"
        tip="Patterns and comparisons that come up once you're past the basics."
        items={EXPERIENCED_QUESTIONS}
      />

      <Category
        title="Architecture & Advanced Concepts"
        tip="Reconciliation, rendering strategies, and state management trade-offs."
        items={ARCHITECTURE_QUESTIONS}
      />

      <Category
        title="Modern Patterns & Performance"
        tip="Context, memoization, Suspense, Portals, and effect timing."
        items={MODERN_PATTERNS_QUESTIONS}
      />
    </div>
  );
}
