"use client";

import { ReactNode } from "react";

type StatsCardProps = {
  /** Title/label for the stat card */
  title: string;
  /** The main value to display (number or string) */
  value: number | string;
  /** Optional icon to display on the left side */
  icon?: ReactNode;
  /** Optional Tailwind color class for background (e.g., 'bg-blue-100') */
  color?: string;
  /** Optional subtext for last updated, delta, or additional info */
  subtext?: string;
  /** Additional CSS classes */
  className?: string;
};

/**
 * StatsCard - Reusable statistic card component
 * 
 * Features:
 * - Rounded card design with optional icon
 * - Responsive layout (icon on left, content on right)
 * - Accessible with proper semantic HTML
 * - Supports custom colors via Tailwind classes
 * - Optional subtext for additional context
 */
export default function StatsCard({
  title,
  value,
  icon,
  color = "bg-white",
  subtext,
  className = "",
}: StatsCardProps) {
  return (
    <div
      className={`rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow ${color} ${className}`}
      role="article"
      aria-label={`${title}: ${value}`}
    >
      <div className="flex items-start gap-4">
        {/* Icon on the left */}
        {icon && (
          <div
            className="flex-shrink-0 text-gray-600"
            aria-hidden="true"
          >
            {icon}
          </div>
        )}

        {/* Content on the right */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 mb-0.5">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {subtext && (
            <p className="text-xs text-gray-500 mt-1">{subtext}</p>
          )}
        </div>
      </div>
    </div>
  );
}

