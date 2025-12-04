"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import Layout from "@/app/components/Layout";
import LoadingSkeleton from "@/app/components/LoadingSkeleton";
import { useApiFetcher, useAuth } from "@/app/providers/Providers";
import DeleteUserModal from "@/app/components/admin/DeleteUserModal";
import UserTable, { AdminUserRow } from "@/app/components/admin/UserTable";

type UsersResponse = {
  items: AdminUserRow[];
  meta: { total: number; page: number; limit: number; pages: number };
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: string;
};

export default function AdminUsersPage() {
  const api = useApiFetcher();
  const { token } = useAuth();
  const [userToDelete, setUserToDelete] = useState<AdminUserRow | null>(null);
  const [localUsers, setLocalUsers] = useState<AdminUserRow[]>([]);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const usersQuery = useQuery({
    queryKey: ["admin-users", token, page],
    queryFn: async () => {
      const response = await api<ApiResponse<UsersResponse>>({
        url: "/users",
        method: "GET",
        params: { page, limit: PAGE_SIZE },
      });
      if (!response.success || !response.data) throw new Error(response.error || "Failed to load users");
      return response.data;
    },
    enabled: Boolean(token),
  });

  useEffect(() => {
    if (usersQuery.data?.items) {
      setLocalUsers(usersQuery.data.items);
    }
  }, [usersQuery.data]);

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Failed request");
      }
      return userId;
    },
    onSuccess: (deletedId) => {
      toast.success("User deleted");
      setUserToDelete(null);
      setLocalUsers((prev) => {
        const next = prev.filter((u) => u._id !== deletedId);
        if (next.length === 0 && page > 1) {
          setPage((p) => Math.max(1, p - 1));
        } else {
          usersQuery.refetch();
        }
        return next;
      });
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Failed to delete user");
    },
  });

  const handleConfirmDelete = () => {
    if (!userToDelete) return;
    deleteMutation.mutate(userToDelete._id);
  };

  return (
    <Layout>
      <main className="min-h-screen bg-[#F5F7FB]">
        <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
          <nav className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
            <Link href="/admin" className="hover:text-slate-600">
              Admin
            </Link>{" "}
            <span className="text-slate-500">›</span> <span className="text-slate-700">Users</span>
          </nav>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-blue-600">Admin</p>
            <h1 className="text-3xl font-semibold text-slate-900">Users Management</h1>
            <p className="mt-1 text-sm text-slate-600">View and manage all registered users.</p>
          </div>

          <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">All Users</h2>
                <p className="text-sm text-slate-500">Manage accounts and their reported issues.</p>
              </div>
            </div>

            {usersQuery.isLoading ? (
              <LoadingSkeleton variant="card" count={1} />
            ) : usersQuery.isError ? (
              <p className="text-sm text-red-600">Failed to load users. Please try again.</p>
            ) : (
              <>
                <UserTable users={localUsers} onDelete={(user) => setUserToDelete(user)} />
                {usersQuery.data?.meta && (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-slate-600">
                    <span>
                      Showing {(usersQuery.data.meta.page - 1) * usersQuery.data.meta.limit + 1}-
                      {Math.min(usersQuery.data.meta.page * usersQuery.data.meta.limit, usersQuery.data.meta.total)} of{" "}
                      {usersQuery.data.meta.total} users
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                        disabled={page <= 1}
                        className="px-3 py-1 rounded-md border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <span className="text-sm font-medium text-slate-700">
                        Page {page} of {usersQuery.data.meta.pages}
                      </span>
                      <button
                        onClick={() => setPage((prev) => Math.min(usersQuery.data!.meta.pages, prev + 1))}
                        disabled={page >= usersQuery.data.meta.pages}
                        className="px-3 py-1 rounded-md border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>

      <DeleteUserModal
        open={Boolean(userToDelete)}
        userEmail={userToDelete?.email}
        onCancel={() => setUserToDelete(null)}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </Layout>
  );
}
