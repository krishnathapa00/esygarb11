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

  visiblePages.push(1);

  if (totalPages <= 7) {
    for (let i = 2; i <= totalPages; i++) {
      visiblePages.push(i);
    }
  } else {
    if (currentPage <= 4) {
      for (let i = 2; i <= 5; i++) {
        visiblePages.push(i);
      }
      visiblePages.push("...");
      visiblePages.push(totalPages);
    } else if (currentPage >= totalPages - 3) {
      visiblePages.push("...");
      for (let i = totalPages - 4; i < totalPages; i++) {
        visiblePages.push(i);
      }
      visiblePages.push(totalPages);
    } else {
      visiblePages.push("...");
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        visiblePages.push(i);
      }
      visiblePages.push("...");
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
                <span className="px-2 text-gray-500 select-none">{page}</span>
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
