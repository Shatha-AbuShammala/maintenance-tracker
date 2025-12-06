"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Eye, Search, Clock3, Zap, CheckCircle2, BarChart3, Clipboard } from "lucide-react";
import Layout from "@/app/components/Layout";
import LoadingSkeleton from "@/app/components/LoadingSkeleton";
import AdminIssueControls from "@/app/components/AdminIssueControls";
import { useApiFetcher } from "@/app/providers/Providers";
import { IssueStatus } from "@/models/Issue";

type Issue = {
  _id: string;
  title: string;
  description: string;
  area: string;
  type: string;
  address?: string;
  status: IssueStatus;
  createdBy?: { name?: string; email?: string };
  createdAt?: string;
};

type IssuesResponse = {
  meta: { total: number; page: number; limit: number; pages: number };
  items: Issue[];
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: string;
};

type AdminFilterState = {
  status: IssueStatus | "All";
  area: string;
  type: string;
  search: string;
  sort: "Newest" | "Oldest";
};

type AdminFilterBarProps = {
  filters: AdminFilterState;
  onChange: (next: Partial<AdminFilterState>) => void;
  onClear: () => void;
};

const DEFAULT_ADMIN_FILTERS: AdminFilterState = {
  status: "All",
  area: "",
  type: "",
  search: "",
  sort: "Newest",
};

const ADMIN_AREA_OPTIONS = [
  "Gaza",
  "Khan Younis",
  "Deir al-Balah",
  "Rafah",
  "North Gaza",
  "Middle Gaza",
];

const ADMIN_TYPE_OPTIONS = [
  "Lighting",
  "Infrastructure",
  "Water & Sewage",
  "Waste",
  "Buildings",
  "Parks & Green Spaces",
  "Transportation",
  "Security & Safety",
];

