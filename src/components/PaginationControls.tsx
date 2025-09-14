import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type PaginationControlsProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationControlsProps) => {
  if (totalPages <= 1) return null;

  const visiblePages: (number | string)[] = [];

  // Always show the first 3 pages (if available)
  const firstPages = [1, 2, 3].filter((page) => page <= totalPages);
  visiblePages.push(...firstPages);

  // Add ellipsis and last page if needed
  if (totalPages > 4) {
    // Only add ellipsis if last page isn't already in the first 3
    if (
      !firstPages.includes(totalPages - 1) &&
      !firstPages.includes(totalPages)
    ) {
      visiblePages.push("...");
    }

    // Only add the last page if not already included
    if (!firstPages.includes(totalPages)) {
      visiblePages.push(totalPages);
    }
  }

  return (
    <div className="flex justify-center mt-6">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(currentPage - 1)}
              className={
                currentPage === 1 ? "pointer-events-none opacity-50" : ""
              }
            />
          </PaginationItem>

          {visiblePages.map((page, index) =>
            typeof page === "number" ? (
              <PaginationItem key={index}>
                <PaginationLink
                  isActive={currentPage === page}
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ) : (
              <PaginationItem key={index}>
                <span className="px-2 text-gray-500">...</span>
              </PaginationItem>
            )
          )}

          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange(currentPage + 1)}
              className={
                currentPage === totalPages
                  ? "pointer-events-none opacity-50"
                  : ""
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default PaginationControls;
