import Link from 'next/link';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  className?: string;
}

export default function Pagination({ 
  currentPage, 
  totalPages, 
  baseUrl,
  className = '' 
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      // Show all pages if 7 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage <= 3) {
        // Near start: 1 2 3 4 ... last
        pages.push(2, 3, 4, 'ellipsis', totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near end: 1 ... n-3 n-2 n-1 n
        pages.push('ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        // Middle: 1 ... prev current next ... last
        pages.push('ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  const getPageUrl = (page: number) => {
    if (page === 1) return baseUrl;
    return `${baseUrl}?page=${page}`;
  };

  return (
    <nav 
      className={`flex items-center justify-center gap-1 ${className}`}
      aria-label="Pagination"
    >
      {/* Previous Button */}
      <Link
        href={currentPage > 1 ? getPageUrl(currentPage - 1) : '#'}
        className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          currentPage === 1
            ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed pointer-events-none'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
        aria-disabled={currentPage === 1}
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Previous</span>
      </Link>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) => {
          if (page === 'ellipsis') {
            return (
              <span 
                key={`ellipsis-${index}`} 
                className="px-2 py-2 text-gray-400"
              >
                <MoreHorizontal className="w-4 h-4" />
              </span>
            );
          }

          const isActive = page === currentPage;
          
          return (
            <Link
              key={page}
              href={getPageUrl(page)}
              className={`min-w-[40px] h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {page}
            </Link>
          );
        })}
      </div>

      {/* Next Button */}
      <Link
        href={currentPage < totalPages ? getPageUrl(currentPage + 1) : '#'}
        className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          currentPage === totalPages
            ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed pointer-events-none'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
        aria-disabled={currentPage === totalPages}
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="w-4 h-4" />
      </Link>
    </nav>
  );
}

// Simple variant for load more
interface LoadMoreProps {
  hasMore: boolean;
  loading?: boolean;
  onLoadMore: () => void;
  className?: string;
}

export function LoadMore({ hasMore, loading = false, onLoadMore, className = '' }: LoadMoreProps) {
  if (!hasMore) return null;

  return (
    <div className={`flex justify-center ${className}`}>
      <button
        onClick={onLoadMore}
        disabled={loading}
        className="px-8 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {loading ? 'Loading...' : 'Load More Articles'}
      </button>
    </div>
  );
}
