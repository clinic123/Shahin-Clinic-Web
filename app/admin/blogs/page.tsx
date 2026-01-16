import AdminPostsPage from "@/components/blog/admin-posts";
import { fetchBlogData } from "@/lib/actions/fetchBlogData";
import { Suspense } from "react";

export default async function AdminBlog({
  searchParams,
}: {
  searchParams: Promise<{ category: string; sort: string; search: string }>;
}) {
  const category = (await searchParams).category;
  const sort = (await searchParams).sort;
  const search = (await searchParams).search;
  const posts = await fetchBlogData({ category, sort, search });

  return (
    <Suspense
      fallback={
        <>
          <div>
            <p>Loading.....</p>
          </div>
        </>
      }
    >
      <AdminPostsPage posts={posts} params={"admin"} />
    </Suspense>
  );
}
