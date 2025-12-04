"use client";

import IssueCard, { IssueCardData } from "./IssueCard";
import IssueRow from "./IssueRow";
import Pagination from "./Pagination";

export type IssuesListProps = {
  items: IssueCardData[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages?: number;
  };
  onPageChange: (page: number) => void;
};

/**
 * IssuesList - Responsive list that renders cards on mobile and table rows on desktop.
 */
export default function IssuesList({ items, meta, onPageChange }: IssuesListProps) {
  const totalPages = meta.pages ?? Math.max(1, Math.ceil((meta.total || 0) / (meta.limit || 1)));

  if (!items.length) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-sm font-medium text-gray-700 mb-1">No issues found</p>
        <p className="text-xs text-gray-500">Try adjusting your filters or create a new issue.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {items.map((issue) => (
          <IssueCard key={issue._id} issue={issue} />
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-600">
              <tr>
                <th scope="col" className="px-4 py-3 text-left">
                  Title
                </th>
                <th scope="col" className="px-4 py-3 text-left">
                  Area
                </th>
                <th scope="col" className="px-4 py-3 text-left">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 text-left">
                  Reporter
                </th>
                <th scope="col" className="px-4 py-3 text-left">
                  Created At
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {items.map((issue) => (
                <IssueRow key={issue._id} issue={issue} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500">
        <span>
          Showing {(meta.page - 1) * meta.limit + 1} -{" "}
          {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} issues
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, meta.page - 1))}
            disabled={meta.page <= 1}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            Previous
          </button>
          <span className="text-sm font-medium text-gray-700">
            Page {meta.page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, meta.page + 1))}
            disabled={meta.page >= totalPages}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

