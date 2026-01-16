"use client";

import LoadingUi from "@/components/loading";
import { useSession } from "@/lib/auth-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Order {
  id: string;
  createdAt: string;
  totalAmount: number;
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  paymentMethod: string;
  paymentTransactionId: string;
  paymentMobile: string;
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    book: {
      id: string;
      title: string;
      author: string;
      image: string | null;
      price: number;
      stock: number;
    };
  }>;
}

interface EmailTemplate {
  subject: string;
  message: string;
}

interface UpdateOrderData {
  status?: string;
  shippingAddress?: string;
  customerPhone?: string;
  customerName?: string;
  customerEmail?: string;
}

// API functions
const fetchOrder = async (orderId: string): Promise<Order> => {
  const response = await fetch(`/api/admin/orders/${orderId}`);
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || "Failed to fetch order");
  }
  return result.data;
};

const updateOrder = async ({
  orderId,
  data,
}: {
  orderId: string;
  data: UpdateOrderData;
}): Promise<Order> => {
  const response = await fetch(`/api/admin/orders/${orderId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || "Failed to update order");
  }
  return result.data;
};

const deleteOrder = async (orderId: string): Promise<void> => {
  const response = await fetch(`/api/admin/orders/${orderId}`, {
    method: "DELETE",
  });
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || "Failed to delete order");
  }
};

export default function OrderDetailPage() {
  const { data: session, isPending: isSessionLoading } = useSession();
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const orderId = params.id as string;

  const [message, setMessage] = useState("");
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailTemplate, setEmailTemplate] = useState<EmailTemplate>({
    subject: "",
    message: "",
  });

  // Query for fetching order
  const {
    data: order,
    isLoading: isOrderLoading,
    error: orderError,
    refetch: refetchOrder,
  } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => fetchOrder(orderId),
    enabled:
      !!orderId && !!session?.user?.role && session.user.role === "admin",
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation for updating order status
  const updateOrderMutation = useMutation({
    mutationFn: updateOrder,
    onMutate: async ({ orderId, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["order", orderId] });

      // Snapshot the previous value
      const previousOrder = queryClient.getQueryData(["order", orderId]);

      // Optimistically update to the new value
      queryClient.setQueryData(["order", orderId], (old: Order) => ({
        ...old,
        ...data,
      }));

      return { previousOrder };
    },
    onError: (err, variables, context) => {
      // Rollback to the previous value
      if (context?.previousOrder) {
        queryClient.setQueryData(
          ["order", variables.orderId],
          context.previousOrder
        );
      }
      setMessage(`Error: ${err.message}`);
      setTimeout(() => setMessage(""), 3000);
    },
    onSuccess: (data, variables) => {
      setMessage(
        `Order status updated to ${variables.data.status} successfully`
      );

      // Auto-generate email template for status updates
      if (variables.data.status && variables.data.status !== "cancelled") {
      }

      setTimeout(() => setMessage(""), 3000);

      // Invalidate and refetch orders list to update the cache
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onSettled: () => {
      // Always refetch to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
    },
  });

  // Mutation for deleting order
  const deleteOrderMutation = useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      setMessage("Order deleted successfully");
      // Invalidate orders list
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setTimeout(() => {
        router.push("/admin/orders");
      }, 1000);
    },
    onError: (error: Error) => {
      setMessage(`Error: ${error.message}`);
      setTimeout(() => setMessage(""), 3000);
    },
  });

  useEffect(() => {
    if (isSessionLoading) return;

    if (!session || session.user.role !== "admin") {
      router.push("/login");
      return;
    }
  }, [session, isSessionLoading, router]);

  const handleDeleteOrder = () => {
    if (!order) return;

    if (
      !confirm(
        "Are you sure you want to delete this order? This action cannot be undone."
      )
    ) {
      return;
    }

    deleteOrderMutation.mutate(order.id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (isSessionLoading || isOrderLoading) {
    return <LoadingUi />;
  }

  if (orderError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Error Loading Order
          </h2>
          <p className="text-gray-600 mb-4">{orderError.message}</p>
          <button
            onClick={() => refetchOrder()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
          <button
            onClick={() => router.push("/admin/orders")}
            className="ml-2 text-blue-600 hover:text-blue-800"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Order Not Found
          </h2>
          <button
            onClick={() => router.push("/admin/orders")}
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/admin/orders")}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
          >
            ← Back to Orders
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Order #{order.id.slice(-8).toUpperCase()}
              </h1>
              <p className="text-gray-600 mt-1">
                Placed on {new Date(order.createdAt).toLocaleDateString()} at{" "}
                {new Date(order.createdAt).toLocaleTimeString()}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span
                className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(
                  order.status
                )}`}
              >
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
              <button
                onClick={handleDeleteOrder}
                disabled={deleteOrderMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
              >
                {deleteOrderMutation.isPending ? "Deleting..." : "Delete Order"}
              </button>
            </div>
          </div>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`mb-6 p-4 border rounded-md ${
              message.includes("Error")
                ? "bg-red-100 border-red-400 text-red-700"
                : "bg-green-100 border-green-400 text-green-700"
            }`}
          >
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Order Items
                </h2>
                <span className="text-sm text-gray-500">
                  {order.items.length} item(s)
                </span>
              </div>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center space-x-4 border-b pb-4"
                  >
                    {item.book.image && (
                      <img
                        src={item.book.image}
                        alt={item.book.title}
                        className="w-16 h-20 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {item.book.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        by {item.book.author}
                      </p>
                      <p className="text-gray-600 text-sm">
                        Stock: {item.book.stock}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        ৳{item.price} × {item.quantity}
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        ৳{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total Amount:</span>
                  <span>৳{order.totalAmount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Details Sidebar */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Customer Information
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{order.customerEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{order.customerPhone}</p>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Shipping Information
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap">
                {order.shippingAddress}
              </p>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Payment Information
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Method</p>
                  <p className="font-medium">{order.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Transaction ID</p>
                  <p className="font-medium">{order.paymentTransactionId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Mobile</p>
                  <p className="font-medium">{order.paymentMobile}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
