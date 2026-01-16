"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSession } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  book: {
    id: string;
    title: string;
    author: string;
    image: string;
  };
}

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  paymentTransactionId: string;
  shippingAddress: string;
  customerPhone: string;
  customerEmail: string;
  createdAt: string;
  items: OrderItem[];
  paymentMobile: string;
}

const fetchOrders = async (): Promise<{ success: boolean; data: Order[] }> => {
  const response = await fetch("/api/books/orders");
  if (!response.ok) {
    throw new Error("Failed to fetch orders");
  }
  return response.json();
};

export default function OrdersPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [openSelectedOrderModal, setOpenSelectedOrderModal] = useState(false);
  const {
    data: ordersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
    enabled: !!session,
  });

  if (isPending) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    router.push("/login?callbackUrl=/orders");
    return null;
  }

  const orders = ordersData?.data || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "PROCESSING":
        return "bg-blue-100 text-blue-800";
      case "SHIPPED":
        return "bg-purple-100 text-purple-800";
      case "DELIVERED":
        return "bg-gray-100 text-gray-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Pending";
      case "CONFIRMED":
        return "Confirmed";
      case "PROCESSING":
        return "Processing";
      case "SHIPPED":
        return "Shipped";
      case "DELIVERED":
        return "Delivered";
      case "CANCELLED":
        return "Cancelled";
      default:
        return status;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        <p className="text-gray-600 mt-2">
          View your order history and track your purchases
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">Error loading orders: {error.message}</p>
        </div>
      )}

      {orders.length === 0 ? (
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
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <h2 className="text-2xl font-semibold mb-4">No Orders Yet</h2>
            <p className="text-gray-600 mb-6">
              You haven't placed any orders yet.
            </p>
            <button
              onClick={() => router.push("/books")}
              className="bg-[var(--primary)] text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition font-semibold"
            >
              Start Shopping
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
            >
              {/* Order Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Order #{order.id.slice(-8).toUpperCase()}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="mt-2 sm:mt-0">
                    <span
                      className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusText(order.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6">
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4">
                      <img
                        src={item.book.image}
                        alt={item.book.title}
                        className="w-16 h-20 object-cover rounded flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900">
                          {item.book.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          By {item.book.author}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-sm text-gray-600">
                            Qty: {item.quantity}
                          </span>
                          <span className="font-medium text-gray-900">
                            ৳{(item.quantity * item.price).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="text-lg font-bold text-gray-900">
                        ৳{order.totalAmount.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setOpenSelectedOrderModal(true);
                        }}
                        className="text-[var(--primary)] hover:text-opacity-80 transition font-medium"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => router.push(`/books`)}
                        className="text-gray-600 hover:text-gray-800 transition font-medium"
                      >
                        Buy Again
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}

      {selectedOrder && (
        <Dialog
          open={openSelectedOrderModal}
          onOpenChange={setOpenSelectedOrderModal}
        >
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          <DialogContent>
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div>
                <div className="flex items-center justify-between mb-6"></div>

                <div className="space-y-6">
                  {/* Order Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Order Information
                      </h3>
                      <div className="space-y-2 text-sm">
                        <p>
                          <strong>Order ID:</strong> #
                          {selectedOrder.id.slice(-8).toUpperCase()}
                        </p>
                        <p>
                          <strong>Order Date:</strong>{" "}
                          {new Date(selectedOrder.createdAt).toLocaleString()}
                        </p>
                        <p>
                          <strong>Status:</strong>{" "}
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              selectedOrder.status
                            )}`}
                          >
                            {getStatusText(selectedOrder.status)}
                          </span>
                        </p>
                        <p>
                          <strong>Total Amount:</strong> ৳
                          {selectedOrder.totalAmount.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Payment Information
                      </h3>
                      <div className="space-y-2 text-sm">
                        <p>
                          <strong>Payment Method:</strong>{" "}
                          {selectedOrder.paymentMethod}
                        </p>
                        <p>
                          <strong>Transaction ID:</strong>{" "}
                          {selectedOrder.paymentTransactionId}
                        </p>
                        <p>
                          <strong>Payment Mobile:</strong>{" "}
                          {selectedOrder?.paymentMobile}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Information */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Shipping Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Customer:</strong> {selectedOrder.customerEmail}
                      </p>
                      <p>
                        <strong>Phone:</strong> {selectedOrder.customerPhone}
                      </p>
                      <p>
                        <strong>Email:</strong> {selectedOrder.customerEmail}
                      </p>
                      <p>
                        <strong>Shipping Address:</strong>{" "}
                        {selectedOrder.shippingAddress}
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Order Items
                    </h3>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                        >
                          <img
                            src={item.book.image}
                            alt={item.book.title}
                            className="w-12 h-16 object-cover rounded flex-shrink-0"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {item.book.title}
                            </h4>
                            <p className="text-sm text-gray-600">
                              By {item.book.author}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">
                              ৳{item.price.toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-600">
                              Qty: {item.quantity}
                            </p>
                            <p className="font-medium text-gray-900">
                              ৳{(item.quantity * item.price).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t">
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