function AdminFilterBar({ filters, onChange, onClear }: AdminFilterBarProps) {
  const handleChange = <K extends keyof AdminFilterState>(key: K, value: AdminFilterState[K]) => {
    onChange({ [key]: value });
  };

  const hasActiveFilters =
    filters.status !== "All" ||
    filters.area !== "" ||
    filters.type !== "" ||
    filters.search.trim() !== "" ||
    filters.sort !== "Newest";

  return (
    <div className="rounded-lg border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur">
      <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end">
        <div className="flex flex-1 flex-col gap-1 md:min-w-[150px]">
          <label htmlFor="admin-filter-status" className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Status
          </label>
          <select
            id="admin-filter-status"
            value={filters.status}
            onChange={(e) => handleChange("status", e.target.value as AdminFilterState["status"])}
            className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            aria-label="Filter by status"
          >
            <option value="All">All</option>
            <option value="Pending">Pending</option>
            <option value="InProgress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className="flex flex-1 flex-col gap-1 md:min-w-[170px]">
          <label htmlFor="admin-filter-area" className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Area
          </label>
          <select
            id="admin-filter-area"
            value={filters.area}
            onChange={(e) => handleChange("area", e.target.value)}
            className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            aria-label="Filter by area"
          >
            <option value="">All Areas</option>
            {ADMIN_AREA_OPTIONS.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-1 flex-col gap-1 md:min-w-[170px]">
          <label htmlFor="admin-filter-type" className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Type
          </label>
          <select
            id="admin-filter-type"
            value={filters.type}
            onChange={(e) => handleChange("type", e.target.value)}
            className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            aria-label="Filter by type"
          >
            <option value="">All Types</option>
            {ADMIN_TYPE_OPTIONS.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-1 flex-col gap-1 md:min-w-[220px]">
          <label htmlFor="admin-filter-search" className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="admin-filter-search"
              type="text"
              value={filters.search}
              onChange={(e) => handleChange("search", e.target.value)}
              placeholder="Search title or description"
              className="w-full h-10 rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm font-medium text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              aria-label="Search issues"
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-1 md:min-w-[150px] md:flex-none">
          <label htmlFor="admin-filter-sort" className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Sort
          </label>
          <select
            id="admin-filter-sort"
            value={filters.sort}
            onChange={(e) => handleChange("sort", e.target.value as AdminFilterState["sort"])}
            className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            aria-label="Sort issues"
          >
            <option value="Newest">Newest</option>
            <option value="Oldest">Oldest</option>
          </select>
        </div>

        <div className="flex md:ml-auto md:w-auto">
          <button
            type="button"
            onClick={onClear}
            disabled={!hasActiveFilters}
            className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

const PAGE_SIZE = 10;

export default function AdminIssuesPage() {
  const api = useApiFetcher();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<AdminFilterState>({ ...DEFAULT_ADMIN_FILTERS });

  const handleFilterChange = (next: Partial<AdminFilterState>) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, ...next }));
  };

  const handleClearFilters = () => {
    setPage(1);
    setFilters({ ...DEFAULT_ADMIN_FILTERS });
  };

  const issuesQuery = useQuery({
    queryKey: ["admin-issues", { page, filters }],
    queryFn: async () => {
      const params: Record<string, string> = {
        page: String(page),
        limit: String(PAGE_SIZE),
      };
      if (filters.status !== "All") params.status = filters.status;
      if (filters.area) params.area = filters.area;
      if (filters.search) params.search = filters.search;
      if (filters.type) params.type = filters.type;
      params.sort = filters.sort === "Oldest" ? "asc" : "desc"; // placeholder until server-side sort is implemented

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

  const filteredIssues = issuesQuery.data?.items ?? [];
  const meta = issuesQuery.data?.meta;
  const totalPages = meta?.pages ?? 1;
  return (
    <Layout>
      <main className="min-h-screen bg-[#F5F7FB]">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 space-y-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-blue-600">Admin</p>
              <h1 className="text-3xl font-semibold text-slate-900">All Issues</h1>
              <p className="mt-1 text-sm text-slate-600">Search, filter, and manage every issue.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="sticky top-6 z-20">
              <AdminFilterBar filters={filters} onChange={handleFilterChange} onClear={handleClearFilters} />
            </div>

            {issuesQuery.isLoading ? (
              <LoadingSkeleton variant="card" count={3} />
            ) : filteredIssues.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <Clipboard className="h-7 w-7" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">No reports yet – everything is clear today.</h3>
                <p className="mt-2 text-sm text-slate-500">When new reports arrive, they'll show up here.</p>
                <div className="mt-6 flex justify-center">
                  <Link
                    href="/issues/new"
                    className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 cursor-pointer"
                  >
                    + Add Issue
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-3">
                  {filteredIssues.map((issue) => (
                    <div
                      key={issue._id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:gap-4">
                        <div className="min-w-0 space-y-1.5">
                          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                              {issue.area}
                            </span>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                              {issue.type}
                            </span>
                          </div>
                          <h2 className="text-lg font-semibold text-slate-900 line-clamp-1">{issue.title}</h2>
                          <p className="text-sm text-slate-600 line-clamp-2">{issue.description}</p>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                            <span>Reporter: {issue.createdBy?.name || issue.createdBy?.email || "Unknown"}</span>
                            <span className="h-1 w-1 rounded-full bg-slate-300" />
                            <span>
                              Created: {issue.createdAt ? new Date(issue.createdAt).toLocaleString() : "N/A"}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-3 sm:items-end sm:text-right">
                          <span
                            className={`inline-flex items-center self-start rounded-full px-3 py-1 text-xs font-semibold sm:self-end ${
                              issue.status === "Completed"
                                ? "bg-emerald-100 text-emerald-700"
                                : issue.status === "InProgress"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {issue.status === "InProgress" ? "In Progress" : issue.status}
                          </span>
                          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                            <Link
                              href={`/admin/issues/${issue._id}`}
                              className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm ring-1 ring-blue-500/40 transition hover:-translate-y-0.5 hover:bg-blue-700 cursor-pointer"
                              aria-label="View issue"
                              title="View issue"
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </Link>
                            <AdminIssueControls issueId={issue._id} currentStatus={issue.status} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {meta && (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-slate-600">
                    <span>
                      Showing {(meta.page - 1) * meta.limit + 1}-
                      {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} issues
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                        disabled={page <= 1}
                        className="px-3 py-1 rounded-md border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                      >
                        Previous
                      </button>
                      <span className="text-sm font-medium text-slate-700">
                        Page {page} of {totalPages}
                      </span>
                      <button
                        onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={page >= totalPages}
                        className="px-3 py-1 rounded-md border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </Layout>
  );
}
