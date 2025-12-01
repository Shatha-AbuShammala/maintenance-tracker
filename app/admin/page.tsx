"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/app/components/Layout";
import LoadingSkeleton from "@/app/components/LoadingSkeleton";
import IssueFilters from "@/app/components/IssueFilters";
import AdminIssueControls from "@/app/components/AdminIssueControls";
import { useApiFetcher } from "@/app/providers/Providers";
import { IssueStatus } from "@/models/Issue";

type Issue = {
  _id: string;
  title: string;
  description: string;
  area: string;
  type: string;
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

const PAGE_SIZE = 10;

export default function AdminDashboardPage() {
  const api = useApiFetcher();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<{ status: string; area: string; search: string }>({
    status: "All",
    area: "",
    search: "",
  });

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
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase text-blue-600">Admin</p>
              <h1 className="text-3xl font-bold text-gray-900">Issue Management</h1>
              <p className="mt-1 text-sm text-gray-600">
                Monitor all reports and take action quickly.
              </p>
            </div>
          </div>

          <IssueFilters
            defaultFilters={filters}
            onChange={(next) => {
              setPage(1);
              setFilters(next);
            }}
          />

          {issuesQuery.isLoading ? (
            <LoadingSkeleton variant="card" count={3} />
          ) : filteredIssues.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white/70 p-10 text-center">
              <h3 className="text-lg font-semibold text-gray-900">No results</h3>
              <p className="text-sm text-gray-500 mt-1">Try adjusting filters to see more issues.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredIssues.map((issue) => (
                <div
                  key={issue._id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs uppercase text-gray-500">
                        <span>{issue.area}</span>
                        <span>•</span>
                        <span>{issue.type}</span>
                        <span>•</span>
                        <span>{issue.status === "InProgress" ? "In Progress" : issue.status}</span>
                      </div>
                      <h2 className="mt-1 text-lg font-semibold text-gray-900 line-clamp-1">
                        {issue.title}
                      </h2>
                      <p className="text-sm text-gray-600 line-clamp-2">{issue.description}</p>
                      <div className="mt-2 text-xs text-gray-400">
                        Reported by {issue.createdBy?.name || issue.createdBy?.email || "Unknown"} •{" "}
                        {issue.createdAt ? new Date(issue.createdAt).toLocaleString() : "—"}
                      </div>
                    </div>
                    <AdminIssueControls issueId={issue._id} currentStatus={issue.status} />
                  </div>
                </div>
              ))}

              {meta && (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-gray-500">
                  <span>
                    Showing {(meta.page - 1) * meta.limit + 1}-
                    {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} issues
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                      disabled={page <= 1}
                      className="px-3 py-1 rounded-md border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="text-sm font-medium text-gray-700">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={page >= totalPages}
                      className="px-3 py-1 rounded-md border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </Layout>
  );
}


