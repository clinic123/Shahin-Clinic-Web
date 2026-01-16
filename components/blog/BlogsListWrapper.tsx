import { Suspense } from "react";
import BlogsList from "./BlogList";
import { BlogsListSkeleton } from "./BlogsListSkeleton";

interface BlogsListWrapperProps {
  category?: string;
  sort?: string;
  search?: string;
  page?: string;
  limit?: string;
  params: "homepage" | "blogs";
}

export default function BlogsListWrapper({
  category,
  sort,
  search,
  page,
  limit,
  params,
}: BlogsListWrapperProps) {
  return (
    <Suspense fallback={<BlogsListSkeleton params={params} />}>
      <BlogsList
        category={category || ""}
        sort={sort}
        search={search}
        page={page}
        limit={limit}
        params={params}
      />
    </Suspense>
  );
}
