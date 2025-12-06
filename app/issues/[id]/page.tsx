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
  address?: string;
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

function extractAddress(description: string): string | null {
  if (!description) return null;
  const match = description.match(/address:\s*(.+)/i);
  if (!match) return null;
  return match[1].trim() || null;
}

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
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none cursor-pointer"
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

          {/* Title only (ID removed, extra details removed) */}
          <h1 className="text-3xl font-bold text-gray-900">{issue.title}</h1>

          {/* Image */}
          {issue.image && (
            <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
              <img src={issue.image} alt={issue.title} className="w-full object-cover max-h-[420px]" />
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Description */}
              <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
                <p className="text-gray-700 whitespace-pre-line">{issue.description}</p>
              </section>

              {/* Location */}
              <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Address</h2>
                <p className="text-sm text-gray-700">{issue.address || "—"}</p>
              </section>
            </div>

            {/* Right column */}
            <aside className="space-y-6">

              {/* Details */}
              <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>
                <dl className="space-y-3 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <dt className="font-medium text-gray-500">Type</dt>
                    <dd>{issue.type}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium text-gray-500">Area</dt>
                    <dd>{issue.area}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium text-gray-500">Status</dt>
                    <dd>{issue.status === "InProgress" ? "In Progress" : issue.status}</dd>
                  </div>
                </dl>

                {isAdmin && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Change Status
                    </label>
                    <select
                      className="w-full rounded-md border-gray-300 text-sm focus:ring-blue-500"
                      defaultValue={issue.status}
                      onChange={(e) => updateStatusMutation.mutate(e.target.value as IssueStatus)}
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status === "InProgress" ? "In Progress" : status}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </section>

              {/* Activity */}
              <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity</h2>
                <div className="space-y-3 text-sm text-gray-700">
                  {issue.createdAt && (
                    <div className="flex justify-between rounded-lg border px-3 py-2">
                      <span className="font-semibold text-slate-800">Created</span>
                      <span className="text-xs text-slate-500">
                        {new Date(issue.createdAt).toLocaleString()}
                      </span>
                    </div>
                  )}

                  {issue.updatedAt && issue.updatedAt !== issue.createdAt && (
                    <div className="flex justify-between rounded-lg border px-3 py-2">
                      <span className="font-semibold text-slate-800">Last Updated</span>
                      <span className="text-xs text-slate-500">
                        {new Date(issue.updatedAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </section>

            </aside>
          </div>
        </div>
      </main>
    </Layout>
  );
}
