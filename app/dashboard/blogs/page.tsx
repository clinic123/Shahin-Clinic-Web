"use client";

import AdminPostsPage from "@/components/blog/admin-posts";
import { useUSersBlogs } from "@/hooks/useBlogs";
import { Suspense } from "react";

export default function AdminBlog() {
  const { data: posts } = useUSersBlogs();

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
      <AdminPostsPage params="dashboard" posts={posts || ([] as any)} />
    </Suspense>
  );
}
