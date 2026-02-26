import { useState, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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

// ─── Mock API ───────────────────────────────────────────────────────────────
interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

let localPosts: Post[] = [
  {
    id: 1,
    title: "Getting Deep with React Patterns",
    body: "Compound components, render props, and HOCs...",
    userId: 1,
  },
  {
    id: 2,
    title: "TypeScript Generics for React",
    body: "Generic components and hooks are powerful...",
    userId: 1,
  },
];

const api = {
  getPosts: (): Promise<Post[]> =>
    new Promise((res) => setTimeout(() => res([...localPosts]), 600)),
  createPost: (data: Omit<Post, "id">): Promise<Post> =>
    new Promise((res) =>
      setTimeout(() => {
        const post = { ...data, id: Date.now() };
        localPosts = [...localPosts, post];
        res(post);
      }, 400),
    ),
  deletePost: (id: number): Promise<void> =>
    new Promise((res) =>
      setTimeout(() => {
        localPosts = localPosts.filter((p) => p.id !== id);
        res();
      }, 300),
    ),
};

// ─── 1. useQuery ────────────────────────────────────────────────────────────
function PostList() {
  const {
    data: posts,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: api.getPosts,
    staleTime: 1000 * 30,
  });

  const qc = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: api.deletePost,
    // Optimistic update
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["posts"] });
      const prev = qc.getQueryData<Post[]>(["posts"]);
      qc.setQueryData<Post[]>(["posts"], (old) =>
        old?.filter((p) => p.id !== id),
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      qc.setQueryData(["posts"], ctx?.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["posts"] }),
  });

  if (isLoading)
    return (
      <div className="animate-pulse text-gray-500 text-sm py-4">
        Fetching posts…
      </div>
    );
  if (isError)
    return (
      <div className="text-red-400 text-sm">
        Error: {(error as Error).message}
      </div>
    );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {posts?.length} posts {isFetching && "· syncing…"}
        </span>
        <button className="btn-secondary text-xs" onClick={() => refetch()}>
          ↺ Refresh
        </button>
      </div>
      {posts?.map((post) => (
        <div
          key={post.id}
          className="flex items-start gap-3 bg-gray-800 rounded-lg p-3"
        >
          <div className="flex-1 min-w-0">
            <p className="text-gray-200 text-sm font-medium truncate">
              {post.title}
            </p>
            <p className="text-gray-500 text-xs mt-0.5 truncate">{post.body}</p>
          </div>
          <button
            className="text-red-500 hover:text-red-400 text-xs shrink-0 disabled:opacity-40"
            disabled={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate(post.id)}
          >
            delete
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── 2. useMutation + optimistic ────────────────────────────────────────────
function CreatePost() {
  const [title, setTitle] = useState("");
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: api.createPost,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      setTitle("");
    },
  });

  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim()) return;
        mutation.mutate({ title, body: "New post body…", userId: 1 });
      }}
    >
      <input
        className="input flex-1 text-sm"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="New post title…"
      />
      <button
        type="submit"
        className="btn-primary text-sm"
        disabled={mutation.isPending || !title.trim()}
      >
        {mutation.isPending ? "Saving…" : "+ Add"}
      </button>
    </form>
  );
}

export default function ApiPatterns() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="mb-8">
        <span className="section-tag">04</span>
        <h1 className="text-white mb-2">API Integration Patterns</h1>
        <p className="text-gray-400">
          Robust async data fetching, caching, and mutations with TanStack
          Query.
        </p>
      </div>

      <SubSection
        title="useQuery — Declarative Data Fetching"
        tip="TanStack Query auto-handles loading/error states, background refetching, caching, and deduplication."
      >
        <CreatePost />
        <PostList />
      </SubSection>

      <SubSection
        title="Optimistic Updates"
        tip="Update the UI immediately before the server responds. Roll back on error."
      >
        <pre>{`const mutation = useMutation({
  mutationFn: api.deletePost,
  onMutate: async (id) => {
    // Cancel in-flight queries to avoid overwrite
    await queryClient.cancelQueries({ queryKey: ['posts'] });
    // Snapshot current data for rollback
    const prev = queryClient.getQueryData<Post[]>(['posts']);
    // Optimistically remove from cache
    queryClient.setQueryData<Post[]>(['posts'], old =>
      old?.filter(p => p.id !== id)
    );
    return { prev }; // context for onError
  },
  onError: (_err, _id, ctx) => {
    // Roll back
    queryClient.setQueryData(['posts'], ctx?.prev);
  },
  onSettled: () => {
    // Always sync with server
    queryClient.invalidateQueries({ queryKey: ['posts'] });
  },
});`}</pre>
      </SubSection>

      <SubSection title="Query Key Design">
        <pre>{`// ✅ Hierarchical, invalidatable keys
['posts']                     // all posts
['posts', { status: 'draft' }] // filtered posts
['post', postId]              // single post
['post', postId, 'comments']  // post's comments

// Invalidate entire posts namespace:
queryClient.invalidateQueries({ queryKey: ['posts'] });`}</pre>
      </SubSection>

      <SubSection title="Error & Loading Patterns">
        <pre>{`// Global error handling at QueryClient level:
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60,
      throwOnError: true, // use with ErrorBoundary
    },
  },
});

// Component-level error UI:
const { isError, error } = useQuery({ ... });
if (isError) return <ErrorMessage error={error} />;

// Suspense mode:
const { data } = useSuspenseQuery({ ... }); // throws Promise`}</pre>
      </SubSection>

      <SubSection title="Custom API Hook Pattern">
        <pre>{`// src/hooks/useUsers.ts
export function useUsers(filters?: UserFilters) {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => fetchUsers(filters),
    select: (data) => data.sort((a, b) => a.name.localeCompare(b.name)),
    placeholderData: keepPreviousData, // avoid loader flash on filter change
  });
}

// Keeps components clean:
function UserTable() {
  const { data, isLoading } = useUsers({ role: 'admin' });
  ...
}`}</pre>
      </SubSection>

      <SubSection title="API Layer Best Practices">
        <ul className="text-sm text-gray-400 list-disc list-inside space-y-2">
          <li>
            Centralize all fetch logic in <code>src/api/</code> — never call{" "}
            <code>fetch</code> directly in components
          </li>
          <li>
            Use <code>axios</code> interceptors or a custom{" "}
            <code>apiFetch</code> wrapper for auth headers and error
            normalization
          </li>
          <li>
            Always handle 401 (redirect to login) and 403 (permission error)
            globally
          </li>
          <li>Validate API responses with Zod to catch schema drift early</li>
          <li>
            Use <code>AbortController</code> / TanStack Query's built-in
            cancellation for unmounted requests
          </li>
        </ul>
      </SubSection>
    </div>
  );
}
