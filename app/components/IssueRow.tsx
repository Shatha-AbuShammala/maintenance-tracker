"use client";

import Link from "next/link";
import { IssueStatus } from "@/models/Issue";
import { IssueCardData } from "./IssueCard";

type IssueRowProps = {
  issue: IssueCardData;
};

const statusBadgeClasses: Record<IssueStatus, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  InProgress: "bg-blue-100 text-blue-800",
  Completed: "bg-green-100 text-green-800",
};

function getReporter(issue: IssueCardData) {
  const createdBy = issue.createdBy;
  if (!createdBy) return "Unknown";
  if (typeof createdBy === "string") return createdBy;
  return createdBy.name || createdBy.email || "Unknown";
}

/**
 * IssueRow - Desktop table row version of an issue, with actions column.
 */
export default function IssueRow({ issue }: IssueRowProps) {
  const statusLabel = issue.status === "InProgress" ? "In Progress" : issue.status;
  const reporter = getReporter(issue);

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3 text-sm font-medium text-gray-900">
        <Link
          href={`/issues/${issue._id}`}
          className="hover:text-blue-600 focus:outline-none focus-visible:underline"
        >
          {issue.title}
        </Link>
        <p className="text-xs text-gray-500 line-clamp-1">{issue.description}</p>
      </td>
      <td className="px-4 py-3 text-sm text-gray-700">{issue.area || "—"}</td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClasses[issue.status]}`}
        >
          {statusLabel}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-700">{reporter}</td>
      <td className="px-4 py-3 text-sm text-gray-500">
        {issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : "—"}
      </td>
      <td className="px-4 py-3 text-sm">
        <Link
          href={`/issues/${issue._id}`}
          className="text-blue-600 hover:text-blue-800 focus:outline-none focus-visible:underline"
        >
          View
        </Link>
      </td>
    </tr>
  );
}

