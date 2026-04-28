import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { path: "/", label: "🏠 Home", end: true },
  { path: "/components", label: "01 · Components" },
  { path: "/state", label: "02 · State Mgmt" },
  { path: "/performance", label: "03 · Performance" },
  { path: "/api", label: "04 · API Integration" },
  { path: "/forms", label: "05 · Form Handling" },
  { path: "/forms/inputs", label: "05b · Input Cheat Sheet" },
  { path: "/lists", label: "06 · List Rendering" },
  { path: "/routing", label: "07 · Routing" },
  { path: "/responsive", label: "08 · Responsive" },
  { path: "/animation", label: "09 · Animation" },
  { path: "/errors", label: "10 · Error Handling" },
  { path: "/a11y", label: "11 · Accessibility" },
  { path: "/testing", label: "12 · Testing" },
  { path: "/system-design", label: "13 · System Design" },
];

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col overflow-y-auto shrink-0">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-lg font-bold text-violet-400">⚛ React Prep</h1>
          <p className="text-xs text-gray-500 mt-1">
            Senior Engineer Study Guide
          </p>
        </div>
        <nav
          className="flex-1 py-3 px-2 space-y-0.5"
          aria-label="Pattern navigation"
        >
          {navItems.map(({ path, label, end }) => (
            <NavLink
              key={path}
              to={path}
              end={end}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-violet-900 text-violet-200 font-medium"
                    : "text-gray-400 hover:bg-gray-800 hover:text-gray-100"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-800 text-xs text-gray-600">
          Built with React 19 + Vite
        </div>
      </aside>

      {/* Main content */}
      <main
        className="flex-1 overflow-y-auto bg-gray-950 p-8"
        id="main-content"
      >
        <Outlet />
      </main>
    </div>
  );
}
