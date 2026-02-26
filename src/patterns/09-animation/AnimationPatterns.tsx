import { useState, type ReactNode } from "react";
import {
  motion,
  AnimatePresence,
  useSpring,
  useTransform,
} from "framer-motion";

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

// ─── Shared variants ─────────────────────────────────────────────────────────
const FADE_UP = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

const LIST_CONTAINER = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

// ─── 1. AnimatePresence — Conditional mount ──────────────────────────────────
function MountDemo() {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-3">
      <button
        className="btn-primary text-sm"
        onClick={() => setShow((v) => !v)}
      >
        {show ? "Hide" : "Show"} element
      </button>
      <AnimatePresence>
        {show && (
          <motion.div
            key="box"
            variants={FADE_UP}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-violet-900 rounded-lg p-4 text-violet-200 text-sm"
          >
            👋 I animate in and out smoothly!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── 2. Stagger children ─────────────────────────────────────────────────────
const ITEMS = [
  "Component Patterns",
  "State Management",
  "Performance",
  "API Integration",
  "Testing",
];

function StaggerDemo() {
  const [key, setKey] = useState(0);
  return (
    <div className="space-y-3">
      <button
        className="btn-secondary text-sm"
        onClick={() => setKey((k) => k + 1)}
      >
        ↺ Re-animate
      </button>
      <motion.ul
        key={key}
        variants={LIST_CONTAINER}
        initial="hidden"
        animate="visible"
        className="space-y-1"
      >
        {ITEMS.map((item, i) => (
          <motion.li
            key={i}
            variants={FADE_UP}
            className="bg-gray-800 rounded-lg px-4 py-2 text-sm text-gray-300 flex items-center gap-2"
          >
            <span className="text-violet-400 font-mono text-xs">
              {String(i + 1).padStart(2, "0")}
            </span>
            {item}
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}

// ─── 3. Layout animation ─────────────────────────────────────────────────────
function LayoutDemo() {
  const [expanded, setExpanded] = useState<number | null>(null);
  const cards = [
    {
      id: 1,
      title: "Click to expand",
      body: "This card uses layout animation. The position smoothly reflows when items change size.",
    },
    {
      id: 2,
      title: "Another card",
      body: "Framer Motion layout prop automatically animates any layout changes using FLIP technique.",
    },
    {
      id: 3,
      title: "Third card",
      body: "No manual transitions needed — just add layout to any motion element.",
    },
  ];
  return (
    <div className="space-y-2">
      {cards.map((card) => (
        <motion.div
          key={card.id}
          layout
          onClick={() => setExpanded(expanded === card.id ? null : card.id)}
          className="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-750 overflow-hidden"
          style={{ borderRadius: 12 }}
        >
          <motion.p
            layout="position"
            className="text-gray-200 text-sm font-medium"
          >
            {card.title}
          </motion.p>
          <AnimatePresence>
            {expanded === card.id && (
              <motion.p
                key="body"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-gray-500 text-xs mt-2 leading-relaxed"
              >
                {card.body}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}

// ─── 4. Drag gesture ─────────────────────────────────────────────────────────
function DragDemo() {
  return (
    <div className="relative h-24 bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
      <p className="text-gray-600 text-xs">← Drag the chip →</p>
      <motion.div
        drag="x"
        dragConstraints={{ left: -120, right: 120 }}
        whileDrag={{ scale: 1.1, cursor: "grabbing" }}
        className="absolute bg-violet-600 text-white text-xs font-medium px-4 py-2 rounded-full cursor-grab select-none"
      >
        Drag me
      </motion.div>
    </div>
  );
}

// ─── 5. Spring animation ─────────────────────────────────────────────────────
function SpringDemo() {
  const [target, setTarget] = useState(50);
  const x = useSpring(target, { stiffness: 200, damping: 20 });
  const bg = useTransform(x, [0, 100], ["#7c3aed", "#06b6d4"]);
  return (
    <div className="space-y-3">
      <input
        type="range"
        min={0}
        max={100}
        value={target}
        onChange={(e) => setTarget(Number(e.target.value))}
        className="w-full accent-violet-500"
      />
      <motion.div
        className="h-8 rounded-full"
        style={{ width: x.get() + "%", backgroundColor: bg }}
        animate={{ width: `${target}%` }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      />
      <p className="text-xs text-gray-600">
        Spring physics: stiffness {200}, damping {20}
      </p>
    </div>
  );
}

export default function AnimationPatterns() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="mb-8">
        <span className="section-tag">09</span>
        <h1 className="text-white mb-2">Animation Patterns</h1>
        <p className="text-gray-400">
          Framer Motion — mount/unmount transitions, stagger, layout animation,
          gestures, springs.
        </p>
      </div>

      <SubSection
        title="AnimatePresence — Animate on Mount/Unmount"
        tip="Wrap conditional renders in AnimatePresence to animate elements as they enter and leave the DOM."
      >
        <MountDemo />
        <pre>{`<AnimatePresence>
  {show && (
    <motion.div
      key="unique-key"       // required for AnimatePresence
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
    >
      Content
    </motion.div>
  )}
</AnimatePresence>`}</pre>
      </SubSection>

      <SubSection
        title="Stagger Children"
        tip="Define animation variants on a container with staggerChildren — children animate in sequence automatically."
      >
        <StaggerDemo />
        <pre>{`const container = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

<motion.ul variants={container} initial="hidden" animate="visible">
  {items.map(i => <motion.li key={i} variants={item}>{i}</motion.li>)}
</motion.ul>`}</pre>
      </SubSection>

      <SubSection
        title="Layout Animation (FLIP)"
        tip="Add layout prop to auto-animate any CSS layout change. React handles FLIP calculations automatically."
      >
        <LayoutDemo />
      </SubSection>

      <SubSection title="Drag Gesture">
        <DragDemo />
      </SubSection>

      <SubSection title="Spring Physics">
        <SpringDemo />
      </SubSection>

      <SubSection title="Performance & Accessibility Tips">
        <ul className="text-sm text-gray-400 list-disc list-inside space-y-2">
          <li>
            Use <code>transform</code> and <code>opacity</code> — they run on
            the GPU compositor thread
          </li>
          <li>
            Avoid animating <code>height</code>, <code>width</code>, or
            layout-triggering properties
          </li>
          <li>
            Respect <code>prefers-reduced-motion</code>: wrap animations with
            the media query
          </li>
          <li>
            Keep durations under 300ms for micro-interactions, 400-600ms for
            page transitions
          </li>
        </ul>
        <pre>{`// Respect reduced motion preference:
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const variants = prefersReducedMotion
  ? {} // no animation
  : { initial: { opacity: 0 }, animate: { opacity: 1 } };`}</pre>
      </SubSection>
    </div>
  );
}
