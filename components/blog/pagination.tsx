import Link from "next/link";

interface PaginationProps {
  page: number;
  totalPages: number;
}

export function Pagination({ page, totalPages }: PaginationProps) {
  return (
    <div className="flex justify-center gap-2">
      {page > 1 && (
        <Link
          href={`/blog?page=${page - 1}`}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md"
        >
          Previous
        </Link>
      )}
      {page < totalPages && (
        <Link
          href={`/blog?page=${page + 1}`}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md"
        >
          Next
        </Link>
      )}
    </div>
  );
}
