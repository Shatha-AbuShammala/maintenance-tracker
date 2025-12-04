"use client";

import { Trash2 } from "lucide-react";

export type AdminUserRow = {
  _id: string;
  name?: string;
  email: string;
  issuesCount?: number;
};

type UserTableProps = {
  users: AdminUserRow[];
  onDelete: (user: AdminUserRow) => void;
};

export default function UserTable({ users, onDelete }: UserTableProps) {
  if (!users.length) {
    return <p className="px-4 py-6 text-sm text-slate-500">No users registered yet.</p>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Issues count
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {users.map((user) => (
              <tr key={user._id} className="transition hover:bg-slate-50">
                <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-slate-900">
                  {user.name || "Unnamed"}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">{user.email}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">{user.issuesCount ?? 0}</td>
                <td className="whitespace-nowrap px-6 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => onDelete(user)}
                    className="inline-flex items-center gap-1 rounded-md border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 shadow-sm transition hover:bg-red-50"
                    aria-label={`Delete ${user.email}`}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
