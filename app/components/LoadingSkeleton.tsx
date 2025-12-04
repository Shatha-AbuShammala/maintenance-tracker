"use client";

type LoadingSkeletonProps = {
  /** Determines the layout of the skeleton */
  variant?: "card" | "table";
  /** Number of skeleton items to render */
  count?: number;
  /** Additional classes if needed */
  className?: string;
};

/**
 * Generic loading skeleton used across dashboard sections.
 * `card` renders stacked cards while `table` mimics table rows.
 */
export default function LoadingSkeleton({
  variant = "card",
  count = 4,
  className = "",
}: LoadingSkeletonProps) {
  const items = Array.from({ length: count });

  if (variant === "table") {
    return (
      <div className={`space-y-2 ${className}`}>
        {items.map((_, idx) => (
          <div
            key={idx}
            className="h-12 w-full animate-pulse rounded-lg bg-gray-100"
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`grid gap-3 md:grid-cols-2 ${className}`}>
      {items.map((_, idx) => (
        <div
          key={idx}
          className="h-24 w-full animate-pulse rounded-xl bg-gray-100"
        />
      ))}
    </div>
  );
}

