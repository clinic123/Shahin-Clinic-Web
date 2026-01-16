import { CommentSection } from "@/components/blog/comment-section";
import TiptapRenderer from "@/components/TiptapRenderer";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { PostTypeWithRelations } from "@/types/post";

import { Suspense } from "react";

const fetchPost = async (slug: string) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/blogs/${slug}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch post");
  }

  const data = await res.json();
  return data.post;
};

const PostPageSkeleton = () => {
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {/* Breadcrumb Skeleton */}
      <div className="mb-6">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>

      {/* Header Skeleton */}
      <div className="mb-8">
        <Skeleton className="h-12 w-3/4 mb-4" />
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="space-y-4 mb-12">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="h-8" /> {/* Spacing */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="h-8" /> {/* Spacing */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <div className="h-8" /> {/* Spacing */}
        <Skeleton className="h-64 w-full" /> {/* Image placeholder */}
        <div className="h-8" /> {/* Spacing */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* Comment Section Skeleton */}
      <div className="space-y-6">
        {/* Comment Form Skeleton */}
        <div className="space-y-4 p-6 border rounded-lg">
          <Skeleton className="h-6 w-32" />
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-32 ml-auto" />
          </div>
        </div>

        {/* Comments List Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-40" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;

  const post = await fetchPost(slug);
  return {
    title: `${post.title} - Blog | Shaheen's Clinic`,
    description: post.shortDescription || post.excerpt || `Read our blog post: ${post.title}`,
    keywords: post.title + (post.category ? `, ${post.category.name}` : "") + ", homeopathy blog, Shaheen's Clinic",
  };
};

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post: PostTypeWithRelations = await fetchPost(slug);

  return (
    <Suspense fallback={<PostPageSkeleton />}>
      <div className="container mx-auto py-8 max-w-4xl">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/blogs">Blogs</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{post.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <article className="prose lg:prose-xl pt-6 max-w-none">
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
            <div className="flex mb-6 items-center gap-4 text-sm text-muted-foreground">
              <time dateTime={formatDate(post.publishedAt)}>
                {formatDate(post.publishedAt)}
              </time>
              <span>•</span>
              <span>{post?.author?.name}</span>
            </div>
            <TiptapRenderer content={post.content} />
          </header>
        </article>
        <CommentSection postSlug={slug} postId={post.id} />
      </div>
    </Suspense>
  );
}
