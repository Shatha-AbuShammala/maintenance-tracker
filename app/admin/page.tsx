"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, CheckCircle2, Clipboard, Clock3, Zap } from "lucide-react";
import Layout from "@/app/components/Layout";
import LoadingSkeleton from "@/app/components/LoadingSkeleton";
import { useApiFetcher } from "@/app/providers/Providers";
import { IssueStatus } from "@/models/Issue";

type Issue = {
  _id: string;
  title: string;
  description: string;
  area: string;
  type: string;
  status: IssueStatus;
  createdBy?: { name?: string; email?: string };
  createdAt?: string;
};

type IssuesResponse = {
  meta: { total: number; page: number; limit: number; pages: number };
  items: Issue[];
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: string;
};

const PAGE_SIZE = 10;

export default function AdminDashboardPage() {
  const api = useApiFetcher();
  const [page] = useState(1);

  const issuesQuery = useQuery({
    queryKey: ["admin-issues", { page }],
    queryFn: async () => {
      const params: Record<string, string> = {
        page: String(page),
        limit: String(PAGE_SIZE),
      };

      const response = await api<ApiResponse<IssuesResponse>>({
        url: "/issues",
        method: "GET",
        params,
      });
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to load issues");
      }
      return response.data;
    },
  });

  const filteredIssues = issuesQuery.data?.items ?? [];
  const meta = issuesQuery.data?.meta;
  const statusCounts = filteredIssues.reduce(
    (acc, issue) => {
      acc[issue.status] = (acc[issue.status] || 0) + 1;
      return acc;
    },
    { Pending: 0, InProgress: 0, Completed: 0 } as Record<IssueStatus, number>
  );
  const latestIssues = filteredIssues.slice(0, 4);

  const statCards = [
    {
      label: "Total Issues",
      value: meta?.total ?? 0,
      icon: BarChart3,
      border: "border-slate-200",
      text: "text-slate-900",
    },
    {
      label: "Pending",
      value: statusCounts.Pending,
      icon: Clock3,
      border: "border-amber-200 bg-amber-50/40",
      text: "text-amber-700",
    },
    {
      label: "In Progress",
      value: statusCounts.InProgress,
      icon: Zap,
      border: "border-blue-200 bg-blue-50/50",
      text: "text-blue-700",
    },
    {
      label: "Resolved",
      value: statusCounts.Completed,
      icon: CheckCircle2,
      border: "border-emerald-200 bg-emerald-50/40",
      text: "text-emerald-700",
    },
  ];

  const issueCountByDate = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredIssues.forEach((issue) => {
      if (!issue.createdAt) return;
      const date = new Date(issue.createdAt);
      if (Number.isNaN(date.getTime())) return;
      date.setHours(0, 0, 0, 0);
      const key = date.toISOString().split("T")[0];
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [filteredIssues]);

  const chartData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 13);

    return Array.from({ length: 14 }, (_, index) => {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + index);
      const key = currentDate.toISOString().split("T")[0];
      return {
        date: currentDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        count: issueCountByDate[key] ?? 0,
      };
    });
  }, [issueCountByDate]);

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: { value: number }[];
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-lg shadow-slate-200/60">
          <p className="text-sm font-semibold text-slate-900">{label}</p>
          <p className="mt-1 text-xs text-slate-500">
            Issues: <span className="font-semibold text-blue-600">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Layout>
      <main className="min-h-screen bg-[#F5F7FB]">
        <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-blue-600">Admin</p>
              <h1 className="text-3xl font-semibold text-slate-900">Issue Management</h1>
              <p className="mt-1 text-sm text-slate-600">Monitor all reports and take action quickly.</p>
            </div>
          </div>

          {issuesQuery.isLoading ? (
            <LoadingSkeleton variant="card" count={2} />
          ) : (
            <div className="space-y-8">
              <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((card) => (
                  <div
                    key={card.label}
                    className={`flex h-full flex-col gap-4 rounded-xl border bg-white p-5 shadow-sm ${card.border ?? "border-slate-200"}`}
                  >
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700">
                      <card.icon className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className={`text-3xl font-bold ${card.text}`}>{card.value}</span>
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">{card.label}</span>
                    </div>
                  </div>
                ))}
              </div>

              <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">Latest Issues</h2>
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Last 4</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {latestIssues.length === 0 ? (
                    <p className="text-sm text-slate-500">No recent issues.</p>
                  ) : (
                    latestIssues.map((issue, index) => (
                      <div
                        key={issue._id}
                        className="issue-card flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 space-y-1">
                            <p className="truncate text-sm font-semibold text-slate-900">{issue.title}</p>
                            <p className="truncate text-xs text-slate-500">
                              {issue.type} • {issue.area}
                            </p>
                          </div>
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                              issue.status === "Completed"
                                ? "bg-green-100 text-green-600"
                                : issue.status === "InProgress"
                                ? "bg-blue-100 text-blue-600"
                                : "bg-yellow-100 text-yellow-600"
                            }`}
                          >
                            {issue.status === "InProgress" ? "In Progress" : issue.status}
                          </span>
                        </div>
                        <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
                          <span className="truncate">
                            {issue.createdAt ? new Date(issue.createdAt).toLocaleString() : "N/A"}
                          </span>
                          <span className="h-1 w-1 rounded-full bg-slate-200" />
                          <span className="truncate">ID: {issue._id.slice(-6)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <style jsx>{`
                  .issue-card {
                    opacity: 0;
                    transform: translateY(10px);
                    animation: fadeUp 0.65s ease-out forwards;
                  }
                  @keyframes fadeUp {
                    to {
                      opacity: 1;
                      transform: translateY(0);
                    }
                  }
                `}</style>
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">Activity Overview</h2>
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Last 14 days</span>
                </div>
                <div className="mt-4 h-[320px] w-full">
                  <ResponsiveContainer>
                    <LineChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="issueTrend" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#387BFE" stopOpacity={0.42} />
                          <stop offset="55%" stopColor="#387BFE" stopOpacity={0.18} />
                          <stop offset="100%" stopColor="#387BFE" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#e2e8f0" strokeOpacity={0.4} vertical={false} />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12, fill: "#94a3b8" }}
                        axisLine={false}
                        tickLine={false}
                        padding={{ left: 10, right: 10 }}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 12, fill: "#94a3b8" }}
                        axisLine={false}
                        tickLine={false}
                        width={32}
                        label={{
                          value: "Issues",
                          angle: -90,
                          position: "insideLeft",
                          fill: "#0f172a",
                          fontSize: 12,
                          fontWeight: 600,
                          offset: -5,
                        }}
                      />
                      <RechartsTooltip content={<CustomTooltip />} cursor={false} />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="none"
                        fill="url(#issueTrend)"
                        animationDuration={1200}
                        animationEasing="ease-out"
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#387BFE"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: "#387BFE", strokeWidth: 0 }}
                        activeDot={{ r: 5 }}
                        animationDuration={1200}
                        animationEasing="ease-out"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </section>
            </div>
          )}
        </div>
      </main>
    </Layout>
  );
}
