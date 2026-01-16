"use client";

import { useState } from "react";

import LoadingUi from "@/components/loading";
import { useCart, useRemoveFromCart, useUpdateCartItem } from "@/hooks/useCart";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface CartItem {
  id: string;
  quantity: number;
  book: {
    id: string;
    title: string;
    author: string;
    image: string;
    price: number;
    stock: number;
    rokomariLinkForDirectBuy?: string;
    amazonLink?: string;
    isActive: boolean;
  };
}

interface Cart {
  id: string;
  items: CartItem[];
}

export default function CartPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);
  const [removingItem, setRemovingItem] = useState<string | null>(null);

  const { data: cartData, isLoading, error, refetch } = useCart();

  const updateCartItemMutation = useUpdateCartItem();
  const removeFromCartMutation = useRemoveFromCart();

  const cart: Cart | null = cartData?.data || null;
  const items = cart?.items || [];

  const updateQuantity = async (cartItemId: string, newQuantity: number) => {
    setUpdatingItem(cartItemId);
    try {
      await updateCartItemMutation.mutateAsync({
        cartItemId,
        quantity: newQuantity,
      });
      toast.success("Cart updated");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update cart"
      );
    } finally {
      setUpdatingItem(null);
    }
  };

  const removeItem = async (cartItemId: string) => {
    setRemovingItem(cartItemId);
    try {
      await removeFromCartMutation.mutateAsync(cartItemId);
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to remove item"
      );
    } finally {
      setRemovingItem(null);
    }
  };

  const clearCart = async () => {
    try {
      const response = await fetch("/api/cart/clear", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to clear cart");
      }

      toast.success("Cart cleared");
      refetch();
    } catch (error) {
      toast.error("Failed to clear cart");
    }
  };

  const totalAmount = items.reduce((total, item) => {
    return total + item.quantity * item.book.price;
  }, 0);

  const shippingFee = items.length > 0 ? 60 : 0;
  const grandTotal = totalAmount + shippingFee;

  if (isPending) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingUi />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="text-red-600 bg-red-50 p-4 rounded-lg max-w-md mx-auto">
            <p className="font-semibold">Error loading cart</p>
            <p className="text-sm mt-1">{error.message}</p>
          </div>
          <button
            onClick={() => refetch()}
            className="mt-4 bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 mt-2">
            {items.length} {items.length === 1 ? "item" : "items"} in your cart
          </p>
        </div>

        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="text-red-600 hover:text-red-800 transition font-medium"
          >
            Clear Cart
          </button>
        )}
      </div>

      {!cart || items.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <svg
              className="w-24 h-24 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">
              Browse our collection and add some books to your cart!
            </p>
            <Link
              href="/books"
              className="inline-block bg-primary text-white px-8 py-3 rounded-lg hover:bg-opacity-90 transition font-semibold"
            >
              Browse Books
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="border-b border-gray-200 last:border-b-0"
                >
                  <div className="p-6">
                    <div className="flex items-start space-x-4">
                      <img
                        src={item.book.image}
                        alt={item.book.title}
                        className="w-20 h-28 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {item.book.title}
                            </h3>
                            <p className="text-gray-600 mb-2">
                              By {item.book.author}
                            </p>
                            <p className="text-lg font-bold text-[var(--primary)] mb-3">
                              ৳{item.book.price}
                            </p>

                            {/* Stock status */}
                            {item.book.stock < item.quantity && (
                              <p className="text-sm text-red-600 bg-red-50 p-2 rounded mb-2">
                                Only {item.book.stock} units available
                              </p>
                            )}
                          </div>

                          {/* Remove button */}
                          <button
                            onClick={() => removeItem(item.id)}
                            disabled={removingItem === item.id}
                            className="text-gray-400 hover:text-red-600 transition ml-4"
                          >
                            {removingItem === item.id ? (
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                            ) : (
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
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            )}
                          </button>
                        </div>

                        {/* Quantity controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-gray-700">
                              Quantity:
                            </span>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                                disabled={
                                  updatingItem === item.id || item.quantity <= 1
                                }
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 transition"
                              >
                                -
                              </button>
                              <span className="w-8 text-center font-medium">
                                {updatingItem === item.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--primary)] mx-auto"></div>
                                ) : (
                                  item.quantity
                                )}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                                disabled={
                                  updatingItem === item.id ||
                                  item.quantity >= item.book.stock
                                }
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 transition"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-sm text-gray-600">Total</p>
                            <p className="text-lg font-bold text-gray-900">
                              ৳{(item.quantity * item.book.price).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({items.length} items)</span>
                  <span>৳{totalAmount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Shipping Fee</span>
                  <span>৳{shippingFee.toFixed(2)}</span>
                </div>

                {items.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Estimated Delivery</span>
                    <span className="text-green-600">3-5 business days</span>
                  </div>
                )}

                <hr className="my-3" />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>৳{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => router.push("/checkout")}
                disabled={items.length === 0}
                className="w-full bg-[var(--primary)] text-white py-3 rounded-lg hover:bg-opacity-90 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Proceed to Checkout
              </button>

              <div className="mt-4 text-center">
                <Link
                  href="/books"
                  className="text-[var(--primary)] hover:text-opacity-80 transition font-medium"
                >
                  Continue Shopping
                </Link>
              </div>

              {/* Security badges */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-center space-x-4 text-gray-500">
                  <div className="text-center">
                    <svg
                      className="w-8 h-8 mx-auto mb-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <span className="text-xs">Secure Payment</span>
                  </div>
                  <div className="text-center">
                    <svg
                      className="w-8 h-8 mx-auto mb-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                    <span className="text-xs">Fast Delivery</span>
                  </div>
                  <div className="text-center">
                    <svg
                      className="w-8 h-8 mx-auto mb-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    <span className="text-xs">Quality Guarantee</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
