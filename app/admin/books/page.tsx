"use client";

import { useState } from "react";

import LoadingUi from "@/components/loading";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageUpload } from "@/components/ui/image-upload";
import RichTextEditor from "@/components/ui/rich-text-editor";
import { useBooks, type Book } from "@/hooks/useBooks";
import { createBook, deleteBook, updateBook } from "@/lib/actions/books";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";

export default function AdminBooksPage() {
  const { data: session, isPending } = useSession();

  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    page: 1,
    limit: 10,
    inStock: true,
  });

  const {
    data: booksData,
    isLoading,
    error,
    refetch,
  } = useBooks({
    ...filters,
    // Admin can see inactive books too
    isActive: undefined,
  });

  const [actionInProgress, setActionInProgress] = useState<
    null | "create" | "update" | "delete" | "toggle"
  >(null);

  // Check if user is admin
  if (isPending) {
    return <LoadingUi />;
  }

  const books = booksData?.data || [];
  const pagination = booksData?.pagination;

  const normalizeBookPayload = (data: any) => ({
    ...data,
    price:
      data.price === "" || data.price === undefined
        ? undefined
        : parseFloat(String(data.price)),
    stock:
      data.stock === "" || data.stock === undefined
        ? undefined
        : parseInt(String(data.stock), 10),
  });

  const handleCreateBook = async (bookData: any) => {
    try {
      setActionInProgress("create");
      const result = await createBook(normalizeBookPayload(bookData));
      if (!result.success) {
        throw new Error(result.error || "Failed to create book");
      }
      toast.success(result.message ?? "Book created successfully!");
      setShowCreateModal(false);
      refetch();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create book"
      );
    } finally {
      setActionInProgress(null);
    }
  };

  const handleUpdateBook = async (bookData: any) => {
    if (!selectedBook) return;

    try {
      setActionInProgress("update");
      const result = await updateBook(
        selectedBook.id,
        normalizeBookPayload(bookData)
      );
      if (!result.success) {
        throw new Error(result.error || "Failed to update book");
      }
      toast.success(result.message ?? "Book updated successfully!");
      setSelectedBook(null);
      refetch();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update book"
      );
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDeleteBook = async () => {
    if (!selectedBook) return;

    try {
      setActionInProgress("delete");
      const result = await deleteBook(selectedBook.id);
      if (!result.success) {
        throw new Error(result.error || "Failed to delete book");
      }
      toast.success(result.message ?? "Book deleted successfully!");
      setShowDeleteModal(false);
      setSelectedBook(null);
      refetch();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete book"
      );
    } finally {
      setActionInProgress(null);
    }
  };

  const handleToggleStatus = async (book: Book) => {
    try {
      setActionInProgress("toggle");
      const result = await updateBook(book.id, { isActive: !book.isActive });
      if (!result.success) {
        throw new Error(result.error || "Failed to update status");
      }
      toast.success("Status updated");
      refetch();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update status"
      );
    } finally {
      setActionInProgress(null);
    }
  };

  const isSubmittingCreate = actionInProgress === "create";
  const isSubmittingUpdate = actionInProgress === "update";
  const isDeleting = actionInProgress === "delete";
  const isToggling = actionInProgress === "toggle";

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Books</h1>
          <p className="text-gray-600 mt-2">
            Create, edit, and manage your book inventory
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-[var(--primary)] text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add New Book
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Books</p>
              <p className="text-2xl font-bold text-gray-900">
                {pagination?.totalCount || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Stock</p>
              <p className="text-2xl font-bold text-green-600">
                {books.filter((b) => b.stock > 0).length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">
                {books.filter((b) => b.stock === 0).length}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inactive</p>
              <p className="text-2xl font-bold text-yellow-600">
                {books.filter((b) => !b.isActive).length}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Search books..."
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  search: e.target.value,
                  page: 1,
                }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <select
            value={filters.limit}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                limit: parseInt(e.target.value),
                page: 1,
              }))
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="10">10 per page</option>
            <option value="25">25 per page</option>
            <option value="50">50 per page</option>
            <option value="100">100 per page</option>
          </select>
        </div>
      </div>

      {/* Books Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading books...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="text-red-600 bg-red-50 p-4 rounded-lg max-w-md mx-auto">
              <p className="font-semibold">Error loading books</p>
              <p className="text-sm mt-1">{error.message}</p>
            </div>
            <button
              onClick={() => refetch()}
              className="mt-4 bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Book
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {books.map((book) => (
                    <tr key={book.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            className="h-12 w-9 object-cover rounded"
                            src={book.image}
                            alt={book.title}
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {book.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              by {book.author}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ৳{book.price}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`text-sm font-medium ${
                            book.stock > 10
                              ? "text-green-600"
                              : book.stock > 0
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {book.stock} units
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            book.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {book.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedBook(book)}
                            className="text-blue-600 hover:text-blue-900 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setSelectedBook(book);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-900 transition"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => handleToggleStatus(book)}
                            disabled={isToggling}
                            className={`text-sm px-2 py-1 rounded ${
                              book.isActive
                                ? "text-yellow-600 hover:text-yellow-900"
                                : "text-green-600 hover:text-green-900"
                            }`}
                          >
                            {book.isActive ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.totalCount
                    )}{" "}
                    of {pagination.totalCount} results
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, page: prev.page - 1 }))
                      }
                      disabled={!pagination.hasPrevPage}
                      className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 bg-[var(--primary)] text-white rounded">
                      {pagination.page}
                    </span>
                    <button
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, page: prev.page + 1 }))
                      }
                      disabled={!pagination.hasNextPage}
                      className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Book Modal */}
      {(showCreateModal || selectedBook) && (
        <BookFormModal
          book={selectedBook}
          isOpen={showCreateModal || !!selectedBook}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedBook(null);
          }}
          onSubmit={selectedBook ? handleUpdateBook : handleCreateBook}
          isLoading={selectedBook ? isSubmittingUpdate : isSubmittingCreate}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedBook && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedBook(null);
          }}
          onConfirm={handleDeleteBook}
          isLoading={isDeleting}
          bookTitle={selectedBook.title}
        />
      )}
    </div>
  );
}

