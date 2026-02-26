import { useState, useMemo, useCallback, type ReactNode } from "react";
import { FixedSizeList as List } from "react-window";

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

// ─── Data ───────────────────────────────────────────────────────────────────
interface Item {
  id: number;
  name: string;
  role: string;
  status: "active" | "inactive";
  score: number;
}
const PAGE_SIZE = 5;
const ALL_ITEMS: Item[] = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name:
    ["Alice", "Bob", "Carlos", "Diana", "Eve", "Frank"][i % 6] + ` ${i + 1}`,
  role: ["Engineer", "Designer", "Manager", "Analyst"][i % 4],
  status: i % 3 === 0 ? "inactive" : "active",
  score: Math.floor(Math.random() * 100),
}));

type SortKey = keyof Pick<Item, "name" | "score" | "role">;
type SortDir = "asc" | "desc";

// ─── Filterable, Sortable, Paginated List ──────────────────────────────────
function ListDemo() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);

  const handleSort = useCallback((key: SortKey) => {
    setSortKey((k) => {
      if (k === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        return key;
      }
      setSortDir("asc");
      return key;
    });
    setPage(1);
  }, []);

  const filtered = useMemo(() => {
    let items = ALL_ITEMS;
    if (status !== "all") items = items.filter((i) => i.status === status);
    if (query)
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(query.toLowerCase()) ||
          i.role.toLowerCase().includes(query.toLowerCase()),
      );
    items = [...items].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp =
        typeof av === "number"
          ? av - (bv as number)
          : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return items;
  }, [query, status, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const SortBtn = ({ col }: { col: SortKey }) => (
    <button
      className="text-gray-400 hover:text-gray-100 ml-1 text-xs"
      onClick={() => handleSort(col)}
    >
      {sortKey === col ? (sortDir === "asc" ? "↑" : "↓") : "⇅"}
    </button>
  );

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex flex-wrap gap-2">
        <input
          className="input text-sm flex-1 min-w-48"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder="Search name or role…"
        />
        <div className="flex gap-1">
          {(["all", "active", "inactive"] as const).map((s) => (
            <button
              key={s}
              className={`btn text-xs ${status === s ? "btn-primary" : "btn-secondary"}`}
              onClick={() => {
                setStatus(s);
                setPage(1);
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="text-gray-500 border-b border-gray-800">
              <th className="py-2 pr-4">
                Name <SortBtn col="name" />
              </th>
              <th className="py-2 pr-4">
                Role <SortBtn col="role" />
              </th>
              <th className="py-2 pr-4">
                Score <SortBtn col="score" />
              </th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-4 text-center text-gray-600">
                  No results found
                </td>
              </tr>
            ) : (
              paged.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-800/50 hover:bg-gray-800/50 transition-colors"
                >
                  <td className="py-2 pr-4 text-gray-200">{item.name}</td>
                  <td className="py-2 pr-4 text-gray-400">{item.role}</td>
                  <td className="py-2 pr-4 text-violet-400 font-mono">
                    {item.score}
                  </td>
                  <td className="py-2">
                    <span
                      className={`badge ${item.status === "active" ? "bg-green-900 text-green-300" : "bg-gray-800 text-gray-500"}`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">
          {filtered.length} results · page {page} of {totalPages}
        </span>
        <div className="flex gap-1">
          <button
            className="btn-secondary text-xs px-3"
            disabled={page === 1}
            onClick={() => setPage(1)}
          >
            ««
          </button>
          <button
            className="btn-secondary text-xs px-3"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ‹
          </button>
          <button
            className="btn-secondary text-xs px-3"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            ›
          </button>
          <button
            className="btn-secondary text-xs px-3"
            disabled={page === totalPages}
            onClick={() => setPage(totalPages)}
          >
            »»
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Virtualized list ───────────────────────────────────────────────────────
const VIRTUAL_DATA = Array.from({ length: 50_000 }, (_, i) => ({
  id: i,
  label: `Row ${i + 1}`,
  score: i * 2,
}));

function VirtualList() {
  return (
    <List
      height={200}
      itemCount={VIRTUAL_DATA.length}
      itemSize={36}
      width="100%"
    >
      {({ index, style }) => (
        <div
          style={style}
          className={`flex items-center gap-4 px-3 text-sm border-b border-gray-800/50 ${index % 2 === 0 ? "bg-gray-900" : "bg-gray-950"}`}
        >
          <span className="text-gray-600 font-mono w-16">
            #{VIRTUAL_DATA[index].id}
          </span>
          <span className="text-gray-300 flex-1">
            {VIRTUAL_DATA[index].label}
          </span>
          <span className="text-violet-400 font-mono">
            {VIRTUAL_DATA[index].score}
          </span>
        </div>
      )}
    </List>
  );
}

export default function ListPatterns() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="mb-8">
        <span className="section-tag">06</span>
        <h1 className="text-white mb-2">List Rendering Patterns</h1>
        <p className="text-gray-400">
          Filtering, sorting, pagination, and virtualization for data-heavy UIs.
        </p>
      </div>

      <SubSection
        title="Filterable + Sortable + Paginated Table"
        tip="All filtering/sorting/pagination derived from state with useMemo. Stable sort handlers with useCallback."
      >
        <ListDemo />
      </SubSection>

      <SubSection
        title="Virtualized List — 50,000 rows"
        tip="Only DOM elements in the viewport are rendered. Scrolling remains smooth regardless of list size."
      >
        <VirtualList />
        <pre>{`import { FixedSizeList } from 'react-window';

<FixedSizeList height={400} itemCount={100_000} itemSize={40} width="100%">
  {({ index, style }) => (
    <div style={style}>Row {index}</div>  // ← must apply style for positioning
  )}
</FixedSizeList>

// For variable heights use VariableSizeList
// For 2D grids use react-window's FixedSizeGrid`}</pre>
      </SubSection>

      <SubSection title="Key Prop Best Practices">
        <pre>{`// ✅ Use stable, unique identifiers
{items.map(item => <Row key={item.id} {...item} />)}

// ❌ Never use array index as key when list can be reordered/filtered
{items.map((item, i) => <Row key={i} {...item} />)}
// This causes React to reuse DOM nodes incorrectly — buggy animations/focus

// ✅ For truly static, non-reorderable lists, index is acceptable
{STATIC_TABS.map((tab, i) => <Tab key={i} {...tab} />)}`}</pre>
      </SubSection>

      <SubSection title="Empty & Loading States">
        <pre>{`// Always handle all data states explicitly:
if (isLoading) return <TableSkeleton rows={5} />;
if (isError)   return <ErrorMessage retry={refetch} />;
if (!data?.length) return (
  <EmptyState
    icon="📭"
    title="No results"
    description="Try adjusting your filters"
    action={<button onClick={clearFilters}>Clear filters</button>}
  />
);
return <DataTable data={data} />;`}</pre>
      </SubSection>
    </div>
  );
}
