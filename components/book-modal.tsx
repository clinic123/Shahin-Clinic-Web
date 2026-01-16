// components/book-modal.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAddToCart, useCart } from "@/hooks/useCart";
import { useSession } from "@/lib/auth-client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useMemo } from "react";

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  image: string;
  price: number;
  stock: number;
  rokomariLinkForDirectBuy?: string;
  amazonLink?: string;
}

interface BookModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (bookId: string) => void;
}

export function BookModal({
  book,
  isOpen,
  onClose,
  onAddToCart,
}: BookModalProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const addToCartMutation = useAddToCart();
  const { data: cartData } = useCart(!!session);

  // Check if book is already in cart
  const isInCart = useMemo(() => {
    if (!book || !cartData?.data?.items) return false;
    return cartData.data.items.some((item) => item.book?.id === book.id);
  }, [cartData, book]);

  const handleAddToCart = async (bookId: string) => {
    if (!session) {
      router.push("/login");
      return;
    }

    try {
      await addToCartMutation.mutateAsync({ bookId });
      toast.success("Book added to cart!");
      if (onAddToCart) {
        onAddToCart(bookId);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add to cart"
      );
    }
  };

  const handleCheckout = () => {
    router.push("/cart");
    onClose();
  };

  const handleExternalPurchase = (url: string) => {
    window.open(url, "_blank");
    onClose();
  };

  const handleBuyNow = (book: Book) => {
    handleAddToCart(book.id);
    router.push("/cart");
    onClose();
  };

  if (!book) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl! max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{book.title}</DialogTitle>
          <DialogDescription className="text-lg">
            By {book.author}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Book Image */}
          <div className="relative aspect-3/4 rounded-lg overflow-hidden">
            <Image
              src={book.image}
              alt={book.title}
              fill
              className="object-cover"
            />
          </div>

          {/* Book Details */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Description
              </h3>
              <p className="text-gray-600 mt-2 leading-relaxed">
                {book.description}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl font-bold text-primary">
                  ৳{book.price}
                </span>
              </div>
              <div>
                {book.stock > 0 ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    In Stock ({book.stock})
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              {isInCart ? (
                <Button
                  onClick={handleCheckout}
                  disabled={book.stock === 0}
                  className="flex-1 py-2.5 bg-primary hover:bg-primary/90"
                  size="lg"
                >
                  Go to Checkout
                </Button>
              ) : (
                <Button
                  onClick={() => handleAddToCart(book.id)}
                  disabled={addToCartMutation.isPending || book.stock === 0}
                  className="flex-1 py-2.5 bg-primary hover:bg-primary/90"
                  size="lg"
                >
                  {addToCartMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Adding...
                    </>
                  ) : (
                    "Add to Cart"
                  )}
                </Button>
              )}

              {book.rokomariLinkForDirectBuy && (
                <Button
                  onClick={() =>
                    handleExternalPurchase(book.rokomariLinkForDirectBuy!)
                  }
                  variant="outline"
                  className="flex-1 py-2.5 border-orange-400 text-orange-500 hover:bg-orange-50"
                  size="lg"
                >
                  Buy on Rokomari
                </Button>
              )}

              {book.amazonLink && (
                <Button
                  onClick={() => handleExternalPurchase(book.amazonLink!)}
                  variant="outline"
                  className="flex-1 py-2.5 border-amber-400 text-amber-500 hover:bg-amber-50"
                  size="lg"
                >
                  Buy on Amazon
                </Button>
              )}

              {!book.rokomariLinkForDirectBuy && !book.amazonLink && (
                <Button
                  onClick={() => handleBuyNow(book)}
                  disabled={book.stock === 0}
                  variant="outline"
                  className="flex-1 py-2.5"
                  size="lg"
                >
                  Buy Now
                </Button>
              )}
            </div>

            {(book.rokomariLinkForDirectBuy || book.amazonLink) && (
              <div className="bg-blue-50 p-3 rounded-lg space-y-1 text-sm text-blue-700">
                {book.rokomariLinkForDirectBuy && (
                  <p>
                    Available on <strong>Rokomari</strong>. Click “Buy on
                    Rokomari” to purchase instantly.
                  </p>
                )}
                {book.amazonLink && (
                  <p>
                    Also available on <strong>Amazon</strong>. Select “Buy on
                    Amazon” to open the product page.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
