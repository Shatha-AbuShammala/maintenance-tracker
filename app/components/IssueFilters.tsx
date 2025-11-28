"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useApiFetcher } from "../providers/Providers";
import { IssueStatus } from "@/models/Issue";

type Filters = {
  status: IssueStatus | "All";
  area: string;
  search: string;
};

type IssueFiltersProps = {
  /** Default filter values */
  defaultFilters?: {
    status?: string;
    area?: string;
    search?: string;
  };
  /** Callback fired when filters change */
  onChange: (filters: Filters) => void;
  /** Optional list of areas (if provided, won't fetch from API) */
  areas?: string[];
};

type IssuesResponse = {
  meta: { total: number; page: number; limit: number; pages: number };
  items: Array<{ area: string }>;
};

/**
 * IssueFilters - Filter component for issues list
 * 
 * Features:
 * - Status dropdown (All, Pending, InProgress, Completed)
 * - Area dropdown (populated from API or prop)
 * - Search input with 300ms debounce
 * - Clear/reset button
 * - Emits filter changes via onChange callback
 */
export default function IssueFilters({
  defaultFilters = {},
  onChange,
  areas: areasProp,
}: IssueFiltersProps) {
  const api = useApiFetcher();

  // Initialize state from defaultFilters
  const [status, setStatus] = useState<IssueStatus | "All">(
    (defaultFilters.status as IssueStatus | "All") || "All"
  );
  const [area, setArea] = useState(defaultFilters.area || "");
  const [searchInput, setSearchInput] = useState(defaultFilters.search || "");
  const [debouncedSearch, setDebouncedSearch] = useState(defaultFilters.search || "");

  // Debounce search input (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch issues to extract unique areas (if areas prop not provided)
  const { data: areasData } = useQuery<IssuesResponse>({
    queryKey: ["issues-areas"],
    queryFn: async () => {
      const response = await api<{ success: boolean; data: IssuesResponse }>({
        url: "/issues",
        method: "GET",
        params: {
          page: "1",
          limit: "100", // Fetch up to 100 issues to derive unique areas
        },
      });

      if (!response.success || !response.data) {
        throw new Error("Failed to load areas");
      }
      return response.data;
    },
    enabled: !areasProp, // Only fetch if areas prop not provided
  });

  // Derive unique areas from API response or use prop
  const areas = useMemo(() => {
    if (areasProp) {
      return areasProp;
    }

    if (!areasData) {
      return [];
    }

    // Extract unique areas from fetched issues
    const uniqueAreas = Array.from(
      new Set(areasData.items.map((item) => item.area).filter(Boolean))
    ).sort();

    return uniqueAreas;
  }, [areasData, areasProp]);

  // Emit filter changes whenever any filter value changes
  useEffect(() => {
    onChange({
      status,
      area,
      search: debouncedSearch,
    });
  }, [status, area, debouncedSearch, onChange]);

  // Handle clear/reset
  const handleClear = () => {
    setStatus("All");
    setArea("");
    setSearchInput("");
    setDebouncedSearch("");
  };

  const hasActiveFilters = status !== "All" || area !== "" || searchInput !== "";

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4 flex-1">
          {/* Status Select */}
          <div className="flex-1 md:flex-initial md:min-w-[140px]">
            <label
              htmlFor="filter-status"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Status
            </label>
            <select
              id="filter-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as IssueStatus | "All")}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              aria-label="Filter by status"
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="InProgress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Area Select */}
          <div className="flex-1 md:flex-initial md:min-w-[160px]">
            <label
              htmlFor="filter-area"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Area
            </label>
            <select
              id="filter-area"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              aria-label="Filter by area"
            >
              <option value="">All Areas</option>
              {areas.map((areaOption) => (
                <option key={areaOption} value={areaOption}>
                  {areaOption}
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="flex-1 md:max-w-sm">
            <label
              htmlFor="filter-search"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Search
            </label>
            <input
              id="filter-search"
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by title or description"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              aria-label="Search issues"
            />
          </div>
        </div>

        {/* Clear Button */}
        <div className="flex-shrink-0">
          <button
            type="button"
            onClick={handleClear}
            disabled={!hasActiveFilters}
            className="w-full md:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Clear all filters"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}

