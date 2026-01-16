"use client";

import { useAddToCart, useCart } from "@/hooks/useCart";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useMemo } from "react";

interface BookPurchaseActionsProps {
  bookId: string;
  inStock: boolean;
  rokomariLink?: string;
  amazonLink?: string;
}

export default function BookPurchaseActions({
  bookId,
  inStock,
  rokomariLink,
  amazonLink,
}: BookPurchaseActionsProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const addToCartMutation = useAddToCart();
  const { data: cartData } = useCart(!!session);

  // Check if book is already in cart
  const isInCart = useMemo(() => {
    if (!cartData?.data?.items) return false;
    return cartData.data.items.some((item) => item.book?.id === bookId);
  }, [cartData, bookId]);

  const requireAuth = () => {
    router.push(`/login?redirect=/books/${bookId}`);
  };

  const handleAddToCart = async () => {
    if (!session) {
      requireAuth();
      return;
    }

    try {
      await addToCartMutation.mutateAsync({ bookId });
      toast.success("Book added to cart!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add to cart"
      );
    }
  };

  const handleCheckout = () => {
    router.push("/cart");
  };

  const handleBuyNow = async () => {
    if (!session) {
      requireAuth();
      return;
    }

    try {
      await addToCartMutation.mutateAsync({ bookId });
      router.push("/cart");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to process request"
      );
    }
  };

  const openExternal = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      {isInCart ? (
        <Button
          onClick={handleCheckout}
          disabled={!inStock}
          className="flex-1"
        >
          Go to Checkout
        </Button>
      ) : (
        <Button
          onClick={handleAddToCart}
          disabled={!inStock || addToCartMutation.isPending}
          className="flex-1"
        >
          {addToCartMutation.isPending ? "Adding..." : "Add to cart"}
        </Button>
      )}
      {rokomariLink && (
        <Button
          variant="outline"
          onClick={() => openExternal(rokomariLink)}
          className="flex-1 border-orange-400 text-orange-500 hover:bg-orange-50"
        >
          Buy on Rokomari
        </Button>
      )}
      {amazonLink && (
        <Button
          variant="outline"
          onClick={() => openExternal(amazonLink)}
          className="flex-1 border-amber-400 text-amber-500 hover:bg-amber-50"
        >
          Buy on Amazon
        </Button>
      )}
      {!rokomariLink && !amazonLink && (
        <Button
          variant="outline"
          onClick={handleBuyNow}
          disabled={!inStock}
          className="flex-1"
        >
          Buy now
        </Button>
      )}
    </div>
  );
}

