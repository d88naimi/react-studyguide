import { useState, type ReactNode } from "react";

// ─── Shared UI ───────────────────────────────────────────────────────────────
function CodeBlock({ children }: { children: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(children).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="relative group">
      <pre>{children}</pre>
      <button
        onClick={copy}
        className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium bg-gray-700 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-600"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}


function Section({ title, tip, children }: { title: string; tip?: string; children: ReactNode }) {
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
      <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Live demo</p>
      {children}
    </div>
  );
}

function Value({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-sm text-gray-400">
      <span className="text-gray-500">{label}:</span>{" "}
      <code>{value || "(empty)"}</code>
    </p>
  );
}

function Gotcha({ children }: { children: ReactNode }) {
  return (
    <div className="border border-amber-800 bg-amber-950 rounded-lg p-3 text-sm text-amber-300 space-y-1">
      <p className="font-semibold text-amber-200">Gotcha</p>
      {children}
    </div>
  );
}

// ─── 1. Text Input ───────────────────────────────────────────────────────────
function TextInputDemo() {
  const [name, setName] = useState("");
  return (
    <Live>
      <label htmlFor="demo-name" className="text-sm text-gray-400 block mb-1">Name</label>
      <input
        id="demo-name"
        className="input"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Type something…"
      />
      <Value label="value" value={name} />
    </Live>
  );
}

// ─── 2. Text Variants ────────────────────────────────────────────────────────
function TextVariantsDemo() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  return (
    <Live>
      <div className="grid gap-3">
        {(
          [
            { id: "demo-email", type: "email", label: "Email", val: email, set: setEmail, placeholder: "user@example.com" },
            { id: "demo-pw", type: "password", label: "Password", val: password, set: setPassword, placeholder: "••••••••" },
            { id: "demo-tel", type: "tel", label: "Phone", val: phone, set: setPhone, placeholder: "+1 555 000 0000" },
          ] as const
        ).map(({ id, type, label, val, set, placeholder }) => (
          <div key={id}>
            <label htmlFor={id} className="text-sm text-gray-400 block mb-1">{label}</label>
            <input
              id={id}
              type={type}
              className="input"
              value={val}
              onChange={(e) => set(e.target.value)}
              placeholder={placeholder}
            />
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-2">All variants bind the same way — only <code>type</code> changes.</p>
    </Live>
  );
}

// ─── 3. Textarea ─────────────────────────────────────────────────────────────
function TextareaDemo() {
  const [comment, setComment] = useState("");
  return (
    <Live>
      <label htmlFor="demo-comment" className="text-sm text-gray-400 block mb-1">Comment</label>
      <textarea
        id="demo-comment"
        className="input min-h-[80px] resize-y"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your thoughts…"
      />
      <Value label="value" value={comment} />
    </Live>
  );
}

// ─── 4. Radio Buttons ────────────────────────────────────────────────────────
const LANGUAGES = ["English", "French", "Spanish", "Japanese"] as const;

function RadioDemo() {
  const [language, setLanguage] = useState("English");
  return (
    <Live>
      <fieldset className="space-y-1">
        <legend className="text-sm text-gray-400 mb-2">Language</legend>
        {LANGUAGES.map((option) => (
          <label key={option} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="demo-language"
              value={option}
              checked={option === language}
              onChange={(e) => setLanguage(e.target.value)}
              className="accent-violet-500"
            />
            <span className="text-sm text-gray-300">{option}</span>
          </label>
        ))}
      </fieldset>
      <Value label="selected" value={language} />
    </Live>
  );
}

// ─── 5. Checkboxes ───────────────────────────────────────────────────────────
function SingleCheckboxDemo() {
  const [optIn, setOptIn] = useState(false);
  return (
    <Live>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={optIn}
          onChange={(e) => setOptIn(e.target.checked)}
          className="accent-violet-500"
        />
        <span className="text-sm text-gray-300">Subscribe to newsletter</span>
      </label>
      <Value label="checked" value={String(optIn)} />
    </Live>
  );
}

const INITIAL_TOPPINGS: Record<string, boolean> = {
  anchovies: false,
  chicken: false,
  mushrooms: false,
  tomatoes: false,
};

function MultiCheckboxDemo() {
  const [toppings, setToppings] = useState(INITIAL_TOPPINGS);
  const selected = Object.entries(toppings)
    .filter(([, v]) => v)
    .map(([k]) => k)
    .join(", ");

  return (
    <Live>
      <fieldset className="space-y-1">
        <legend className="text-sm text-gray-400 mb-2">Pizza toppings</legend>
        {Object.keys(toppings).map((topping) => (
          <label key={topping} className="flex items-center gap-2 cursor-pointer capitalize">
            <input
              type="checkbox"
              value={topping}
              checked={toppings[topping]}
              onChange={() =>
                setToppings((prev) => ({ ...prev, [topping]: !prev[topping] }))
              }
              className="accent-violet-500"
            />
            <span className="text-sm text-gray-300 capitalize">{topping}</span>
          </label>
        ))}
      </fieldset>
      <Value label="selected" value={selected || "(none)"} />
    </Live>
  );
}

// ─── 6. Select ───────────────────────────────────────────────────────────────
const AGE_RANGES = ["0-18", "19-29", "30-44", "45-64", "65+"] as const;

function SelectDemo() {
  const [age, setAge] = useState<typeof AGE_RANGES[number]>("0-18");
  return (
    <Live>
      <label htmlFor="demo-age" className="text-sm text-gray-400 block mb-1">Age range</label>
      <select
        id="demo-age"
        className="input"
        value={age}
        onChange={(e) => setAge(e.target.value as typeof AGE_RANGES[number])}
      >
        {AGE_RANGES.map((range) => (
          <option key={range} value={range}>{range}</option>
        ))}
      </select>
      <Value label="selected" value={age} />
    </Live>
  );
}

// ─── 7. Range slider ─────────────────────────────────────────────────────────
function RangeDemo() {
  const [volume, setVolume] = useState(50);
  return (
    <Live>
      <label htmlFor="demo-range" className="text-sm text-gray-400 block mb-1">
        Volume — <span className="text-violet-400">{volume}</span>
      </label>
      <input
        id="demo-range"
        type="range"
        min={0}
        max={100}
        value={volume}
        onChange={(e) => setVolume(Number(e.target.value))}
        className="w-full accent-violet-500"
      />
    </Live>
  );
}

// ─── 8. Color picker ─────────────────────────────────────────────────────────
function ColorDemo() {
  const [color, setColor] = useState("#7c3aed");
  return (
    <Live>
      <label htmlFor="demo-color" className="text-sm text-gray-400 block mb-1">Pick a color</label>
      <div className="flex items-center gap-3">
        <input
          id="demo-color"
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="h-10 w-16 rounded cursor-pointer border-0 bg-transparent"
        />
        <div
          className="flex-1 h-10 rounded-lg border border-gray-700 transition-colors"
          style={{ backgroundColor: color }}
        />
        <code className="text-sm">{color}</code>
      </div>
    </Live>
  );
}

// ─── 9. Date picker ──────────────────────────────────────────────────────────
function DateDemo() {
  const [date, setDate] = useState("");
  return (
    <Live>
      <label htmlFor="demo-date" className="text-sm text-gray-400 block mb-1">Date</label>
      <input
        id="demo-date"
        type="date"
        className="input"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <Value label="value" value={date} />
    </Live>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────
export default function InputCheatsheet() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="mb-8">
        <span className="section-tag">05b · Bonus</span>
        <h1 className="text-white mb-2">Input Cheat Sheet</h1>
        <p className="text-gray-400">
          Quick reference for all common React controlled form inputs — with live demos, code snippets, and gotchas.
        </p>
      </div>

      {/* ── Text input ── */}
      <Section
        title="Text Input"
        tip="Bind value to state, update via onChange. Always initialise state to ''."
      >
        <TextInputDemo />
        <CodeBlock>{`const [name, setName] = useState('');

<input
  value={name}
  onChange={(e) => setName(e.target.value)}
/>`}</CodeBlock>
        <Gotcha>
          <p>Use <code>''</code> (empty string) as initial state — never <code>undefined</code>. Switching from uncontrolled → controlled mid-render causes React warnings and subtle bugs.</p>
        </Gotcha>
      </Section>

      {/* ── Text variants ── */}
      <Section
        title="Text Input Variants"
        tip="email / password / tel / url / number — all bind identically. Only the type attribute changes."
      >
        <TextVariantsDemo />
        <CodeBlock>{`// Same binding pattern for all variants:
const [email, setEmail] = useState('');

<input
  type="email"          // swap: password | tel | url | number
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>`}</CodeBlock>
      </Section>

      {/* ── Textarea ── */}
      <Section
        title="Textarea"
        tip="Identical API to a text input — use value + onChange."
      >
        <TextareaDemo />
        <CodeBlock>{`const [comment, setComment] = useState('');

<textarea
  value={comment}
  onChange={(e) => setComment(e.target.value)}
/>`}</CodeBlock>
        <Gotcha>
          <p>Unlike HTML, React textareas do <strong>not</strong> use children for their value. Always use the <code>value</code> prop.</p>
        </Gotcha>
      </Section>

      {/* ── Radio buttons ── */}
      <Section
        title="Radio Buttons"
        tip="Use checked (boolean) instead of value to control. Store the selected option's value string in state."
      >
        <RadioDemo />
        <CodeBlock>{`const OPTIONS = ['English', 'French', 'Spanish'];
const [language, setLanguage] = useState('English');

{OPTIONS.map((option) => (
  <input
    key={option}
    type="radio"
    name="language"       // groups the buttons
    value={option}
    checked={option === language}
    onChange={(e) => setLanguage(e.target.value)}
  />
))}`}</CodeBlock>
        <Gotcha>
          <p>When mapping over options, don't reuse the state variable name as the map parameter — it <em>shadows</em> the outer variable, breaking the <code>checked</code> comparison.</p>
          <pre className="mt-2 text-xs">{`// ❌ 'language === language' is always true
OPTS.map((language) => <input checked={language === language} />)

// ✅ use a different name
OPTS.map((option) => <input checked={option === language} />)`}</pre>
        </Gotcha>
      </Section>

      {/* ── Single checkbox ── */}
      <Section
        title="Checkbox — Single"
        tip="Store a boolean in state; bind to checked (not value)."
      >
        <SingleCheckboxDemo />
        <CodeBlock>{`const [optIn, setOptIn] = useState(false);

<input
  type="checkbox"
  checked={optIn}
  onChange={(e) => setOptIn(e.target.checked)}
/>`}</CodeBlock>
      </Section>

      {/* ── Multiple checkboxes ── */}
      <Section
        title="Checkboxes — Multiple"
        tip="Store an object keyed by option name. Spread to create a new object on each toggle."
      >
        <MultiCheckboxDemo />
        <CodeBlock>{`const [toppings, setToppings] = useState({
  anchovies: false,
  chicken: false,
  mushrooms: false,
});

{Object.keys(toppings).map((topping) => (
  <input
    key={topping}
    type="checkbox"
    checked={toppings[topping]}
    onChange={() =>
      setToppings((prev) => ({
        ...prev,
        [topping]: !prev[topping],
      }))
    }
  />
))}`}</CodeBlock>
      </Section>

      {/* ── Select ── */}
      <Section
        title="Select"
        tip="Works just like a text input — bind value to state and handle onChange. No need to set selected on <option> children."
      >
        <SelectDemo />
        <CodeBlock>{`const RANGES = ['0-18', '19-29', '30-44', '65+'];
const [age, setAge] = useState('0-18'); // must match an option

<select
  value={age}
  onChange={(e) => setAge(e.target.value)}
>
  {RANGES.map((r) => (
    <option key={r} value={r}>{r}</option>
  ))}
</select>`}</CodeBlock>
        <Gotcha>
          <p>The initial state <strong>must</strong> match one of the <code>option</code> values exactly. A typo silently renders the select blank. Use the same array for both the state default and the <code>option</code> list to keep them in sync.</p>
        </Gotcha>
      </Section>

      {/* ── Range ── */}
      <Section
        title="Range Slider"
        tip="Same value + onChange pattern. event.target.value is always a string — convert with Number()."
      >
        <RangeDemo />
        <CodeBlock>{`const [volume, setVolume] = useState(50);

<input
  type="range"
  min={0}
  max={100}
  value={volume}
  onChange={(e) => setVolume(Number(e.target.value))}
/>`}</CodeBlock>
        <Gotcha>
          <p><code>event.target.value</code> is always a <em>string</em> (this is a DOM quirk, not React-specific). Wrap with <code>Number()</code> before storing — otherwise comparisons like <code>volume &gt; 50</code> will silently fail.</p>
        </Gotcha>
      </Section>

      {/* ── Color ── */}
      <Section
        title="Color Picker"
        tip="Behaves like a text input that returns a hex string. Initialise to a valid hex value."
      >
        <ColorDemo />
        <CodeBlock>{`const [color, setColor] = useState('#7c3aed'); // valid hex required

<input
  type="color"
  value={color}
  onChange={(e) => setColor(e.target.value)}
/>`}</CodeBlock>
        <Gotcha>
          <p>Initialise to a valid hex color string (e.g. <code>'#FF0000'</code>). <code>undefined</code> or an empty string will cause the picker to behave unexpectedly.</p>
        </Gotcha>
      </Section>

      {/* ── Date ── */}
      <Section
        title="Date Picker"
        tip="Returns an ISO date string (YYYY-MM-DD). Initialise to '' or a valid ISO date."
      >
        <DateDemo />
        <CodeBlock>{`const [date, setDate] = useState('');

<input
  type="date"
  value={date}
  onChange={(e) => setDate(e.target.value)}
/>`}</CodeBlock>
      </Section>

      {/* ── Quick reference table ── */}
      <Section title="Quick Reference">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400">
                <th className="py-2 pr-4 font-medium">Input</th>
                <th className="py-2 pr-4 font-medium">Control prop</th>
                <th className="py-2 pr-4 font-medium">State type</th>
                <th className="py-2 font-medium">Key gotcha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-gray-300">
              {[
                ["text / email / password / tel", "value", "string ('')", "init to ''"],
                ["textarea", "value", "string ('')", "no children for value"],
                ["radio", "checked (boolean)", "string", "shadow bug in .map()"],
                ["checkbox (single)", "checked (boolean)", "boolean", "use e.target.checked"],
                ["checkbox (multiple)", "checked (boolean)", "Record<string, boolean>", "spread to update"],
                ["select", "value", "string", "init must match an option"],
                ["range", "value", "number", "coerce with Number()"],
                ["color", "value", "string (hex)", "init to valid hex"],
                ["date", "value", "string (ISO)", "init to '' or ISO date"],
              ].map(([input, prop, type, gotcha]) => (
                <tr key={input}>
                  <td className="py-2 pr-4"><code>{input}</code></td>
                  <td className="py-2 pr-4"><code>{prop}</code></td>
                  <td className="py-2 pr-4"><code>{type}</code></td>
                  <td className="py-2 text-gray-500 text-xs">{gotcha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}
