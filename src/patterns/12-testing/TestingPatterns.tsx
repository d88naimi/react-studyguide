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

export default function TestingPatterns() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="mb-8">
        <span className="section-tag">12</span>
        <h1 className="text-white mb-2">Testing Patterns</h1>
        <p className="text-gray-400">
          Vitest + Testing Library — unit, integration, and interaction tests.
        </p>
      </div>

      <SubSection
        title="Unit Test — Pure Component"
        tip="Test what the user sees and does, not implementation details. Prefer queries that reflect accessibility."
      >
        <pre>{`// Counter.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Counter } from './Counter';

describe('Counter', () => {
  it('starts at zero', () => {
    render(<Counter />);
    expect(screen.getByText('Count: 0')).toBeInTheDocument();
  });

  it('increments when button clicked', async () => {
    const user = userEvent.setup();
    render(<Counter />);
    await user.click(screen.getByRole('button', { name: /increment/i }));
    expect(screen.getByText('Count: 1')).toBeInTheDocument();
  });

  it('does not go below zero', async () => {
    const user = userEvent.setup();
    render(<Counter initialCount={0} />);
    await user.click(screen.getByRole('button', { name: /decrement/i }));
    expect(screen.getByText('Count: 0')).toBeInTheDocument();
  });
});`}</pre>
      </SubSection>

      <SubSection
        title="Integration Test — Form with Validation"
        tip="Test the full interaction flow including validation messages and submission."
      >
        <pre>{`// LoginForm.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('shows validation errors on empty submit', async () => {
    const user = userEvent.setup();
    render(<LoginForm onLogin={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  });

  it('calls onLogin with correct credentials', async () => {
    const user = userEvent.setup();
    const onLogin = vi.fn().mockResolvedValue(undefined);
    render(<LoginForm onLogin={onLogin} />);

    await user.type(screen.getByLabelText(/email/i), 'user@test.com');
    await user.type(screen.getByLabelText(/password/i), 'SecurePass123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(onLogin).toHaveBeenCalledWith({
        email: 'user@test.com',
        password: 'SecurePass123',
      });
    });
  });
});`}</pre>
      </SubSection>

      <SubSection
        title="API Hook Test — Mocking TanStack Query"
        tip="Use msw (Mock Service Worker) or vi.mock to intercept API calls in tests."
      >
        <pre>{`// useUsers.test.tsx
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUsers } from './useUsers';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';

const wrapper = ({ children }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    {children}
  </QueryClientProvider>
);

describe('useUsers', () => {
  it('fetches and returns users', async () => {
    server.use(
      http.get('/api/users', () =>
        HttpResponse.json([{ id: 1, name: 'Alice', role: 'engineer' }])
      )
    );
    const { result } = renderHook(() => useUsers(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].name).toBe('Alice');
  });

  it('handles API error', async () => {
    server.use(
      http.get('/api/users', () => HttpResponse.error())
    );
    const { result } = renderHook(() => useUsers(), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});`}</pre>
      </SubSection>

      <SubSection title="Testing Custom Hooks">
        <pre>{`// useCounter.test.ts
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('initializes with default value', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it('increments by step', () => {
    const { result } = renderHook(() => useCounter({ step: 5 }));
    act(() => { result.current.increment(); });
    expect(result.current.count).toBe(5);
  });
});`}</pre>
      </SubSection>

      <SubSection title="Testing with Zustand Store">
        <pre>{`// Reset store between tests to avoid state leakage:
import { useCartStore } from '../store/cartStore';

beforeEach(() => {
  useCartStore.setState({ items: [] }); // reset store
});

it('adds item to cart', () => {
  const { result } = renderHook(() => useCartStore());
  act(() => {
    result.current.addItem({ id: 1, name: 'Book', price: 29 });
  });
  expect(result.current.items).toHaveLength(1);
  expect(result.current.total()).toBe(29);
});`}</pre>
      </SubSection>

      <SubSection title="Testing Principles">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {[
            [
              "🏆 Test behavior, not impl",
              "Don't test state variables, test what user sees",
            ],
            [
              "🎭 Use userEvent over fireEvent",
              "userEvent simulates real browser events",
            ],
            [
              "📦 Avoid mocking React modules",
              "Mock at network/API layer with msw instead",
            ],
            [
              "♻ Reset state between tests",
              "beforeEach cleanup avoids test pollution",
            ],
            [
              "🔍 Accessible queries first",
              "getByRole > getByLabelText > getByText > testId",
            ],
            [
              "🚫 Avoid act() abuse",
              "If you overuse act(), your test flow is wrong",
            ],
          ].map(([t, d]) => (
            <div key={t as string} className="bg-gray-800 rounded-lg p-3">
              <p className="text-gray-200 font-medium">{t}</p>
              <p className="text-gray-500 text-xs mt-1">{d}</p>
            </div>
          ))}
        </div>
      </SubSection>
    </div>
  );
}
