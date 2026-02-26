# ⚛ React Senior Engineer Study Guide

An interactive study app covering **13 core pattern categories** tested at the senior React engineer level. Built with the actual tools you'd use in a production SaaS codebase.

## 🚀 Getting Started

```bash
npm install
npm run dev        # http://localhost:5173
npm run test       # run Vitest
npm run build      # production build
```

## 📚 Study Sections

| #   | Section            | Key Topics                                              |
| --- | ------------------ | ------------------------------------------------------- |
| 01  | Component Patterns | Compound, HOC, Render Props, Controlled/Uncontrolled    |
| 02  | State Management   | Zustand, useReducer, Context, state decision guide      |
| 03  | Performance        | memo, useMemo, useCallback, lazy/Suspense, react-window |
| 04  | API Integration    | TanStack Query, optimistic updates, error handling      |
| 05  | Form Handling      | React Hook Form, Zod validation, field arrays           |
| 06  | List Rendering     | Filter/sort/paginate, virtualization (100k rows)        |
| 07  | Routing            | Nested routes, protected routes, search params          |
| 08  | Responsive         | Tailwind breakpoints, useWindowSize, adaptive layouts   |
| 09  | Animation          | Framer Motion, AnimatePresence, layout, springs         |
| 10  | Error Handling     | ErrorBoundary, async states, global error handlers      |
| 11  | Accessibility      | ARIA, keyboard nav, focus trap, live regions            |
| 12  | Testing            | Vitest + Testing Library, hooks, API mocking            |
| 13  | System Design      | Folder structure, architecture, performance budgets     |

## 🛠 Tech Stack

- **React 19** + **TypeScript 5.9**
- **Vite 7** — build tool
- **React Router v6** — routing patterns
- **Zustand 5** — global state
- **TanStack Query v5** — server state
- **React Hook Form v7** + **Zod** — forms
- **Framer Motion v11** — animations
- **Tailwind CSS v3** — styling
- **Vitest v4** + **Testing Library** — testing
- **react-window** — virtualization

## 📁 Project Structure

```
src/
├── components/         # Shared layout components
├── pages/             # Home page
├── patterns/          # 13 study sections
│   ├── 01-components/
│   ├── 02-state/
│   └── ...
└── test/              # Vitest setup
```

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