// Book Form Modal Component
interface BookFormModalProps {
  book?: Book | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

const BookFormModal: React.FC<BookFormModalProps> = ({
  book,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    title: book?.title || "",
    author: book?.author || "",
    description: book?.description || "",
    image: book?.image || "",
    price: book?.price || "",
    stock: book?.stock || 0,
    rokomariLinkForDirectBuy: book?.rokomariLinkForDirectBuy || "",
    amazonLink: book?.amazonLink || "",
    isActive: book?.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleImageChange = async (imageUrl: string) => {
    setFormData((prev) => ({
      ...prev,
      image: imageUrl,
    }));
  };
  const handleImageRemove = async () => {
    setFormData((prev) => ({
      ...prev,
      image: "",
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle> {book ? "Edit Book" : "Create New Book"}</DialogTitle>
        </DialogHeader>
        <div className="">
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter book title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Author *
                  </label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        author: e.target.value,
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter author name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description *
                </label>
                <RichTextEditor
                  value={formData.description}
                  onChange={(val: string) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: val,
                    }))
                  }
                  placeholder="Enter book description..."
                />

                {/* <Textarea
                  name="description"
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Enter book description..."
                /> */}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Image URL *
                </label>

                <ImageUpload
                  currentImage={formData.image}
                  onImageChange={handleImageChange}
                  onImageRemove={handleImageRemove}
                  variant="square"
                  size="lg"
                  fallbackText="gallery"
                  className="mb-4"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Price (BDT) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        price: e.target.value,
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    placeholder="500"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Stock *
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        stock: parseInt(e.target.value),
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    placeholder="100"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Status
                  </label>
                  <select
                    value={formData.isActive.toString()}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isActive: e.target.value === "true",
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Rokomari Link (Optional)
                </label>
                <input
                  type="url"
                  value={formData.rokomariLinkForDirectBuy}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      rokomariLinkForDirectBuy: e.target.value,
                    }))
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  placeholder="https://www.rokomari.com/book/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Amazon Link (Optional)
                </label>
                <input
                  type="url"
                  value={formData.amazonLink}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      amazonLink: e.target.value,
                    }))
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  placeholder="https://www.amazon.com/dp/..."
                />
              </div>

              <div className="flex gap-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition disabled:opacity-50"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-[var(--primary)] text-white py-3 rounded-lg hover:bg-opacity-90 transition disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {book ? "Updating..." : "Creating..."}
                    </div>
                  ) : book ? (
                    "Update Book"
                  ) : (
                    "Create Book"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Delete Confirmation Modal Component
interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  bookTitle: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  bookTitle,
}) => {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Book</DialogTitle>
        </DialogHeader>
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mt-4">
              Delete Book
            </h3>
            <p className="text-sm text-gray-500 mt-2">
              Are you sure you want to delete "<strong>{bookTitle}</strong>"?
              This action cannot be undone.
            </p>
          </div>
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Deleting...
                </div>
              ) : (
                "Delete Book"
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
