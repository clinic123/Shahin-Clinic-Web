"use client";

import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Post {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  publishedAt: Date;
  author: {
    name: string;
  };
  categories: {
    name: string;
    slug: string;
  }[];
}

interface BlogPostsProps {
  page?: string;
  category?: string;
}

export default function BlogPosts({ page, category }: BlogPostsProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const params = new URLSearchParams();
        if (page) params.set("page", page);
        if (category) params.set("category", category);

        const response = await fetch(`/api/posts?${params}`);
        const data = await response.json();
        setPosts(data.posts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [page, category]);

  if (loading) {
    return <div>Loading posts...</div>;
  }

  return (
    <div className="space-y-8">
      {posts.map((post) => (
        <article key={post.id} className="border-b border-gray-200 pb-8">
          <h2 className="text-2xl font-semibold mb-3">
            <Link href={`/blog/${post.slug}`} className="hover:text-blue-600">
              {post.title}
            </Link>
          </h2>

          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <time dateTime={post.publishedAt.toISOString()}>
              {formatDate(post.publishedAt)}
            </time>
            <span>•</span>
            <span>{post.author.name}</span>
          </div>

          {post.excerpt && <p className="text-gray-700 mb-4">{post.excerpt}</p>}

          {post.categories.length > 0 && (
            <div className="flex gap-2">
              {post.categories.map((category) => (
                <span
                  key={category.slug}
                  className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm"
                >
                  {category.name}
                </span>
              ))}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
