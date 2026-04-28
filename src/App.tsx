import { lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";

// Lazy-loaded pattern pages (demonstrates code splitting / pattern #3, #13)
const ComponentPatterns = lazy(
  () => import("./patterns/01-components/ComponentPatterns"),
);
const StatePatterns = lazy(() => import("./patterns/02-state/StatePatterns"));
const PerformancePatterns = lazy(
  () => import("./patterns/03-performance/PerformancePatterns"),
);
const ApiPatterns = lazy(() => import("./patterns/04-api/ApiPatterns"));
const FormPatterns = lazy(() => import("./patterns/05-forms/FormPatterns"));
const InputCheatsheet = lazy(() => import("./patterns/05-forms/InputCheatsheet"));
const ListPatterns = lazy(() => import("./patterns/06-lists/ListPatterns"));
const RoutingPatterns = lazy(
  () => import("./patterns/07-routing/RoutingPatterns"),
);
const ResponsivePatterns = lazy(
  () => import("./patterns/08-responsive/ResponsivePatterns"),
);
const AnimationPatterns = lazy(
  () => import("./patterns/09-animation/AnimationPatterns"),
);
const ErrorPatterns = lazy(() => import("./patterns/10-errors/ErrorPatterns"));
const A11yPatterns = lazy(() => import("./patterns/11-a11y/A11yPatterns"));
const TestingPatterns = lazy(
  () => import("./patterns/12-testing/TestingPatterns"),
);
const SystemDesign = lazy(
  () => import("./patterns/13-system-design/SystemDesign"),
);

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="components" element={<ComponentPatterns />} />
        <Route path="state" element={<StatePatterns />} />
        <Route path="performance" element={<PerformancePatterns />} />
        <Route path="api" element={<ApiPatterns />} />
        <Route path="forms" element={<FormPatterns />} />
        <Route path="forms/inputs" element={<InputCheatsheet />} />
        <Route path="lists" element={<ListPatterns />} />
        <Route path="routing" element={<RoutingPatterns />} />
        <Route path="responsive" element={<ResponsivePatterns />} />
        <Route path="animation" element={<AnimationPatterns />} />
        <Route path="errors" element={<ErrorPatterns />} />
        <Route path="a11y" element={<A11yPatterns />} />
        <Route path="testing" element={<TestingPatterns />} />
        <Route path="system-design" element={<SystemDesign />} />
      </Route>
    </Routes>
  );
}

export default App;
