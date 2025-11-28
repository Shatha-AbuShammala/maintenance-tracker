"use client";

import Link from "next/link";
import { IssueStatus } from "@/models/Issue";
import { ReactNode } from "react";

export type IssueReporter = {
  name?: string;
  email?: string;
};

export type IssueCardData = {
  _id: string;
  title: string;
  description: string;
  area: string;
  status: IssueStatus;
  createdBy?: IssueReporter | string | null;
  createdAt?: string;
};

const statusStyles: Record<IssueStatus, string> = {
  Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  InProgress: "bg-blue-100 text-blue-800 border-blue-200",
  Completed: "bg-green-100 text-green-800 border-green-200",
};

function getReporterName(createdBy?: IssueCardData["createdBy"]): string {
  if (!createdBy) return "Unknown";
  if (typeof createdBy === "string") return createdBy;
  return createdBy.name || createdBy.email || "Unknown";
}

function getReporterInitials(createdBy?: IssueCardData["createdBy"]): string {
  const name = getReporterName(createdBy);
  return name
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

export type IssueCardProps = {
  issue: IssueCardData;
  icon?: ReactNode;
};

/**
 * IssueCard - mobile-friendly card representation of an issue.
 * Entire card is clickable and navigates to /issues/[id].
 */
export default function IssueCard({ issue, icon }: IssueCardProps) {
  const statusLabel = issue.status === "InProgress" ? "In Progress" : issue.status;
  const reporterName = getReporterName(issue.createdBy);
  const reporterInitials = getReporterInitials(issue.createdBy);

  return (
    <Link
      href={`/issues/${issue._id}`}
      className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {icon ? (
            <div className="text-blue-600">{icon}</div>
          ) : (
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-700">
              {reporterInitials || "??"}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3 mb-1">
            <h3 className="text-base font-semibold text-gray-900 line-clamp-1">{issue.title}</h3>
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusStyles[issue.status]}`}
            >
              {statusLabel}
            </span>
          </div>

          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{issue.description}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-500">
            <div>
              <p className="font-medium text-gray-700">Area</p>
              <p>{issue.area || "Not specified"}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Reporter</p>
              <p>{reporterName}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Created</p>
              <p>{issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : "—"}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

