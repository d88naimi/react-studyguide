import { Link } from "react-router-dom";

const topics = [
  {
    path: "/components",
    num: "01",
    title: "Component Patterns",
    desc: "Compound, HOC, render props, controlled vs uncontrolled, composition",
  },
  {
    path: "/state",
    num: "02",
    title: "State Management",
    desc: "Zustand, useReducer, Context, local vs global, derived state",
  },
  {
    path: "/performance",
    num: "03",
    title: "Performance Optimization",
    desc: "memo, useMemo, useCallback, lazy/Suspense, virtualization",
  },
  {
    path: "/api",
    num: "04",
    title: "API Integration",
    desc: "TanStack Query, optimistic updates, caching, error handling",
  },
  {
    path: "/forms",
    num: "05",
    title: "Form Handling",
    desc: "React Hook Form, Zod validation, async submission, field arrays",
  },
  {
    path: "/lists",
    num: "06",
    title: "List Rendering",
    desc: "Keys, virtualization, filtering, sorting, pagination, infinite scroll",
  },
  {
    path: "/routing",
    num: "07",
    title: "Routing Patterns",
    desc: "Nested routes, protected routes, lazy routes, search params",
  },
  {
    path: "/responsive",
    num: "08",
    title: "Responsive Design",
    desc: "Tailwind breakpoints, custom hooks, container queries",
  },
  {
    path: "/animation",
    num: "09",
    title: "Animation Patterns",
    desc: "Framer Motion, transitions, layout animations, gestures",
  },
  {
    path: "/errors",
    num: "10",
    title: "Error Handling",
    desc: "ErrorBoundary, async errors, fallback UI, retry logic",
  },
  {
    path: "/a11y",
    num: "11",
    title: "Accessibility",
    desc: "ARIA, keyboard nav, focus management, screen reader patterns",
  },
  {
    path: "/testing",
    num: "12",
    title: "Testing Patterns",
    desc: "Vitest, Testing Library, mocking, integration tests",
  },
  {
    path: "/system-design",
    num: "13",
    title: "System Design",
    desc: "Code splitting, module structure, component libraries, scalability",
  },
];

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <span className="badge bg-violet-900 text-violet-300 mb-3">
          Study Guide
        </span>
        <h1 className="text-4xl font-bold text-white mb-2">
          Senior React Engineer Prep
        </h1>
        <p className="text-gray-400 text-lg leading-relaxed">
          Interactive examples covering the 13 core pattern categories employers
          test at the senior level. Each section includes working code, best
          practices, and common interview topics.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {topics.map(({ path, num, title, desc }) => (
          <Link
            key={path}
            to={path}
            className="card hover:border-violet-700 hover:bg-gray-800 transition-all group"
          >
            <div className="flex items-start gap-4">
              <span className="text-2xl font-mono text-violet-500 font-bold w-8 shrink-0 group-hover:text-violet-300 transition-colors">
                {num}
              </span>
              <div>
                <h2 className="text-base font-semibold text-gray-100 mb-1">
                  {title}
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="card bg-violet-950 border-violet-800">
        <h3 className="text-violet-300 font-semibold mb-2">
          Tech Stack Used in This App
        </h3>
        <div className="flex flex-wrap gap-2">
          {[
            "React 19",
            "TypeScript",
            "Vite",
            "React Router v6",
            "Zustand",
            "TanStack Query v5",
            "React Hook Form",
            "Zod",
            "Framer Motion",
            "Tailwind CSS",
            "Vitest",
            "Testing Library",
          ].map((t) => (
            <span key={t} className="badge bg-gray-800 text-gray-300">
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
