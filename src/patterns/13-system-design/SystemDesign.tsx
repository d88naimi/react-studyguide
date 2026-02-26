import { type ReactNode } from "react";

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

function DiagramBox({
  label,
  sub,
  color = "bg-gray-800 border-gray-700",
}: {
  label: string;
  sub?: string;
  color?: string;
}) {
  return (
    <div className={`border rounded-lg p-3 text-center ${color}`}>
      <p className="text-sm font-medium text-gray-200">{label}</p>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function SystemDesign() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="mb-8">
        <span className="section-tag">13</span>
        <h1 className="text-white mb-2">Frontend System Design</h1>
        <p className="text-gray-400">
          Scalable architecture, folder structures, code splitting, and
          performance budgets.
        </p>
      </div>

      <SubSection
        title="Scalable Folder Structure"
        tip="Feature-based organization scales better than type-based. Each feature is self-contained."
      >
        <pre>{`src/
├── api/                   # centralized API layer
│   ├── client.ts          # axios instance, interceptors
│   ├── endpoints.ts       # all API URLs
│   └── types.ts           # API response types
├── assets/                # images, fonts
├── components/            # shared/pure UI components
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   └── index.ts       # barrel export
│   └── Modal/
├── features/              # feature modules (vertical slices)
│   ├── auth/
│   │   ├── components/    # auth-specific components
│   │   ├── hooks/         # useAuth, usePermission
│   │   ├── store.ts       # auth Zustand slice
│   │   └── index.ts
│   ├── dashboard/
│   └── users/
├── hooks/                 # shared custom hooks
├── pages/                 # route-level components
├── store/                 # global Zustand store
├── types/                 # shared TypeScript types
└── utils/                 # pure utility functions`}</pre>
      </SubSection>

      <SubSection title="Layered Architecture">
        <div className="grid grid-cols-1 gap-2">
          <DiagramBox
            label="Pages / Routes"
            sub="Compose features, handle routing"
            color="bg-blue-950 border-blue-800"
          />
          <DiagramBox
            label="Feature Components"
            sub="Business logic, local state, API calls"
            color="bg-violet-950 border-violet-800"
          />
          <DiagramBox
            label="Shared Components"
            sub="Pure UI, no business logic"
            color="bg-green-950 border-green-800"
          />
          <DiagramBox
            label="Custom Hooks"
            sub="Reusable stateful logic"
            color="bg-yellow-950 border-yellow-800"
          />
          <DiagramBox
            label="API Layer"
            sub="All network calls, Zod validation"
            color="bg-red-950 border-red-800"
          />
          <DiagramBox
            label="Global Store (Zustand)"
            sub="Client-only shared state"
            color="bg-orange-950 border-orange-800"
          />
        </div>
      </SubSection>

      <SubSection title="Custom API Client">
        <pre>{`// src/api/client.ts
import axios from 'axios';
import { useAuthStore } from '../features/auth/store';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10_000,
});

client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = \`Bearer \${token}\`;
  return config;
});

client.interceptors.response.use(
  response => response,
  async (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);`}</pre>
      </SubSection>

      <SubSection title="Component Design Rules">
        <pre>{`// ✅ Single Responsibility — one thing done well
// ✅ Max 200 lines per component — extract if larger
// ✅ Props interface always typed and documented
// ✅ No business logic in presentational components
// ✅ Export from barrel index.ts for clean imports

// ❌ Avoid prop drilling beyond 2 levels
// ❌ Never call fetch/axios directly in components
// ❌ Never put API types directly in component files

// Component size guide:
// < 50 lines   → atom (Button, Badge, Input)
// 50-150 lines → molecule (SearchBar, UserCard)
// 150-300 lines → organism (UserTable, Header)
// 300+ lines   → split into smaller components`}</pre>
      </SubSection>

      <SubSection title="Performance Budget">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-gray-500 border-b border-gray-800">
                <th className="py-2 pr-4">Metric</th>
                <th className="py-2 pr-4">Target</th>
                <th className="py-2">Tool</th>
              </tr>
            </thead>
            <tbody>
              {[
                [
                  "Initial JS bundle",
                  "< 150 KB gzipped",
                  "vite-bundle-visualizer",
                ],
                [
                  "Largest Contentful Paint",
                  "< 2.5s",
                  "Lighthouse / Web Vitals",
                ],
                ["Total Blocking Time", "< 200ms", "Lighthouse"],
                ["Cumulative Layout Shift", "< 0.1", "Core Web Vitals"],
                ["API response time", "< 200ms p95", "Datadog / New Relic"],
                ["Component render time", "< 16ms", "React Profiler"],
              ].map(([metric, target, tool]) => (
                <tr key={metric} className="border-b border-gray-800/50">
                  <td className="py-2 pr-4 text-gray-300">{metric}</td>
                  <td className="py-2 pr-4 text-violet-400 font-mono text-xs">
                    {target}
                  </td>
                  <td className="py-2 text-gray-500 text-xs">{tool}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SubSection>

      <SubSection title="State Architecture Decision Tree">
        <pre>{`Is the data from the server?
  └─ YES → TanStack Query (useQuery / useMutation)

Is it URL-representable (filters, pagination)?
  └─ YES → useSearchParams

Is it form state?
  └─ YES → React Hook Form

Is it needed across multiple unrelated components?
  └─ YES → Zustand store

Is it complex local state with many transitions?
  └─ YES → useReducer

Otherwise → useState`}</pre>
      </SubSection>

      <SubSection title="Senior Engineer Checklist">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {[
            [
              "📐 Clear folder structure",
              "Feature-based, self-contained modules",
            ],
            [
              "🔒 Type safety end-to-end",
              "Zod at API boundaries, infer TS types",
            ],
            ["⚡ Code splitting", "Route-level lazy loading by default"],
            [
              "♻ Reusable API layer",
              "Centralized, tested, interceptor-equipped",
            ],
            ["🧪 80%+ test coverage", "Critical paths fully tested"],
            [
              "📊 Error observability",
              "Sentry + logging on every error boundary",
            ],
            [
              "🎨 Design token system",
              "Tailwind theme config as single source",
            ],
            ["🔍 Performance monitoring", "Web Vitals tracked in production"],
            ["📚 Component documentation", "Storybook for shared components"],
            ["🔄 CI/CD pipeline", "Lint + test + build on every PR"],
          ].map(([t, d]) => (
            <div key={t as string} className="bg-gray-800 rounded-lg p-3">
              <p className="text-gray-200 font-medium">{t}</p>
              <p className="text-gray-500 mt-0.5">{d}</p>
            </div>
          ))}
        </div>
      </SubSection>
    </div>
  );
}
