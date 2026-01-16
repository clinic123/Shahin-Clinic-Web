import { formatDate } from "@/lib/utils";
import type { Post as PostType } from "@/prisma/generated/prisma";
import Link from "next/link";

interface PostProps {
  post: PostType;
}

export function PostCard({ post }: PostProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <time dateTime={post.publishedAt?.toISOString()}>
            {formatDate(post.createdAt!)}
          </time>
          <span>•</span>
          <span>{"Tarif"}</span>
        </div>
        <h3 className="text-xl font-semibold mb-2">
          <Link href={`/blog/${post.id}`} className="hover:text-primary">
            {post.title}
          </Link>
        </h3>
        {/* {post.excerpt && <p className="text-gray-600 mb-4">{post.excerpt}</p>}
        {post.categories.length > 0 && (
          <div className="flex gap-2">
            {post.categories.map((category) => (
              <span
                key={category.slug}
                className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm"
              >
                {category.name}
              </span>
            ))}
          </div>
        )} */}
      </div>
    </div>
  );
}
