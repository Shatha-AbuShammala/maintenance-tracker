"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "./components/Layout";
import LoadingSkeleton from "./components/LoadingSkeleton";
import Pagination from "./components/Pagination";
import { useApiFetcher } from "./providers/Providers";
import { IssueStatus } from "@/models/Issue";

type Issue = {
  _id: string;
  title: string;
  description: string;
  area: string;
  status: IssueStatus;
  createdAt?: string;
  updatedAt?: string;
};

type IssuesResponse = {
  meta: { total: number; page: number; limit: number; pages: number };
  items: Issue[];
};

type Filters = {
  status: IssueStatus | "All";
  area: string;
  search: string;
};

const PAGE_SIZE = 10;

/**
 * StatsCard component displays a single statistic with label and value
 */
function StatsCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "blue" | "yellow" | "purple" | "green";
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    green: "bg-green-50 text-green-700 border-green-200",
  };

  return (
    <div className={`rounded-xl border p-5 shadow-sm ${colorClasses[color]}`}>
      <div className="text-xs font-semibold uppercase tracking-wide opacity-80 mb-1">
        {label}
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}

/**
 * DashboardStats displays 4 stat cards: Total Issues, Pending, InProgress, Completed
 * 
 * APPROACH FOR FETCHING COUNTS:
 * The API endpoint GET /api/issues returns meta.total for the total count, but does not
 * provide aggregated counts per status in the response.
 * 
 * Therefore, we implement client-side counting:
 * 1. Call GET /api/issues?limit=100 to fetch the first 100 issues (or all if fewer exist)
 * 2. Use meta.total from the response for the "Total Issues" count (this is accurate)
 * 3. Compute Pending/InProgress/Completed counts by filtering the fetched items array
 *    on the client side
 * 
 * Note: If there are more than 100 issues, the status breakdown counts will be
 * approximate based on the first 100 items. This is acceptable for dashboard purposes.
 * For exact counts across all issues, the API would need to support aggregation endpoints
 * or return status counts in the meta object.
 */
function DashboardStats({
  stats,
  isLoading,
  isError,
}: {
  stats?: IssuesResponse;
  isLoading: boolean;
  isError: boolean;
}) {
  const counts = useMemo(() => {
    if (!stats) {
      return { total: 0, pending: 0, inProgress: 0, completed: 0 };
    }

    // Client-side count: filter items array by status
    const pending = stats.items.filter((issue) => issue.status === "Pending").length;
    const inProgress = stats.items.filter((issue) => issue.status === "InProgress").length;
    const completed = stats.items.filter((issue) => issue.status === "Completed").length;

    return {
      total: stats.meta.total, // Use API's meta.total (accurate even if >100 issues)
      pending,
      inProgress,
      completed,
    };
  }, [stats]);

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Failed to load statistics. Please refresh the page.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 w-full animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard label="Total Issues" value={counts.total} color="blue" />
      <StatsCard label="Pending" value={counts.pending} color="yellow" />
      <StatsCard label="In Progress" value={counts.inProgress} color="purple" />
      <StatsCard label="Completed" value={counts.completed} color="green" />
    </div>
  );
}

/**
 * IssueFilters component provides filtering by status, area, and search
 */
