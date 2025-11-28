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

export default function MyIssuesPage() {
  const api = useApiFetcher();
  const [page, setPage] = useState(1);
  const [issueBeingEdited, setIssueBeingEdited] = useState<IssueListItem | null>(null);

  const issuesQuery = useQuery({
    queryKey: ["my-issues", page],
    queryFn: async () => {
      const response = await api<ApiResponse<IssuesResponse>>({
        url: "/issues",
        method: "GET",
        params: {
          page: String(page),
          limit: String(PAGE_SIZE),
        },
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to load issues");
      }

      return response.data;
    },
  });

  const issues = issuesQuery.data?.items ?? [];
  const meta = issuesQuery.data?.meta;

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

  const totalPages = meta ? meta.pages : 1;

  const emptyState = (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-white/60 p-8 text-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="mx-auto h-12 w-12 text-gray-300"
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
      <h2 className="mt-4 text-lg font-semibold text-gray-900">No issues yet</h2>
      <p className="mt-2 text-sm text-gray-500">
        You haven't reported any issues. Start by submitting your first report.
      </p>
      <Link
        href="/issues/new"
        className="mt-6 inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
      >
        Add Issue
      </Link>
    </div>
  );

  return (
    <Layout>
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Issues</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage and update the issues you have reported.
              </p>
            </div>
            <Link
              href="/issues/new"
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              + Add Issue
            </Link>
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
                    className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase text-gray-500">
                        <span>{issue.area}</span>
                        <span>•</span>
                        <span>{issue.type}</span>
                        <span>•</span>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 ${
                            issue.status === "Completed"
                              ? "bg-green-100 text-green-700"
                              : issue.status === "InProgress"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {issue.status === "InProgress" ? "In Progress" : issue.status}
                        </span>
                      </div>
                      <h2 className="mt-1 text-lg font-semibold text-gray-900 line-clamp-1">{issue.title}</h2>
                      <p className="text-sm text-gray-600 line-clamp-2">{issue.description}</p>
                      <p className="mt-2 text-xs text-gray-400">
                        Updated {issue.updatedAt ? new Date(issue.updatedAt).toLocaleString() : "—"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/issues/${issue._id}`}
                        className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => setIssueBeingEdited(issue)}
                        className="px-3 py-1.5 text-sm font-medium text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>

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

          {issueBeingEdited && selectedInitialValues && (
            <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Edit Issue</h2>
                  <p className="text-xs text-gray-500">Only your own issues can be edited.</p>
                </div>
                <button
                  onClick={() => setIssueBeingEdited(null)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Close
                </button>
              </div>
              <IssueForm
                issueId={issueBeingEdited._id}
                mode="edit"
                initialValues={selectedInitialValues}
                submitLabel="Save Changes"
                onSuccessRedirect={null}
                onSuccess={() => {
                  setIssueBeingEdited(null);
                  issuesQuery.refetch();
                }}
              />
            </div>
          )}
        </div>
      </main>
    </Layout>
  );
}

