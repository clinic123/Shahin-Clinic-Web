// app/checkout/page.tsx
"use client";

import { useEffect, useState } from "react";

import LoadingUi from "@/components/loading";
import { useCart } from "@/hooks/useCart";
import { useCreateOrder } from "@/hooks/useOrders";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function CheckoutPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    paymentMethod: "BKASH",
    paymentTransactionId: "",
    paymentMobile: "",
    shippingAddress: "",
    customerPhone: "",
    customerName: "",
    customerEmail: "",
  });

  const {
    data: cartData,
    isLoading: cartLoading,
    error: cartError,
  } = useCart();
  const createOrderMutation = useCreateOrder();

  useEffect(() => {
    if (isPending) return;

    if (!session) {
      router.push("/login?redirect=/checkout");
      return;
    }

    // Pre-fill user data
    if (session.user) {
      setFormData((prev) => ({
        ...prev,
        customerName: session.user.name || "",
        customerEmail: session.user.email || "",
        customerPhone: session.user.phoneNumber || "",
      }));
    }
  }, [session, isPending, router]);

  const cart = cartData?.data;
  const items = cart?.items || [];

  const subtotal = items.reduce((total, item) => {
    return total + item.quantity * item.book.price;
  }, 0);

  const shippingFee = items.length > 0 ? 60 : 0;
  const grandTotal = subtotal + shippingFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (items.length === 0) {
      toast.error("Your cart is empty");
      setLoading(false);
      return;
    }

    try {
      await createOrderMutation.mutateAsync(formData);
      toast.success("Order placed successfully!");
      router.push("/orders");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to place order"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (isPending) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingUi />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (cartError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="text-red-600 bg-red-50 p-4 rounded-lg max-w-md mx-auto">
            <p className="font-semibold">Error loading cart</p>
            <p className="text-sm mt-1">{cartError.message}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-[var(--primary)] text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
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
              Add some books to your cart before checkout
            </p>
            <button
              onClick={() => router.push("/books")}
              className="bg-[var(--primary)] text-white px-8 py-3 rounded-lg hover:bg-opacity-90 transition font-semibold"
            >
              Browse Books
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="lg:order-2">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-6 pb-4 border-b">
                Order Summary
              </h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <img
                      src={item.book.image}
                      alt={item.book.title}
                      className="w-16 h-20 object-cover rounded flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {item.book.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        By {item.book.author}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm text-gray-600">
                          Qty: {item.quantity}
                        </span>
                        <span className="font-medium text-gray-900">
                          ৳{(item.quantity * item.book.price).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({items.length} items)</span>
                  <span>৳{subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Shipping Fee</span>
                  <span>৳{shippingFee.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm text-green-600">
                  <span>Estimated Delivery</span>
                  <span>3-5 business days</span>
                </div>

                <hr className="my-3" />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>৳{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Security Badges */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-center space-x-6 text-gray-500">
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
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    <span className="text-xs">Quality Guarantee</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="lg:order-1">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Customer Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="customerEmail"
                      value={formData.customerEmail}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                    placeholder="01XXXXXXXXX"
                    required
                  />
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Complete Shipping Address *
                  </label>
                  <textarea
                    name="shippingAddress"
                    value={formData.shippingAddress}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent resize-none"
                    placeholder="Enter your complete shipping address including house number, road, area, city, and postal code"
                    required
                  />
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Payment Information
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method *
                    </label>
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                      required
                    >
                      <option value="BKASH">bKash</option>
                      <option value="NAGAD">Nagad</option>
                      <option value="ROCKET">Rocket</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Mobile Number *
                    </label>
                    <input
                      type="text"
                      name="paymentMobile"
                      value={formData.paymentMobile}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                      placeholder="01XXXXXXXXX"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transaction ID *
                    </label>
                    <input
                      type="text"
                      name="paymentTransactionId"
                      value={formData.paymentTransactionId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                      placeholder="Enter transaction ID (e.g., B6F9N5T3K8)"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Please enter the exact transaction ID from your payment
                    </p>
                  </div>
                </div>

                {/* Payment Instructions */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-800 mb-2">
                    Payment Instructions:
                  </h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>
                      • Send ৳{grandTotal.toFixed(2)} to{" "}
                      {formData.paymentMethod === "BKASH"
                        ? "bKash"
                        : formData.paymentMethod === "NAGAD"
                        ? "Nagad"
                        : "Rocket"}{" "}
                      merchant number:{" "}
                      <strong className="text-blue-900">01741540117</strong>
                    </li>
                    <li>• Use your phone number as reference</li>
                    <li>• Enter the exact transaction ID above</li>
                    <li>• Keep the payment screenshot for verification</li>
                  </ul>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className="mt-1 w-4 h-4 text-[var(--primary)] border-gray-300 rounded focus:ring-[var(--primary)]"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600">
                    I agree to the Terms and Conditions and Privacy Policy. I
                    understand that my order will be processed after payment
                    verification and I will receive email confirmation.
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={
                  loading || createOrderMutation.isPending || items.length === 0
                }
                className="w-full bg-[var(--primary)] text-white py-4 rounded-lg hover:bg-opacity-90 transition font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading || createOrderMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing Order...
                  </>
                ) : (
                  `Place Order - ৳${grandTotal.toFixed(2)}`
                )}
              </button>

              {/* Back to Cart */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="text-[var(--primary)] hover:text-opacity-80 transition font-medium"
                >
                  ← Back to Cart
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
