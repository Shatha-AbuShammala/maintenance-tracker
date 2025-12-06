"use client";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

/**
 * Accessible pagination control with Previous/Next and page numbers.
 */
export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const createHandler = (page: number) => () => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
  };

  const getVisiblePages = () => {
    const windowSize = 5;
    const half = Math.floor(windowSize / 2);
    let start = Math.max(1, currentPage - half);
    const end = Math.min(totalPages, start + windowSize - 1);
    if (end - start + 1 < windowSize) {
      start = Math.max(1, end - windowSize + 1);
    }
    return Array.from({ length: end - start + 1 }, (_, idx) => start + idx);
  };

  const pages = getVisiblePages();

  return (
    <nav
      className="flex items-center justify-center gap-2 text-sm"
      role="navigation"
      aria-label="Pagination"
    >
      <button
        type="button"
        onClick={createHandler(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded-md border px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
      >
        Previous
      </button>

      <div className="flex items-center gap-1">
        {pages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={createHandler(page)}
            aria-current={page === currentPage ? "page" : undefined}
            className={`rounded-md border px-3 py-1 text-xs font-medium cursor-pointer ${
              page === currentPage
                ? "bg-blue-600 text-white border-blue-600"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={createHandler(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="rounded-md border px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
      >
        Next
      </button>
    </nav>
  );
}
