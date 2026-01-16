"use client";

import RichTextEditor from "@/components/ui/rich-text-editor";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateTopic, useForumCategories } from "@/hooks/useForum";
import { useSession } from "@/lib/auth-client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewTopicForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const { data: categories, isLoading } = useForumCategories();
  const createTopicMutation = useCreateTopic();
  const router = useRouter();
  const { data: session } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim() || !categoryId) {
      return;
    }

    try {
      const topic = await createTopicMutation.mutateAsync({
        title,
        content,
        categoryId,
      });

      // Redirect to the new topic
      router.push(`/forum/topics/${topic.slug}`);
    } catch (error) {
      console.error("Failed to create topic:", error);
    }
  };

  if (!session) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Sign In Required
          </h3>
          <p className="text-gray-500 mb-4">
            You need to be signed in to create new topics.
          </p>
          <Button>Sign In</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Topic</CardTitle>
        <CardDescription>
          Choose a category and write your question or discussion topic
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color || "cyan" }}
                      />
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Topic Title</Label>
            <Input
              id="title"
              placeholder="Enter a clear and descriptive title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <p className="text-sm text-gray-500">
              Make sure your title summarizes the main point of your topic
            </p>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <RichTextEditor
              value={content}
              onChange={(e) => setContent(e)}
              placeholder="Enter your topic content..."
            />

            <p className="text-sm text-gray-500">
              Be specific and include all relevant information to help others
              understand your question or discussion point.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                !title.trim() ||
                !content.trim() ||
                !categoryId ||
                createTopicMutation.isPending
              }
            >
              {createTopicMutation.isPending ? "Creating..." : "Create Topic"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
