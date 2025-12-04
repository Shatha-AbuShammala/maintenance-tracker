"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, PlayCircle, Trash2 } from "lucide-react";
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
  const [modalRoot, setModalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const root = document.getElementById("modal-root");
    setModalRoot(root);
  }, []);

  useEffect(() => {
    if (!isConfirmDeleteOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [isConfirmDeleteOpen]);

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
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => handleStatusChange("InProgress")}
        disabled={statusMutation.isPending || currentStatus === "InProgress"}
        className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3.5 py-2 text-xs font-semibold text-blue-700 shadow-sm ring-1 ring-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-100 hover:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-60"
        aria-label="Mark in progress"
        title="Mark in progress"
      >
        <PlayCircle className="h-4 w-4" />
        In Progress
      </button>
      <button
        type="button"
        onClick={() => handleStatusChange("Completed")}
        disabled={statusMutation.isPending || currentStatus === "Completed"}
        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-700 shadow-sm ring-1 ring-emerald-200 transition hover:-translate-y-0.5 hover:bg-emerald-100 hover:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
        aria-label="Mark completed"
        title="Mark completed"
      >
        <CheckCircle2 className="h-4 w-4" />
        Completed
      </button>
      <button
        type="button"
        onClick={() => setConfirmDeleteOpen(true)}
        disabled={deleteMutation.isPending}
        className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-700 shadow-sm ring-1 ring-red-200 transition hover:-translate-y-0.5 hover:bg-red-100 hover:ring-red-300 disabled:cursor-not-allowed disabled:opacity-60"
        aria-label="Delete issue"
        title="Delete issue"
      >
        <Trash2 className="h-4 w-4" />
        Delete
      </button>

      {isConfirmDeleteOpen && modalRoot
        ? createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
              <div
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
                onClick={() => setConfirmDeleteOpen(false)}
                aria-hidden="true"
              />
              <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-200 animate-[fadeIn_140ms_ease,zoomIn_140ms_ease]">
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
            </div>,
            modalRoot
          )
        : null}
    </div>
  );
}
