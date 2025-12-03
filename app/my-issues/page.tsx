"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Layout from "@/app/components/Layout";
import LoadingSkeleton from "@/app/components/LoadingSkeleton";
import IssueForm, { IssueFormValues } from "@/app/components/IssueForm";
import { useApiFetcher } from "@/app/providers/Providers";
import { IssueStatus } from "@/models/Issue";

type IssueListItem = {
  _id: string;
  title: string;
  description: string;
  type: string;
  area: string;
  image?: string;
  status: IssueStatus;
  createdAt?: string;
  updatedAt?: string;
};

type IssuesResponse = {
  meta: { total: number; page: number; limit: number; pages: number };
  items: IssueListItem[];
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: string;
};

const PAGE_SIZE = 10;

const statusColors: Record<IssueStatus, { bg: string; dot: string; ring: string }> = {
  Pending: {
    bg: "from-sky-50 via-white to-white",
    dot: "bg-sky-500",
    ring: "bg-sky-100 text-sky-700 ring-1 ring-sky-200",
  },
  InProgress: {
    bg: "from-blue-50 via-white to-white",
    dot: "bg-blue-500",
    ring: "bg-blue-100 text-blue-700 ring-1 ring-blue-200",
  },
  Completed: {
    bg: "from-emerald-50 via-white to-white",
    dot: "bg-emerald-500",
    ring: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
  },
};

