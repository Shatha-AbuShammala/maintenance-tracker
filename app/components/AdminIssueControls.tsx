"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useApiFetcher } from "@/app/providers/Providers";
import { IssueStatus } from "@/models/Issue";

type AdminIssueControlsProps = {
  issueId: string;
  currentStatus: IssueStatus;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: string;
};

export default function AdminIssueControls({ issueId, currentStatus }: AdminIssueControlsProps) {
  const api = useApiFetcher();
  const queryClient = useQueryClient();
  const [isConfirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const invalidateIssues = () => {
    queryClient.invalidateQueries({ queryKey: ["issues"] });
    queryClient.invalidateQueries({ queryKey: ["admin-issues"] });
    queryClient.invalidateQueries({ queryKey: ["issue", issueId] });
  };

  const statusMutation = useMutation({
    mutationFn: async (status: IssueStatus) => {
      const response = await api<ApiResponse<{ status: IssueStatus }>>({
        url: `/issues/${issueId}`,
        method: "PUT",
        data: { status },
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to update status");
      }
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Status updated to ${data.status}`);
      invalidateIssues();
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Failed to update status");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await api<ApiResponse<{ message: string }>>({
        url: `/issues/${issueId}`,
        method: "DELETE",
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to delete issue");
      }
      return response.data;
    },
    onSuccess: () => {
      toast.success("Issue deleted");
      setConfirmDeleteOpen(false);
      invalidateIssues();
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Failed to delete issue");
    },
  });

  const handleStatusChange = (status: IssueStatus) => {
    if (status === currentStatus) return;
    statusMutation.mutate(status);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => handleStatusChange("InProgress")}
        disabled={statusMutation.isPending || currentStatus === "InProgress"}
        className="px-3 py-1.5 text-xs font-semibold rounded-md border border-blue-200 text-blue-700 hover:bg-blue-50 disabled:opacity-50"
      >
        Mark In Progress
      </button>
      <button
        type="button"
        onClick={() => handleStatusChange("Completed")}
        disabled={statusMutation.isPending || currentStatus === "Completed"}
        className="px-3 py-1.5 text-xs font-semibold rounded-md border border-green-200 text-green-700 hover:bg-green-50 disabled:opacity-50"
      >
        Mark Completed
      </button>
      <button
        type="button"
        onClick={() => setConfirmDeleteOpen(true)}
        disabled={deleteMutation.isPending}
        className="px-3 py-1.5 text-xs font-semibold rounded-md border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50"
      >
        Delete
      </button>

      {isConfirmDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Issue</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete this issue? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDeleteOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-60"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


