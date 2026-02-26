import {
  useState,
  useRef,
  useEffect,
  type ReactNode,
  type KeyboardEvent,
} from "react";

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

// ─── 1. Keyboard Navigation ───────────────────────────────────────────────────
const FRUITS = ["Apple", "Banana", "Cherry", "Date", "Elderberry", "Fig"];

function KeyboardListbox() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, FRUITS.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        setIsOpen(false);
        btnRef.current?.focus();
        break;
      case "Escape":
        setIsOpen(false);
        btnRef.current?.focus();
        break;
    }
  };

  useEffect(() => {
    if (isOpen) {
      const items = listRef.current?.querySelectorAll('[role="option"]');
      (items?.[selectedIndex] as HTMLElement)?.focus();
    }
  }, [isOpen, selectedIndex]);

  return (
    <div className="relative w-64">
      <button
        ref={btnRef}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="btn-secondary w-full justify-between text-sm"
        onClick={() => setIsOpen((v) => !v)}
      >
        {FRUITS[selectedIndex]}
        <span aria-hidden="true">{isOpen ? "▲" : "▼"}</span>
      </button>
      {isOpen && (
        <ul
          ref={listRef}
          role="listbox"
          aria-label="Select a fruit"
          className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden"
          onKeyDown={handleKeyDown}
        >
          {FRUITS.map((fruit, i) => (
            <li
              key={fruit}
              role="option"
              tabIndex={-1}
              aria-selected={selectedIndex === i}
              className={`px-4 py-2 text-sm cursor-pointer outline-none focus:bg-violet-900 ${
                selectedIndex === i
                  ? "bg-violet-900 text-violet-200"
                  : "text-gray-300 hover:bg-gray-700"
              }`}
              onClick={() => {
                setSelectedIndex(i);
                setIsOpen(false);
                btnRef.current?.focus();
              }}
            >
              {fruit}
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-gray-600 mt-2">
        Use ↑ ↓ arrow keys, Enter to select, Escape to close
      </p>
    </div>
  );
}

// ─── 2. Focus Trap (Modal) ────────────────────────────────────────────────────
function FocusTrapModal({ onClose }: { onClose: () => void }) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const first = focusable?.[0];
    const last = focusable?.[focusable.length - 1];
    first?.focus();

    const trap = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Tab") {
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      }
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", trap);
    return () => document.removeEventListener("keydown", trap);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-80 shadow-2xl space-y-4"
      >
        <h2 id="modal-title" className="text-gray-100 font-semibold">
          Accessible Modal
        </h2>
        <p className="text-gray-400 text-sm">
          Tab is trapped inside. Press Escape to close.
        </p>
        <input className="input text-sm" placeholder="Focus cycles here…" />
        <div className="flex gap-2">
          <button className="btn-secondary text-sm flex-1">Cancel</button>
          <button className="btn-primary text-sm flex-1" onClick={onClose}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── 3. Live regions ──────────────────────────────────────────────────────────
function LiveRegionDemo() {
  const [message, setMessage] = useState("");
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {[
          "File saved",
          "Error: Permission denied",
          "User invited successfully",
        ].map((m) => (
          <button
            key={m}
            className="btn-secondary text-xs"
            onClick={() => setMessage(m)}
          >
            {m.split(":")[0]}
          </button>
        ))}
      </div>
      {/* aria-live announces changes to screen readers without focus change */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="bg-gray-800 rounded-lg px-4 py-2 text-sm text-gray-300 min-h-8"
      >
        {message || (
          <span className="text-gray-600">
            Announcements appear here (aria-live region)
          </span>
        )}
      </div>
    </div>
  );
}

export default function A11yPatterns() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Skip link */}
      <a
        href="#main-a11y-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 btn-primary z-50"
      >
        Skip to main content
      </a>

      <div className="mb-8" id="main-a11y-content">
        <span className="section-tag">11</span>
        <h1 className="text-white mb-2">Accessibility Patterns</h1>
        <p className="text-gray-400">
          ARIA roles, keyboard navigation, focus management, and live regions.
        </p>
      </div>

      <SubSection
        title="Keyboard-Navigable Listbox"
        tip="Custom dropdowns must implement keyboard navigation manually to replace native select behavior."
      >
        <KeyboardListbox />
      </SubSection>

      <SubSection
        title="Focus Trap (Modal Dialog)"
        tip="When a modal opens, trap focus inside it. Return focus to trigger element on close. Use role='dialog' and aria-modal='true'."
      >
        <button
          className="btn-primary text-sm"
          onClick={() => setModalOpen(true)}
        >
          Open Accessible Modal
        </button>
        {modalOpen && <FocusTrapModal onClose={() => setModalOpen(false)} />}
      </SubSection>

      <SubSection
        title="Live Regions (Screen Reader Announcements)"
        tip="Use aria-live='polite' for non-critical updates. Use aria-live='assertive' only for critical errors that interrupt the user."
      >
        <LiveRegionDemo />
        <pre>{`// Toast/notification updates:
<div aria-live="polite" aria-atomic="true">
  {notification}  {/* Screen reader announces changes */}
</div>

// Error messages:
<div role="alert">  {/* Implicitly aria-live="assertive" */}
  {errorMessage}
</div>`}</pre>
      </SubSection>

      <SubSection title="ARIA Best Practices">
        <pre>{`// ✅ Use semantic HTML first — ARIA is a fallback:
<button>Submit</button>          // ✅ native
<div role="button" tabIndex={0}> // ❌ avoid if possible

// ✅ Label every interactive element:
<button aria-label="Close modal">✕</button>
<input aria-describedby="email-hint" />
<p id="email-hint">We'll never share your email</p>

// ✅ Form error association:
<input aria-invalid={!!error} aria-describedby="name-error" />
{error && <p id="name-error" role="alert">{error}</p>}

// ✅ Loading state:
<button aria-busy={isLoading} disabled={isLoading}>
  {isLoading ? 'Saving…' : 'Save'}
</button>

// ✅ Expanded state:
<button aria-expanded={isOpen} aria-controls="dropdown-menu">
  Menu
</button>`}</pre>
      </SubSection>

      <SubSection title="A11y Checklist">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          {[
            ["⌨ Keyboard accessible", "All interactions work without mouse"],
            ["🎨 Color contrast", "AA: 4.5:1 normal, 3:1 large text"],
            ["🏷 Labels", "Every input, button, icon has a label"],
            ["🔍 Focus indicators", "Visible focus ring on all elements"],
            ["📢 Live regions", "Dynamic updates announced to SR"],
            ["🔗 Skip links", "Skip to main content link"],
            ["🖼 Alt text", "Meaningful alt for images"],
            ["📋 Form errors", "Errors linked to inputs via aria-describedby"],
          ].map(([title, desc]) => (
            <div key={title as string} className="bg-gray-800 rounded-lg p-3">
              <p className="text-gray-200 text-xs font-medium">{title}</p>
              <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </SubSection>
    </div>
  );
}
