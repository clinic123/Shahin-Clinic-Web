"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAddToCart, useCart } from "@/hooks/useCart";
import type { BookRecord } from "@/lib/actions/fetchBooksData";
import { useSession } from "@/lib/auth-client";

interface BookCardProps {
  book: BookRecord;
}

export default function BookCard({ book }: BookCardProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const addToCartMutation = useAddToCart();
  const { data: cartData } = useCart(!!session);

  // Check if book is already in cart
  const isInCart = useMemo(() => {
    if (!cartData?.data?.items) return false;
    return cartData.data.items.some((item) => item.book?.id === book.id);
  }, [cartData, book.id]);

  const requireAuth = () => {
    router.push(`/login?redirect=/books/${book.id}`);
  };

  const handleAddToCart = async () => {
    if (!session) {
      requireAuth();
      return;
    }

    try {
      await addToCartMutation.mutateAsync({ bookId: book.id });
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

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-xl">
      <div className="relative aspect-4/3 overflow-hidden bg-muted/30">
        <Image
          src={book.image}
          alt={book.title}
          fill
          className="object-contain p-3 transition duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
        <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          {isInCart ? (
            <Button
              size="sm"
              className="w-full rounded-full font-semibold"
              onClick={handleCheckout}
              disabled={book.stock === 0}
            >
              {book.stock === 0 ? "Out of stock" : "Proceed to checkout"}
            </Button>
          ) : (
            <Button
              size="sm"
              className="w-full rounded-full font-semibold"
              onClick={handleAddToCart}
              disabled={addToCartMutation.isPending || book.stock === 0}
            >
              {book.stock === 0
                ? "Out of stock"
                : addToCartMutation.isPending
                ? "Adding..."
                : "Add to cart"}
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <p className="text-xs uppercase text-muted-foreground tracking-wide">
            {book.author}
          </p>
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {book.title}
          </h3>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary">৳{book.price}</span>
          {book.stock > 0 ? (
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
              In Stock
            </span>
          ) : (
            <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
              Out of Stock
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 gap-2">
          <Link
            href={`/books/${book.id}`}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90"
          >
            View details
          </Link>
          {book.rokomariLinkForDirectBuy && (
            <Link
              href={book.rokomariLinkForDirectBuy}
              target="_blank"
              className="inline-flex items-center justify-center rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/5"
            >
              Buy on Rokomari
            </Link>
          )}
          {book.amazonLink && (
            <Link
              href={book.amazonLink}
              target="_blank"
              className="inline-flex items-center justify-center rounded-lg border border-amber-400 px-4 py-2 text-sm font-medium text-amber-500 transition hover:bg-amber-50"
            >
              Buy on Amazon
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