function IssueFilters({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (next: Filters) => void;
}) {
  const setField = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
          <div className="flex-1 md:flex-initial">
            <label htmlFor="filter-status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="filter-status"
              value={filters.status}
              onChange={(e) => setField("status", e.target.value as Filters["status"])}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="InProgress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="flex-1 md:flex-initial">
            <label htmlFor="filter-area" className="block text-sm font-medium text-gray-700 mb-1">
              Area
            </label>
            <input
              id="filter-area"
              type="text"
              value={filters.area}
              onChange={(e) => setField("area", e.target.value)}
              placeholder="Filter by area"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>

        <div className="flex-1 md:max-w-sm">
          <label htmlFor="filter-search" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            id="filter-search"
            type="text"
            value={filters.search}
            onChange={(e) => setField("search", e.target.value)}
            placeholder="Search by title or description"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * IssueRow component renders a single issue in card format
 */
function IssueRow({ issue }: { issue: Issue }) {
  const statusColors = {
    Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    InProgress: "bg-blue-100 text-blue-800 border-blue-200",
    Completed: "bg-green-100 text-green-800 border-green-200",
  };

  const statusLabel = issue.status === "InProgress" ? "In Progress" : issue.status;

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 line-clamp-1 mb-1">
            {issue.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2 mb-2">{issue.description}</p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="font-medium">Area: {issue.area}</span>
            {issue.createdAt && (
              <span>Created: {new Date(issue.createdAt).toLocaleDateString()}</span>
            )}
          </div>
        </div>
        <span
          className={`flex-shrink-0 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border ${statusColors[issue.status]}`}
        >
          {statusLabel}
        </span>
      </div>
    </div>
  );
}

/**
 * IssuesList component renders the list of issues with loading, error, and empty states
 * Supports pagination with Previous/Next buttons
 */
function IssuesList({
  data,
  isLoading,
  isError,
  page,
  onPageChange,
}: {
  data?: IssuesResponse;
  isLoading: boolean;
  isError: boolean;
  page: number;
  onPageChange: (page: number) => void;
}) {
  if (isLoading) {
    return <LoadingSkeleton variant="table" count={5} />;
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm font-medium text-red-700 mb-1">Failed to load issues</p>
        <p className="text-xs text-red-600">Please try refreshing the page.</p>
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-sm font-medium text-gray-700 mb-1">No issues found</p>
        <p className="text-xs text-gray-500">
          {data?.meta.total === 0
            ? "Get started by creating your first issue."
            : "Try adjusting your filters to see more results."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {data.items.map((issue) => (
          <IssueRow key={issue._id} issue={issue} />
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-gray-500">
        <span>
          Showing {(data.meta.page - 1) * data.meta.limit + 1} to{" "}
          {Math.min(data.meta.page * data.meta.limit, data.meta.total)} of {data.meta.total}{" "}
          issues
        </span>
        <Pagination
          currentPage={page}
          totalPages={data.meta.pages || 1}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}

/**
 * Home / Dashboard page
 * 
 * Features:
 * - Stats overview: 4 cards showing Total Issues, Pending, InProgress, Completed
 * - Filters: Status dropdown, Area input, Search box
 * - Issues list: Paginated list with IssueRow cards
 * - React Query: Data fetching with automatic caching and refetching
 * - Loading states: Skeleton loaders during data fetch
 * - Responsive layout: Desktop (grid) and mobile (stacked vertically)
 * - Error & empty states: Clear messaging for failed loads and no results
 */
export default function Home() {
  const api = useApiFetcher();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({
    status: "All",
    area: "",
    search: "",
  });

  // Main issues query with filters and pagination
  const issuesQuery = useQuery<IssuesResponse>({
    queryKey: ["issues", { page, filters }],
    queryFn: async () => {
      const params: Record<string, string> = {
        page: String(page),
        limit: String(PAGE_SIZE),
      };

      if (filters.status !== "All") {
        params.status = filters.status;
      }
      if (filters.area.trim()) {
        params.area = filters.area.trim();
      }
      if (filters.search.trim()) {
        params.search = filters.search.trim();
      }

      const response = await api<{ success: boolean; data: IssuesResponse }>({
        url: "/issues",
        method: "GET",
        params,
      });

      if (!response.success || !response.data) {
        throw new Error("Failed to load issues");
      }
      return response.data;
    },
  });

  // Stats query: Fetch first 100 issues to compute status counts client-side
  // See DashboardStats component comments for detailed approach explanation
  const statsQuery = useQuery<IssuesResponse>({
    queryKey: ["issues-stats"],
    queryFn: async () => {
      const response = await api<{ success: boolean; data: IssuesResponse }>({
        url: "/issues",
        method: "GET",
        params: {
          page: "1",
          limit: "100", // Fetch up to 100 issues for client-side status counting
        },
      });

      if (!response.success || !response.data) {
        throw new Error("Failed to load statistics");
      }
      return response.data;
    },
  });

  return (
    <Layout>
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">
              Overview of your reported issues and their current status.
            </p>
            {issuesQuery.isFetching && !issuesQuery.isLoading && (
              <p className="mt-2 text-xs text-gray-500">Refreshing data...</p>
            )}
          </div>

          {/* Stats Cards - Desktop: 4 column grid, Mobile: stacked */}
          <div className="mb-6">
            <DashboardStats
              stats={statsQuery.data}
              isLoading={statsQuery.isLoading}
              isError={statsQuery.isError}
            />
          </div>

          {/* Filters */}
          <div className="mb-6">
            <IssueFilters
              filters={filters}
              onChange={(next) => {
                setPage(1); // Reset to page 1 when filters change
                setFilters(next);
              }}
            />
          </div>

          {/* Issues List */}
          <IssuesList
            data={issuesQuery.data}
            isLoading={issuesQuery.isLoading}
            isError={issuesQuery.isError}
            page={page}
            onPageChange={setPage}
          />
        </div>
      </main>
    </Layout>
  );
}
