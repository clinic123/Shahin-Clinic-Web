"use client";
import RichTextEditor from "@/components/ui/rich-text-editor";
import { ImageUpload } from "@/components/ui/image-upload";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { toast } from "sonner";

const createCourse = async (courseData: any) => {
  const response = await fetch("/api/courses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(courseData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create course");
  }

  return response.json();
};

const CreateCoursePage = () => {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    price: "",
    videoUrl: "",
    shortDescription: "",
  });

  const createCourseMutation = useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      toast.success("Course created successfully!");
      setShowCreateModal(false);
      setFormData({
        title: "",
        description: "",
        image: "",
        price: "",
        videoUrl: "",
        shortDescription: "",
      });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Handle image upload for the course
  const handleImageChange = async (imageUrl: string) => {
    setFormData({ ...formData, image: imageUrl });
  };

  // Handle image removal
  const handleImageRemove = async () => {
    setFormData({ ...formData, image: "" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCourseMutation.mutate({
      ...formData,
      price: parseFloat(formData.price),
    });
  };

  return (
    <div className="bg-white container py-10 w-full ">
      <h2 className="text-2xl font-bold mb-6">Create New Course</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Course Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full p-3 border border-gray-300 rounded-lg"
            placeholder="Enter course title"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Short Description
          </label>
          <textarea
            value={formData.shortDescription}
            onChange={(e) =>
              setFormData({ ...formData, shortDescription: e.target.value })
            }
            className="w-full p-3 border border-gray-300 rounded-lg"
            rows={4}
            placeholder="Enter course description"
            required
          />
        </div>

        {/* Replace the image URL input with ImageUpload component */}
        <div>
          <label className="block text-sm font-medium mb-2">Course Image</label>
          <div className="flex items-start gap-6">
            <ImageUpload
              currentImage={formData.image}
              onImageChange={handleImageChange}
              onImageRemove={handleImageRemove}
              variant="square" // Use square variant for course images
              size="lg" // Larger size for course images
              fallbackText="Course"
              maxSize={10} // Increase max size for course images if needed
              className="mb-4"
            />

            {/* Optional: Keep the URL input as fallback or alternative */}
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2 text-gray-600">
                Or enter image URL
              </label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-gray-500 mt-2">
                You can either upload an image or paste a URL
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Price (BDT)</label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
            className="w-full p-3 border border-gray-300 rounded-lg"
            placeholder="5000"
            min="0"
            step="0.01"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Video URL (Optional)
          </label>
          <input
            type="url"
            value={formData.videoUrl}
            onChange={(e) =>
              setFormData({ ...formData, videoUrl: e.target.value })
            }
            className="w-full p-3 border border-gray-300 rounded-lg"
            placeholder="https://example.com/video"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <RichTextEditor
            value={formData.description}
            onChange={(val: string) =>
              setFormData({ ...formData, description: val })
            }
            placeholder="Enter course description..."
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => setShowCreateModal(false)}
            className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createCourseMutation.isPending}
            className="flex-1 bg-primary text-white py-3 rounded-lg hover:bg-opacity-90 transition disabled:opacity-50"
          >
            {createCourseMutation.isPending ? "Creating..." : "Create Course"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCoursePage;
