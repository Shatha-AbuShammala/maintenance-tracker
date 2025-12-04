"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import Layout from "@/app/components/Layout";
import LoadingSkeleton from "@/app/components/LoadingSkeleton";
import { useApiFetcher, useAuth } from "@/app/providers/Providers";
import { IssueStatus } from "@/models/Issue";

type IssueDetail = {
  _id: string;
  title: string;
  description: string;
  area: string;
  type: string;
  status: IssueStatus;
  image?: string;
  createdBy?: {
    _id: string;
    name?: string;
    email?: string;
  };
  createdAt?: string;
  updatedAt?: string;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: string;
};

const STATUS_OPTIONS: IssueStatus[] = ["Pending", "InProgress", "Completed"];

export default function IssueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const api = useApiFetcher();
  const { user } = useAuth();

  const issueQuery = useQuery({
    queryKey: ["issue", id],
    queryFn: async () => {
      const response = await api<ApiResponse<IssueDetail>>({
        url: `/issues/${id}`,
        method: "GET",
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to fetch issue");
      }

      return response.data;
    },
    enabled: Boolean(id),
  });

  const issue = issueQuery.data;
  const isAdmin = user?.role === "admin";
  const history = useMemo(() => {
    if (!issue) return [];
    const events: { label: string; detail: string }[] = [];
    if (issue.createdAt) {
      events.push({ label: "Created", detail: new Date(issue.createdAt).toLocaleString() });
    }
    if (issue.updatedAt && issue.updatedAt !== issue.createdAt) {
      events.push({ label: "Last updated", detail: new Date(issue.updatedAt).toLocaleString() });
    }
    if (events.length === 0) {
      events.push({ label: "Timeline", detail: "No history available yet." });
    }
    return events;
  }, [issue]);

  const updateStatusMutation = useMutation({
    mutationFn: async (status: IssueStatus) => {
      const response = await api<ApiResponse<IssueDetail>>({
        url: `/issues/${id}`,
        method: "PUT",
        data: { status },
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to update status");
      }

      return response.data;
    },
    onSuccess: () => {
      toast.success("Status updated");
      issueQuery.refetch();
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Failed to update status");
    },
  });

  if (issueQuery.isLoading) {
    return (
      <Layout>
        <main className="min-h-screen bg-gray-50">
          <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            <LoadingSkeleton variant="card" count={3} />
          </div>
        </main>
      </Layout>
    );
  }

  if (issueQuery.isError || !issue) {
    return (
      <Layout>
        <main className="min-h-screen bg-gray-50">
          <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 text-center">
            <p className="text-lg font-semibold text-red-600 mb-2">Failed to load issue.</p>
            <p className="text-sm text-gray-600 mb-6">Please try refreshing the page.</p>
            <button
              onClick={() => issueQuery.refetch()}
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Retry
            </button>
          </div>
        </main>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-500">Issue #{issue._id}</p>
              <h1 className="text-3xl font-bold text-gray-900 mt-1">{issue.title}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                <span className="font-medium">Area:</span> {issue.area}
                <span className="font-medium">Type:</span> {issue.type}
                <span className="font-medium">Status:</span>{" "}
                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-0.5 text-xs font-semibold text-blue-700">
                  {issue.status === "InProgress" ? "In Progress" : issue.status}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3" />
          </div>

          {issue.image && (
            <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
              <img src={issue.image} alt={issue.title} className="w-full object-cover max-h-[420px]" />
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{issue.description}</p>
              </section>

              <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Reporter</h2>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-lg font-semibold text-blue-700">
                    {(issue.createdBy?.name || issue.createdBy?.email || "U").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {issue.createdBy?.name || issue.createdBy?.email || "Unknown reporter"}
                    </p>
                    <p className="text-xs text-gray-500">{issue.createdBy?.email}</p>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 text-sm text-gray-600 sm:grid-cols-2">
                  <p>
                    <span className="font-medium text-gray-800">Created:</span>{" "}
                    {issue.createdAt ? new Date(issue.createdAt).toLocaleString() : "—"}
                  </p>
                  <p>
                    <span className="font-medium text-gray-800">Last Updated:</span>{" "}
                    {issue.updatedAt ? new Date(issue.updatedAt).toLocaleString() : "—"}
                  </p>
                </div>
              </section>

            </div>

            <aside className="space-y-6">
              <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>
                <dl className="space-y-3 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <dt className="font-medium text-gray-500">Type</dt>
                    <dd>{issue.type}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium text-gray-500">Area</dt>
                    <dd>{issue.area || "—"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium text-gray-500">Status</dt>
                    <dd>{issue.status === "InProgress" ? "In Progress" : issue.status}</dd>
                  </div>
                </dl>

                {isAdmin && (
                  <div className="mt-6">
                    <label htmlFor="status-update" className="block text-sm font-medium text-gray-700 mb-2">
                      Change Status
                    </label>
                    <div className="flex gap-2">
                      <select
                        id="status-update"
                        className="flex-1 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                        defaultValue={issue.status}
                        onChange={(e) => updateStatusMutation.mutate(e.target.value as IssueStatus)}
                        disabled={updateStatusMutation.isPending}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status === "InProgress" ? "In Progress" : status}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity</h2>
                <div className="space-y-3 text-sm text-gray-700">
                  {history.map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                      <span className="font-semibold text-slate-800">{item.label}</span>
                      <span className="text-xs text-slate-500">{item.detail}</span>
                    </div>
                  ))}
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </Layout>
  );
}

