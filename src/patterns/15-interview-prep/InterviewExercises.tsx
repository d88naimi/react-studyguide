import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

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

function Gotchas({ items }: { items: string[] }) {
  return (
    <div className="border border-amber-800 bg-amber-950 rounded-lg p-3 text-sm text-amber-300 space-y-1">
      <p className="font-semibold text-amber-200">Gotchas covered</p>
      <ul className="list-disc list-inside space-y-0.5">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

// ─── 1. Debounced search / autocomplete ─────────────────────────────────────
function useDebounced<T>(value: T, ms = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

const FRUITS = [
  "Apple", "Apricot", "Banana", "Blackberry", "Blueberry", "Cherry",
  "Coconut", "Cranberry", "Date", "Dragonfruit", "Fig", "Grape",
  "Grapefruit", "Guava", "Kiwi", "Lemon", "Lime", "Mango", "Melon",
  "Nectarine", "Orange", "Papaya", "Peach", "Pear", "Pineapple", "Plum",
  "Pomegranate", "Raspberry", "Strawberry", "Tangerine", "Watermelon",
];

function searchFruits(query: string, signal: AbortSignal): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const delay = 200 + Math.random() * 400; // simulated variable network latency
    const t = setTimeout(() => {
      resolve(
        FRUITS.filter((f) => f.toLowerCase().includes(query.toLowerCase())),
      );
    }, delay);
    signal.addEventListener("abort", () => {
      clearTimeout(t);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
}

function AutocompleteDemo() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounced(query, 300);
  const [results, setResults] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  // Selecting an option sets `query` to the full match text, which would
  // otherwise re-trigger a search for that exact string once it debounces
  // through and reopen the dropdown. Skip a search only if the debounced
  // value is still the selected one — storing the value (not a one-shot
  // flag) survives the debounce skipping straight past it to a newer value.
  const suppressedValue = useRef<string | null>(null);

  useEffect(() => {
    if (suppressedValue.current === debouncedQuery) {
      suppressedValue.current = null;
      return;
    }
    if (!debouncedQuery) return; // input was cleared — onChange already closed the list
    const ctrl = new AbortController();
    searchFruits(debouncedQuery, ctrl.signal)
      .then((data) => {
        setResults(data);
        setOpen(true);
        setActiveIndex(-1);
      })
      .catch((e) => {
        if (e.name !== "AbortError") throw e;
      });
    // A faster query arriving later aborts this one — the slower response
    // never gets to overwrite newer results.
    return () => ctrl.abort();
  }, [debouncedQuery]);

  function handleQueryChange(v: string) {
    setQuery(v);
    if (!v) {
      setOpen(false);
      setResults([]);
    }
  }

  function selectOption(value: string) {
    suppressedValue.current = value;
    setQuery(value);
    setOpen(false);
    setResults([]);
    inputRef.current?.focus();
  }

  function onKeyDown(e: ReactKeyboardEvent<HTMLInputElement>) {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      selectOption(results[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <Live>
      <div className="relative">
        <label htmlFor="autocomplete-input" className="sr-only">
          Search fruit
        </label>
        <input
          id="autocomplete-input"
          ref={inputRef}
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined
          }
          className="input"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search fruit…"
          autoComplete="off"
        />
        {open && (
          <ul
            id={listboxId}
            role="listbox"
            className="absolute z-10 mt-1 w-full bg-gray-900 border border-gray-700 rounded-lg max-h-48 overflow-y-auto"
          >
            {results.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-500">No matches</li>
            ) : (
              results.map((r, i) => (
                <li
                  key={r}
                  id={`${listboxId}-opt-${i}`}
                  role="option"
                  aria-selected={i === activeIndex}
                  className={`px-3 py-2 text-sm cursor-pointer ${i === activeIndex ? "bg-violet-900 text-violet-200" : "text-gray-300 hover:bg-gray-800"}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectOption(r);
                  }}
                >
                  {r}
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </Live>
  );
}

// ─── 2. Infinite scroll ──────────────────────────────────────────────────────
const PAGE_SIZE = 10;
const TOTAL_ITEMS = 47;

function fetchPage(page: number): Promise<number[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const start = page * PAGE_SIZE;
      const pageItems = Array.from({ length: PAGE_SIZE }, (_, i) => start + i + 1).filter(
        (n) => n <= TOTAL_ITEMS,
      );
      resolve(pageItems);
    }, 500);
  });
}

function InfiniteScrollDemo() {
  const [items, setItems] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const nextPage = useRef(0);
  const loadedPages = useRef(new Set<number>());
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(() => {
    const page = nextPage.current;
    if (loadedPages.current.has(page)) return; // dedupe: ignore a second trigger for a page already in flight/loaded
    loadedPages.current.add(page);
    setLoading(true);
    fetchPage(page).then((newItems) => {
      setItems((prev) => [...prev, ...newItems]);
      setLoading(false);
      if (newItems.length < PAGE_SIZE) setHasMore(false);
      nextPage.current += 1;
    });
  }, []);

  useEffect(() => {
    const el = sentinelRef.current;
    const root = containerRef.current;
    if (!el || !root || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => entries[0].isIntersecting && loadMore(),
      { root, rootMargin: "80px" },
    );
    observer.observe(el);
    return () => observer.disconnect(); // cleanup: stop observing on unmount or when the list ends
  }, [hasMore, loadMore]);

  return (
    <Live>
      <div
        ref={containerRef}
        className="max-h-56 overflow-y-auto border border-gray-700 rounded-lg p-2 space-y-1"
      >
        {items.map((n) => (
          <div key={n} className="text-sm text-gray-300 px-2 py-1 bg-gray-900 rounded">
            Item {n}
          </div>
        ))}
        {hasMore ? (
          <div ref={sentinelRef} className="text-xs text-gray-500 text-center py-2">
            {loading ? "Loading more…" : "Scroll for more"}
          </div>
        ) : (
          <div className="text-xs text-gray-500 text-center py-2">— end of list —</div>
        )}
      </div>
    </Live>
  );
}

// ─── 3. Modal — focus trap, Escape, scroll lock, focus restore ─────────────
function Modal({
  open,
  onClose,
  titleId,
  children,
  triggerRef,
}: {
  open: boolean;
  onClose: () => void;
  titleId: string;
  children: ReactNode;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    const trigger = triggerRef.current; // snapshot now — a ref's .current can change before cleanup runs
    const focusable = dialog?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const first = focusable?.[0];
    const last = focusable?.[focusable.length - 1];
    first?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !focusable || focusable.length === 0) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // lock body scroll while the modal is open

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = originalOverflow;
      trigger?.focus(); // restore focus to whatever opened the modal
    };
  }, [open, onClose, triggerRef]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onMouseDown={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-sm w-full mx-4"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

function ModalDemo() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  // Stable identity so an incidental re-render while the modal is open
  // doesn't re-trigger Modal's focus-trap effect (it depends on onClose).
  const close = useCallback(() => setOpen(false), []);

  return (
    <Live>
      <button ref={triggerRef} className="btn-primary text-sm" onClick={() => setOpen(true)}>
        Open modal
      </button>
      <Modal open={open} onClose={close} titleId={titleId} triggerRef={triggerRef}>
        <h3 id={titleId} className="text-gray-100 mb-2">
          Confirm action
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          Tab cycles within the modal, Escape closes it, the background can&apos;t
          scroll, and focus returns to the trigger button on close.
        </p>
        <div className="flex gap-2 justify-end">
          <button className="btn-secondary text-sm" onClick={close}>
            Cancel
          </button>
          <button className="btn-primary text-sm" onClick={close}>
            Confirm
          </button>
        </div>
      </Modal>
    </Live>
  );
}

// ─── 4. Tabs with roving-tabindex arrow key nav ─────────────────────────────
const TAB_ITEMS = [
  { id: "overview", label: "Overview", content: "High-level summary content goes here." },
  { id: "details", label: "Details", content: "Deeper technical details live in this panel." },
  { id: "history", label: "History", content: "Changelog and version history." },
];

function TabsDemo() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(e: ReactKeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (e.key === "ArrowRight") next = (index + 1) % TAB_ITEMS.length;
    else if (e.key === "ArrowLeft") next = (index - 1 + TAB_ITEMS.length) % TAB_ITEMS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = TAB_ITEMS.length - 1;
    else return;
    e.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus(); // roving tabindex: move DOM focus with the selection
  }

  return (
    <Live>
      <div role="tablist" aria-label="Demo tabs" className="flex gap-1 border-b border-gray-800">
        {TAB_ITEMS.map((tab, i) => (
          <button
            key={tab.id}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={active === i}
            aria-controls={`panel-${tab.id}`}
            tabIndex={active === i ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px ${active === i ? "border-violet-500 text-violet-300" : "border-transparent text-gray-500 hover:text-gray-300"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {TAB_ITEMS.map((tab, i) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={active !== i}
          className="text-sm text-gray-400 p-3"
        >
          {tab.content}
        </div>
      ))}
    </Live>
  );
}

// ─── 5. Countdown / live ticker ─────────────────────────────────────────────
function useCountdown(targetMs: number) {
  const [remaining, setRemaining] = useState(() => Math.max(0, targetMs - Date.now()));

  useEffect(() => {
    let timer: number | undefined;

    function tick() {
      // Always derive from the target timestamp, never decrement a counter —
      // decrementing drifts because setTimeout isn't exact.
      const left = Math.max(0, targetMs - Date.now());
      setRemaining(left);
      if (left > 0) {
        timer = window.setTimeout(tick, 250);
      }
    }

    function onVisibility() {
      if (document.visibilityState === "visible") {
        tick(); // resync immediately and resume ticking
      } else if (timer) {
        clearTimeout(timer); // pause while the tab is hidden — no wasted background work
      }
    }

    tick();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [targetMs]);

  return remaining;
}

function formatRemaining(ms: number) {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60).toString().padStart(2, "0");
  const s = (total % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function CountdownDemo() {
  const [targetMs, setTargetMs] = useState(() => Date.now() + 30_000);
  const remaining = useCountdown(targetMs);

  return (
    <Live>
      <p className="text-3xl font-mono text-gray-100">{formatRemaining(remaining)}</p>
      <p className="text-xs text-gray-500 mt-1">
        {remaining <= 0
          ? "Done!"
          : "Computed from a target timestamp every tick — switch tabs and come back, the time is still accurate."}
      </p>
      <button
        className="btn-secondary text-sm mt-2"
        onClick={() => setTargetMs(Date.now() + 30_000)}
      >
        Restart (30s)
      </button>
    </Live>
  );
}

// ─── 6. Form validation (blur, then change) ─────────────────────────────────
function validateEmail(v: string): string | null {
  if (!v) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email address";
  return null;
}

function useFieldValidation(value: string, validate: (v: string) => string | null) {
  const [touched, setTouched] = useState(false);
  const [dirty, setDirty] = useState(false);
  // Stay quiet until the field is first touched (blurred); after that,
  // validate on every change so the error clears as soon as it's fixed.
  const error = touched || dirty ? validate(value) : null;
  return {
    error,
    onBlur: () => setTouched(true),
    onChange: () => setDirty(true),
  };
}

function ValidatedFormDemo() {
  const [email, setEmail] = useState("");
  const { error, onBlur, onChange } = useFieldValidation(email, validateEmail);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const errorId = useId();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (error) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    setSubmitted(true);
  }

  return (
    <Live>
      <form onSubmit={handleSubmit} noValidate className="space-y-2">
        <label htmlFor="validated-email" className="text-sm text-gray-400 block">
          Email
        </label>
        <input
          id="validated-email"
          className="input"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            onChange();
          }}
          onBlur={onBlur}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          placeholder="you@example.com"
        />
        {error && (
          <p id={errorId} role="alert" className="text-red-400 text-xs">
            {error}
          </p>
        )}
        <button className="btn-primary text-sm" disabled={!!error || submitting}>
          {submitting ? "Submitting…" : "Submit"}
        </button>
        {submitted && <p className="text-green-400 text-sm">Submitted!</p>}
      </form>
    </Live>
  );
}

// ─── 7. Sortable list ────────────────────────────────────────────────────────
type Todo = { id: number; text: string; done: boolean };

function SortableListDemo() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: "Write cover letter", done: true },
    { id: 2, text: "Practice countdown exercise", done: false },
    { id: 3, text: "Review React 19 Actions", done: false },
  ]);
  const [sortBy, setSortBy] = useState<"text" | "done">("text");

  const sorted = useMemo(() => {
    // Derive the sorted view on render — never store a separately-sorted copy
    // that can drift out of sync with the source list.
    return [...todos].sort((a, b) =>
      sortBy === "done" ? Number(a.done) - Number(b.done) : a.text.localeCompare(b.text),
    );
  }, [todos, sortBy]);

  function toggle(id: number) {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  return (
    <Live>
      <div className="flex gap-2 mb-3">
        <button className="btn-secondary text-sm" onClick={() => setSortBy("text")}>
          Sort A–Z
        </button>
        <button className="btn-secondary text-sm" onClick={() => setSortBy("done")}>
          Sort by done
        </button>
      </div>
      <ul className="space-y-1">
        {sorted.map((t) => (
          <li key={t.id} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={t.done}
              onChange={() => toggle(t.id)}
              className="accent-violet-500"
            />
            <span className={t.done ? "line-through text-gray-500" : "text-gray-200"}>
              {t.text}
            </span>
          </li>
        ))}
      </ul>
    </Live>
  );
}

// ─── 8. Star rating ──────────────────────────────────────────────────────────
function StarRating({
  value,
  onChange,
  max = 5,
}: {
  value: number;
  onChange: (v: number) => void;
  max?: number;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const display = hovered ?? value; // hover previews a value without committing it

  return (
    <div
      role="radiogroup"
      aria-label="Rating"
      className="flex gap-1"
      onMouseLeave={() => setHovered(null)}
    >
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          tabIndex={n === (value || 1) ? 0 : -1}
          className="text-2xl leading-none focus:outline-none focus:ring-2 focus:ring-violet-500 rounded"
          onMouseEnter={() => setHovered(n)}
          onFocus={() => setHovered(n)}
          onBlur={() => setHovered(null)}
          onClick={() => onChange(n)}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowUp") {
              e.preventDefault();
              onChange(Math.min(max, (value || 0) + 1));
            } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
              e.preventDefault();
              onChange(Math.max(1, (value || 1) - 1));
            }
          }}
        >
          <span className={n <= display ? "text-amber-400" : "text-gray-700"}>★</span>
        </button>
      ))}
    </div>
  );
}

function StarRatingDemo() {
  const [rating, setRating] = useState(3);
  return (
    <Live>
      <StarRating value={rating} onChange={setRating} />
      <p className="text-sm text-gray-500 mt-2">
        Rated {rating} / 5 — arrow keys adjust, hover previews without committing.
      </p>
    </Live>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function InterviewExercises() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="mb-8">
        <span className="section-tag">15</span>
        <h1 className="text-white mb-2">Live Coding Interview Exercises</h1>
        <p className="text-gray-400">
          The 8 exercises that come up most often in frontend live-coding
          rounds, each built with the gotcha that separates a junior answer
          from a senior one. Practice two of these with a timer and a blank
          file before your interview.
        </p>
      </div>

      <SubSection
        title="1. Debounced search / autocomplete"
        tip="Stale responses, abort, keyboard arrows, combobox roles."
      >
        <AutocompleteDemo />
        <Gotchas
          items={[
            "Debounces input before firing a request (useDebounced)",
            "Cancels the in-flight request on every new keystroke via AbortController",
            "role=\"combobox\" + aria-expanded + aria-activedescendant + role=\"listbox\"/\"option\"",
            "ArrowUp/ArrowDown to move selection, Enter to choose, Escape to close",
          ]}
        />
      </SubSection>

      <SubSection
        title="2. Infinite scroll"
        tip="Intersection observer sentinel, dedupe pages, end of list, cleanup."
      >
        <InfiniteScrollDemo />
        <Gotchas
          items={[
            "IntersectionObserver watches a sentinel element instead of a scroll listener",
            "A loadedPages set prevents double-fetching the same page if the sentinel re-triggers mid-request",
            "Explicit end-of-list state once a short page comes back",
            "observer.disconnect() in the effect cleanup",
          ]}
        />
      </SubSection>

      <SubSection
        title="3. Modal"
        tip="Focus trap, Escape to close, restore focus, lock body scroll."
      >
        <ModalDemo />
        <Gotchas
          items={[
            "Tab/Shift+Tab wraps focus inside the dialog (focus trap)",
            "Escape closes it",
            "document.body.style.overflow is locked while open, restored on close",
            "Focus returns to the trigger button on close",
            "Rendered through a portal so it escapes any parent stacking context",
          ]}
        />
      </SubSection>

      <SubSection
        title="4. Tabs"
        tip="Correct roles, arrow key navigation, one source of truth."
      >
        <TabsDemo />
        <Gotchas
          items={[
            "role=\"tablist\"/\"tab\"/\"tabpanel\" with aria-selected and aria-controls",
            "Roving tabindex: only the active tab is in the Tab order",
            "ArrowLeft/ArrowRight/Home/End move both selection and focus",
            "active index is the single source of truth for both tabs and panels",
          ]}
        />
      </SubSection>

      <SubSection
        title="5. Countdown / live ticker"
        tip="Clear the interval, compute from timestamps to avoid drift, pause when hidden. The most Roobet-flavored one."
      >
        <CountdownDemo />
        <Gotchas
          items={[
            "Each tick recomputes targetMs - Date.now() instead of decrementing a counter, so it can't drift",
            "setTimeout is cleared in the effect cleanup and before every reschedule",
            "visibilitychange pauses ticking in a hidden tab and resyncs instantly on return",
          ]}
        />
      </SubSection>

      <SubSection
        title="6. Form with validation"
        tip="Validate on blur, then on change, tie errors to inputs, disable submit while pending."
      >
        <ValidatedFormDemo />
        <Gotchas
          items={[
            "Silent until first blur, then re-validates on every keystroke after that",
            "aria-invalid and aria-describedby tie the error message to the input",
            "role=\"alert\" announces the error to screen readers",
            "Submit is disabled while invalid and while the simulated request is pending",
          ]}
        />
      </SubSection>

      <SubSection
        title="7. Sortable list"
        tip="Immutable updates, stable keys, derive the sorted list instead of storing it."
      >
        <SortableListDemo />
        <Gotchas
          items={[
            "Sorted view is derived with useMemo, never stored as separate state",
            "Toggling a todo maps to a new array with a new object for that item (no mutation)",
            "key={t.id}, not the array index",
          ]}
        />
      </SubSection>

      <SubSection
        title="8. Star rating"
        tip="Controlled component, keyboard support, hover versus selected state."
      >
        <StarRatingDemo />
        <Gotchas
          items={[
            "Fully controlled: value/onChange from the parent, no internal selected state",
            "Separate hover state previews a rating without committing it",
            "role=\"radiogroup\"/\"radio\" with roving tabindex and arrow-key adjustment",
          ]}
        />
      </SubSection>
    </div>
  );
}
