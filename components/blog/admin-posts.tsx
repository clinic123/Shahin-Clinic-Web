"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PostTypeWithRelations } from "@/types/post";
import { Edit2, Trash2 } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { FaEye } from "react-icons/fa6";
import { DeleteBlogDialog } from "./delete-blog-dialog";

function AdminPostsPage({
  posts,
  params,
}: {
  posts: PostTypeWithRelations[];
  params: "admin" | "dashboard" | "doctor";
}) {
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    slug: string;
    title: string;
  }>({
    open: false,
    slug: "",
    title: "",
  });

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No blog posts found. Create one to get started!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 pt-5">
        <div className="flex justify-between">
          <Link href={`/${params}/blogs/create`}>
            <Button>Create New Blog</Button>
          </Link>
        </div>
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No blog posts found. Create one to get started!
            </p>
          </div>
        ) : (
          posts?.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{post.title}</CardTitle>
                    <CardDescription>
                      {post.shortDescription || post.content.substring(0, 100)}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/blogs/${post.slug}`}>
                      <Button variant="outline" size="sm">
                        <FaEye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/admin/blogs/edit/${post.slug}`}>
                      <Button variant="outline" size="sm">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive bg-transparent"
                      onClick={() =>
                        setDeleteDialog({
                          open: true,
                          slug: post.slug,
                          title: post.title,
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 items-center">
                  {post?.category && (
                    <Badge variant="secondary">{post?.category.name}</Badge>
                  )}
                  {post?.tags?.map((t) => (
                    <Badge key={t.tag.name} variant="outline">
                      {t.tag.name}
                    </Badge>
                  ))}
                  <span className="text-sm text-muted-foreground ml-auto">
                    By {post?.author.name} •{" "}
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <DeleteBlogDialog
        slug={deleteDialog.slug}
        title={deleteDialog.title}
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open }))}
      />
    </>
  );
}

export default React.memo(AdminPostsPage);
