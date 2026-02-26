import { useState, type ReactNode } from "react";
import { useForm, useFieldArray, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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

// ─── Schema ─────────────────────────────────────────────────────────────────
const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
  role: z.enum(["engineer", "designer", "manager"], {
    required_error: "Select a role",
  }),
  agree: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms" }),
  }),
});

type SignupForm = z.infer<typeof signupSchema>;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-red-400 text-xs mt-1">{message}</p>;
}

// ─── 1. React Hook Form + Zod ───────────────────────────────────────────────
function SignupForm() {
  const [submitted, setSubmitted] = useState<SignupForm | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid, isDirty },
    reset,
    watch,
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    mode: "onTouched",
  });

  const onSubmit: SubmitHandler<SignupForm> = async (data) => {
    await new Promise((r) => setTimeout(r, 800)); // simulate API
    setSubmitted(data);
  };

  if (submitted) {
    return (
      <div className="space-y-3">
        <div className="bg-green-900 border border-green-700 rounded-lg p-4">
          <p className="text-green-300 font-medium text-sm">
            ✅ Form submitted successfully!
          </p>
          <pre className="text-green-400 text-xs mt-2">
            {JSON.stringify(submitted, null, 2)}
          </pre>
        </div>
        <button
          className="btn-secondary text-sm"
          onClick={() => {
            setSubmitted(null);
            reset();
          }}
        >
          Reset
        </button>
      </div>
    );
  }

  const password = watch("password", "");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <label className="text-sm text-gray-400 block mb-1" htmlFor="name">
          Full Name
        </label>
        <input
          id="name"
          className="input"
          {...register("name")}
          placeholder="Jane Smith"
        />
        <FieldError message={errors.name?.message} />
      </div>

      <div>
        <label className="text-sm text-gray-400 block mb-1" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          className="input"
          {...register("email")}
          placeholder="jane@example.com"
        />
        <FieldError message={errors.email?.message} />
      </div>

      <div>
        <label className="text-sm text-gray-400 block mb-1" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          className="input"
          {...register("password")}
          placeholder="Min 8 chars, 1 uppercase, 1 number"
        />
        <FieldError message={errors.password?.message} />
        {password && (
          <div className="mt-1 flex gap-1">
            {[8, 12, 16].map((len) => (
              <div
                key={len}
                className={`h-1 flex-1 rounded-full ${password.length >= len ? "bg-violet-500" : "bg-gray-700"}`}
              />
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="text-sm text-gray-400 block mb-1" htmlFor="role">
          Role
        </label>
        <select id="role" className="input" {...register("role")}>
          <option value="">Select a role…</option>
          <option value="engineer">Engineer</option>
          <option value="designer">Designer</option>
          <option value="manager">Manager</option>
        </select>
        <FieldError message={errors.role?.message} />
      </div>

      <label className="flex items-start gap-2 cursor-pointer">
        <input
          type="checkbox"
          className="mt-0.5 accent-violet-500"
          {...register("agree")}
        />
        <span className="text-sm text-gray-400">
          I agree to the{" "}
          <span className="text-violet-400">terms of service</span>
        </span>
      </label>
      <FieldError message={errors.agree?.message} />

      <button
        type="submit"
        className="btn-primary w-full"
        disabled={isSubmitting || (!isDirty && !isValid)}
      >
        {isSubmitting ? "Submitting…" : "Create Account"}
      </button>
    </form>
  );
}

// ─── 2. Field Array ─────────────────────────────────────────────────────────
const teamSchema = z.object({
  teamName: z.string().min(1, "Team name required"),
  members: z
    .array(
      z.object({
        name: z.string().min(1, "Name required"),
        email: z.string().email("Invalid email"),
      }),
    )
    .min(1, "Add at least one member"),
});

type TeamForm = z.infer<typeof teamSchema>;

function FieldArrayDemo() {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TeamForm>({
    resolver: zodResolver(teamSchema),
    defaultValues: { teamName: "", members: [{ name: "", email: "" }] },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "members",
  });
  const [result, setResult] = useState<string | null>(null);

  const onSubmit: SubmitHandler<TeamForm> = (data) =>
    setResult(JSON.stringify(data, null, 2));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <input
          className="input"
          {...register("teamName")}
          placeholder="Team name…"
        />
        <FieldError message={errors.teamName?.message} />
      </div>

      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-2">
            <input
              className="input flex-1"
              {...register(`members.${index}.name`)}
              placeholder="Name"
            />
            <input
              className="input flex-1"
              {...register(`members.${index}.email`)}
              placeholder="Email"
            />
            {fields.length > 1 && (
              <button
                type="button"
                className="btn-danger text-sm px-3"
                onClick={() => remove(index)}
              >
                ✕
              </button>
            )}
          </div>
        ))}
        {errors.members?.message && (
          <p className="text-red-400 text-xs">{errors.members.message}</p>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          className="btn-secondary text-sm"
          onClick={() => append({ name: "", email: "" })}
        >
          + Add Member
        </button>
        <button type="submit" className="btn-primary text-sm">
          Submit Team
        </button>
      </div>

      {result && <pre className="text-green-400 text-xs">{result}</pre>}
    </form>
  );
}

export default function FormPatterns() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="mb-8">
        <span className="section-tag">05</span>
        <h1 className="text-white mb-2">Form Handling Patterns</h1>
        <p className="text-gray-400">
          Type-safe forms with React Hook Form and Zod schema validation.
        </p>
      </div>

      <SubSection
        title="React Hook Form + Zod"
        tip="Define schema with Zod → derive TypeScript types → connect to RHF via zodResolver. Zero re-renders until submit/touch."
      >
        <SignupForm />
      </SubSection>

      <SubSection
        title="Field Arrays — Dynamic Form Rows"
        tip="useFieldArray manages lists of fields that can be added, removed, and reordered with stable key management."
      >
        <FieldArrayDemo />
      </SubSection>

      <SubSection title="Key Best Practices">
        <pre>{`// ✅ Use mode: 'onTouched' for better UX (validate after first blur)
const form = useForm({ resolver: zodResolver(schema), mode: 'onTouched' });

// ✅ derive TS types from Zod schema — single source of truth
const schema = z.object({ email: z.string().email() });
type FormData = z.infer<typeof schema>;

// ✅ Disable submit until valid AND dirty
<button disabled={!formState.isDirty || !formState.isValid}>

// ✅ Always use noValidate on form — let RHF handle validation
<form noValidate onSubmit={handleSubmit(onSubmit)}>

// ✅ Use watch() for dependent fields
const country = watch('country');
// Show state field only if country === 'US'`}</pre>
      </SubSection>

      <SubSection title="Async Validation">
        <pre>{`// Zod async refinement:
const schema = z.object({
  username: z.string().refine(
    async (val) => {
      const taken = await api.checkUsername(val);
      return !taken;
    },
    { message: 'Username already taken' }
  ),
});

// Or use RHF's validate option with debounce:
register('username', {
  validate: debounce(async (val) => {
    const taken = await api.checkUsername(val);
    return taken ? 'Username taken' : true;
  }, 400)
})`}</pre>
      </SubSection>
    </div>
  );
}