export default function MyIssuesPage() {
  const api = useApiFetcher();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<{ status: "All" | IssueStatus; search: string }>({
    status: "All",
    search: "",
  });
  const [issueBeingEdited, setIssueBeingEdited] = useState<IssueListItem | null>(null);

  const issuesQuery = useQuery({
    queryKey: ["my-issues", page, filters],
    queryFn: async () => {
      const params: Record<string, string> = {
        page: String(page),
        limit: String(PAGE_SIZE),
      };
      if (filters.status !== "All") params.status = filters.status;
      if (filters.search.trim()) params.search = filters.search.trim();

      const response = await api<ApiResponse<IssuesResponse>>({
        url: "/issues",
        method: "GET",
        params,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to load issues");
      }

      return response.data;
    },
  });

  const issues = issuesQuery.data?.items ?? [];
  const meta = issuesQuery.data?.meta;
  const totalPages = meta ? meta.pages : 1;
  const statusCounts = issues.reduce(
    (acc, issue) => {
      acc[issue.status] = (acc[issue.status] || 0) + 1;
      return acc;
    },
    {} as Record<IssueStatus, number>
  );

  const selectedInitialValues: IssueFormValues | undefined = useMemo(() => {
    if (!issueBeingEdited) return undefined;
    return {
      title: issueBeingEdited.title,
      description: issueBeingEdited.description,
      type: issueBeingEdited.type,
      area: issueBeingEdited.area,
      image: issueBeingEdited.image,
    };
  }, [issueBeingEdited]);

  const emptyState = (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white/90 p-12 text-center shadow-lg shadow-slate-200/60">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="mx-auto h-14 w-14 text-slate-300"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 13.125C3 12.504 3.504 12 4.125 12h15.75c.621 0 1.125.504 1.125 1.125v7.5A1.125 1.125 0 0119.875 21h-15.75A1.125 1.125 0 013 20.625v-7.5zM9 12V6.75A3.75 3.75 0 0112.75 3h.5A3.75 3.75 0 0117 6.75V12m-6 4.5h2.25M12 15.75v3"
        />
      </svg>
      <h2 className="mt-5 text-xl font-semibold text-slate-900">No issues yet</h2>
      <p className="mt-2 text-base text-slate-600">Nothing here yet - add your first report to get started.</p>
      <Link
        href="/issues/new"
        className="mt-6 inline-flex items-center rounded-lg bg-gradient-to-r from-blue-700 via-indigo-600 to-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:shadow-[0_18px_45px_-18px_rgba(59,130,246,0.45)]"
      >
        + Add Issue
      </Link>
    </div>
  );

  return (
    <Layout>
      <main className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.08),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(16,185,129,0.08),transparent_32%),radial-gradient(circle_at_20%_80%,rgba(99,102,241,0.06),transparent_34%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <p className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-700 ring-1 ring-sky-100">
                Your workspace
              </p>
              <h1 className="text-3xl font-semibold text-slate-900">My Issues</h1>
              <p className="text-sm text-slate-600">Track, update, and keep your reports aligned with the team.</p>
            </div>
            {issues.length > 0 && (
              <Link
                href="/issues/new"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-400/30 transition hover:-translate-y-0.5 hover:shadow-[0_18px_45px_-18px_rgba(59,130,246,0.35)]"
              >
                + Add Issue
              </Link>
            )}
          </div>

          <div className="grid gap-4 lg:grid-cols-[2fr,3fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 items-center gap-3 sm:max-w-sm">
                  <label className="text-sm font-semibold text-slate-800" htmlFor="search-issues">
                    Search
                  </label>
                  <input
                    id="search-issues"
                    type="text"
                    value={filters.search}
                    onChange={(e) => {
                      setFilters((prev) => ({ ...prev, search: e.target.value }));
                      setPage(1);
                    }}
                    placeholder="Title or description"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                  />
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <label className="text-base font-semibold text-slate-800" htmlFor="status-filter">
                    Status
                  </label>
                  <select
                    id="status-filter"
                    value={filters.status}
                    onChange={(e) => {
                      setFilters((prev) => ({ ...prev, status: e.target.value as typeof filters.status }));
                      setPage(1);
                    }}
                    className="rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                  >
                    <option value="All">All</option>
                    <option value="Pending">Pending</option>
                    <option value="InProgress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              {(["Pending", "InProgress", "Completed"] as IssueStatus[]).map((status) => (
                <div key={status} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div
                    className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                      status === "Completed"
                        ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200"
                        : status === "InProgress"
                        ? "bg-blue-100 text-blue-700 ring-1 ring-blue-200"
                        : "bg-sky-100 text-sky-700 ring-1 ring-sky-200"
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-current" />
                    {status === "InProgress" ? "In Progress" : status}
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-slate-900">{statusCounts[status] ?? 0}</p>
                </div>
              ))}
            </div>
          </div>

          {issuesQuery.isLoading ? (
            <LoadingSkeleton variant="card" count={3} />
          ) : issues.length === 0 ? (
            emptyState
          ) : (
            <div className="space-y-5">
              <div className="grid gap-4">
                {issues.map((issue) => (
                  <div
                    key={issue._id}
                    className={`relative rounded-3xl border bg-gradient-to-br ${statusColors[issue.status].bg} border-slate-200 p-7 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.32)] flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between transition hover:-translate-y-1.5 hover:shadow-[0_28px_90px_-38px_rgba(15,23,42,0.42)]`}
                  >
                    <span className={`absolute left-5 top-5 h-2.5 w-2.5 rounded-full ${statusColors[issue.status].dot}`} aria-hidden />
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.05em] text-slate-500">
                        <span>{issue.area}</span>
                        <span className="text-slate-400">/</span>
                        <span>{issue.type}</span>
                        <span className="text-slate-400">/</span>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 ${statusColors[issue.status].ring}`}>
                          {issue.status === "InProgress" ? "In Progress" : issue.status}
                        </span>
                      </div>
                      <h2 className="text-xl font-semibold text-slate-900 line-clamp-1">{issue.title}</h2>
                      <p className="text-base text-slate-700 line-clamp-2">{issue.description}</p>
                      <p className="text-xs text-slate-500">
                        Updated {issue.updatedAt ? new Date(issue.updatedAt).toLocaleString() : "Unknown"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/issues/${issue._id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-sky-100 bg-sky-50 px-3.5 py-2 text-sm font-semibold text-sky-800 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-100"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                          <path d="M10 3c-4.5 0-8 4.5-8 7s3.5 7 8 7 8-4.5 8-7-3.5-7-8-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                        </svg>
                        View
                      </Link>
                      <button
                        onClick={() => setIssueBeingEdited(issue)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500 bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-18px_rgba(37,99,235,0.45)]"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                          <path d="M13.586 2a2 2 0 0 1 1.414.586l2.414 2.414a2 2 0 0 1 0 2.828l-7.95 7.95a2 2 0 0 1-1.002.543l-4.1.82a.5.5 0 0 1-.588-.588l.82-4.1a2 2 0 0 1 .543-1.002l7.95-7.95A2 2 0 0 1 13.586 2Zm-1.172 3.414-6.364 6.364-.47 2.35 2.35-.47 6.364-6.364-1.88-1.88Z" />
                        </svg>
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {meta && (
                <div className="sticky bottom-0 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white/95 p-3 text-sm text-slate-700 shadow-sm">
                  <span>
                    Showing {(meta.page - 1) * meta.limit + 1}-{Math.min(meta.page * meta.limit, meta.total)} of {meta.total} issues
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                      disabled={page <= 1}
                      className="px-3 py-1 rounded-md border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="text-sm font-semibold text-slate-700">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={page >= totalPages}
                      className="px-3 py-1 rounded-md border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {issueBeingEdited && selectedInitialValues && (
            <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 px-4 py-12 backdrop-blur-sm">
              <div className="relative w-full max-w-3xl rounded-2xl border border-blue-100 bg-white/98 shadow-[0_32px_120px_-50px_rgba(15,23,42,0.45)]">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Edit Issue</h2>
                    <p className="text-xs text-slate-500">Only your own issues can be edited.</p>
                  </div>
                  <button
                    onClick={() => setIssueBeingEdited(null)}
                    className="text-sm font-semibold text-slate-500 hover:text-slate-700"
                    aria-label="Close edit modal"
                  >
                    X
                  </button>
                </div>
                <div className="px-6 py-5">
                  <IssueForm
                    issueId={issueBeingEdited._id}
                    mode="edit"
                    initialValues={selectedInitialValues}
                    submitLabel="Save Changes"
                    cancelLabel="Cancel"
                    onCancel={() => setIssueBeingEdited(null)}
                    onSuccessRedirect={null}
                    onSuccess={() => {
                      setIssueBeingEdited(null);
                      issuesQuery.refetch();
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </Layout>
  );
}
