'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  MoreHorizontal,
  Search
} from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  showItemsPerPage?: boolean;
  showQuickJump?: boolean;
  showStats?: boolean;
  itemsPerPageOptions?: number[];
  className?: string;
}

export function AdvancedPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  showItemsPerPage = true,
  showQuickJump = true,
  showStats = true,
  itemsPerPageOptions = [10, 20, 50, 100],
  className = ''
}: PaginationProps) {
  const [jumpToPage, setJumpToPage] = useState('');

  // Calculate which pages to show
  const getVisiblePages = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); 
         i <= Math.min(totalPages - 1, currentPage + delta); 
         i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const handleJumpToPage = () => {
    const page = parseInt(jumpToPage);
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
      setJumpToPage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJumpToPage();
    }
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1 && !showStats) {
    return null;
  }

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {/* Left side - Items per page and stats */}
      <div className="flex items-center space-x-4">
        {showItemsPerPage && onItemsPerPageChange && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Show</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => onItemsPerPageChange(parseInt(value))}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {itemsPerPageOptions.map((option) => (
                  <SelectItem key={option} value={option.toString()}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">per page</span>
          </div>
        )}

        {showStats && (
          <div className="text-sm text-muted-foreground">
            Showing {startItem.toLocaleString()} to {endItem.toLocaleString()} of{' '}
            <span className="font-medium">{totalItems.toLocaleString()}</span> results
          </div>
        )}
      </div>

      {/* Center - Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center space-x-2">
          {/* First page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="hidden sm:flex"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          {/* Previous page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Page numbers */}
          <div className="flex items-center space-x-1">
            {getVisiblePages().map((page, index) => {
              if (page === '...') {
                return (
                  <div key={`dots-${index}`} className="px-2">
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </div>
                );
              }

              const pageNumber = page as number;
              const isCurrentPage = pageNumber === currentPage;

              return (
                <Button
                  key={pageNumber}
                  variant={isCurrentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNumber)}
                  className={`min-w-[40px] ${isCurrentPage ? 'pointer-events-none' : ''}`}
                >
                  {pageNumber}
                </Button>
              );
            })}
          </div>

          {/* Next page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Last page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="hidden sm:flex"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Right side - Quick jump */}
      {showQuickJump && totalPages > 10 && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Go to page</span>
          <div className="flex items-center space-x-1">
            <Input
              type="number"
              min="1"
              max={totalPages}
              value={jumpToPage}
              onChange={(e) => setJumpToPage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Page"
              className="w-20 h-8"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleJumpToPage}
              disabled={!jumpToPage || parseInt(jumpToPage) < 1 || parseInt(jumpToPage) > totalPages}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple pagination component for minimal use cases
interface SimplePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showLabels?: boolean;
  className?: string;
}

export function SimplePagination({
  currentPage,
  totalPages,
  onPageChange,
  showLabels = true,
  className = ''
}: SimplePaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
        {showLabels && <span className="ml-1 hidden sm:inline">Previous</span>}
      </Button>

      <div className="flex items-center space-x-1">
        <Badge variant="outline" className="px-3 py-1">
          {currentPage} of {totalPages}
        </Badge>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        {showLabels && <span className="mr-1 hidden sm:inline">Next</span>}
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

// Pagination hook for state management
interface UsePaginationOptions {
  initialPage?: number;
  initialItemsPerPage?: number;
  totalItems: number;
}

export function usePagination({
  initialPage = 1,
  initialItemsPerPage = 20,
  totalItems
}: UsePaginationOptions) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Adjust current page if it exceeds total pages
  const adjustedCurrentPage = Math.min(currentPage, totalPages || 1);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    // Adjust current page to maintain roughly the same position
    const currentFirstItem = (adjustedCurrentPage - 1) * itemsPerPage + 1;
    const newPage = Math.ceil(currentFirstItem / newItemsPerPage);
    setCurrentPage(Math.max(1, Math.min(newPage, Math.ceil(totalItems / newItemsPerPage))));
  };

  const getOffset = () => (adjustedCurrentPage - 1) * itemsPerPage;
  const getLimit = () => itemsPerPage;

  return {
    currentPage: adjustedCurrentPage,
    totalPages,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange,
    getOffset,
    getLimit,
    // Computed values for display
    startItem: (adjustedCurrentPage - 1) * itemsPerPage + 1,
    endItem: Math.min(adjustedCurrentPage * itemsPerPage, totalItems),
    totalItems
  };
}

// Infinite scroll pagination component
interface InfiniteScrollPaginationProps {
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  className?: string;
}

export function InfiniteScrollPagination({
  hasMore,
  loading,
  onLoadMore,
  className = ''
}: InfiniteScrollPaginationProps) {
  if (!hasMore && !loading) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-muted-foreground">No more items to load</p>
      </div>
    );
  }

  return (
    <div className={`text-center py-8 ${className}`}>
      {loading ? (
        <div className="space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading more items...</p>
        </div>
      ) : (
        <Button onClick={onLoadMore} variant="outline">
          Load More Items
        </Button>
      )}
    </div>
  );
}
