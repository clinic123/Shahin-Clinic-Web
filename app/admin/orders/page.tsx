"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSession } from "@/lib/auth-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import LoadingUi from "@/components/loading";
import { Spinner } from "@/components/ui/spinner";

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
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    book: {
      id: string;
      title: string;
      author: string;
      image: string | null;
    };
  }>;
}

interface OrdersResponse {
  success: boolean;
  data: Order[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// API functions
const fetchOrders = async (
  params: URLSearchParams
): Promise<OrdersResponse> => {
  const response = await fetch(`/api/admin/orders?${params}`);
  if (!response.ok) {
    throw new Error("Failed to fetch orders");
  }
  return response.json();
};

const updateOrderStatus = async ({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}): Promise<{ success: boolean; data: Order }> => {
  const response = await fetch(`/api/admin/orders/${orderId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error("Failed to update order status");
  }

  return response.json();
};

const deleteOrder = async (orderId: string): Promise<{ success: boolean }> => {
  const response = await fetch(`/api/admin/orders/${orderId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete order");
  }

  return response.json();
};

export default function AdminOrdersPage() {
  const { data: session, isPending: isSessionLoading } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");

  // Query for fetching orders
  const {
    data: ordersData,
    isLoading: isOrdersLoading,
    error: ordersError,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ["orders", currentPage, statusFilter, search],
    queryFn: () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(search && { search }),
      });
      return fetchOrders(params);
    },
    enabled: !!session?.user?.role && session.user.role === "admin",
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Safe cache update helper
  const safeUpdateCache = (
    updater: (old: OrdersResponse) => OrdersResponse
  ) => {
    const currentData = queryClient.getQueryData<OrdersResponse>([
      "orders",
      currentPage,
      statusFilter,
      search,
    ]);
    if (currentData) {
      queryClient.setQueryData(
        ["orders", currentPage, statusFilter, search],
        updater(currentData)
      );
    }
  };

  // Mutation for updating order status
  const updateStatusMutation = useMutation({
    mutationFn: updateOrderStatus,
    onMutate: async ({ orderId, status }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["orders"] });

      // Snapshot the previous value
      const previousOrders = queryClient.getQueryData([
        "orders",
        currentPage,
        statusFilter,
        search,
      ]);

      // Optimistically update the order status safely
      safeUpdateCache((old) => ({
        ...old,
        data: old.data.map((order) =>
          order.id === orderId ? { ...order, status } : order
        ),
      }));

      return { previousOrders };
    },
    onError: (err, variables, context) => {
      console.error("Error updating order status:", err);

      // Rollback to the previous value if it exists
      if (context?.previousOrders) {
        queryClient.setQueryData(
          ["orders", currentPage, statusFilter, search],
          context.previousOrders
        );
      }

      // Show error message to user
      alert(`Failed to update order status: ${err.message}`);
    },
    onSuccess: (data, variables) => {
      console.log("Order status updated successfully:", data);

      // Update with the actual data from server to ensure consistency
      safeUpdateCache((old) => ({
        ...old,
        data: old.data.map((order) =>
          order.id === variables.orderId ? data.data : order
        ),
      }));
    },
  });

  // Mutation for deleting order
  const deleteOrderMutation = useMutation({
    mutationFn: deleteOrder,
    onMutate: async (orderId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["orders"] });

      // Snapshot the previous value
      const previousOrders = queryClient.getQueryData([
        "orders",
        currentPage,
        statusFilter,
        search,
      ]);

      // Optimistically remove the order safely
      safeUpdateCache((old) => ({
        ...old,
        data: old.data.filter((order) => order.id !== orderId),
        pagination: {
          ...old.pagination,
          totalCount: old.pagination.totalCount - 1,
        },
      }));

      return { previousOrders };
    },
    onError: (err, variables, context) => {
      console.error("Error deleting order:", err);

      // Rollback to the previous value if it exists
      if (context?.previousOrders) {
        queryClient.setQueryData(
          ["orders", currentPage, statusFilter, search],
          context.previousOrders
        );
      }

      alert(`Failed to delete order: ${err.message}`);
    },
    onSuccess: () => {
      console.log("Order deleted successfully");

      // If we're on a page that might now be empty, go back a page
      safeUpdateCache((old) => {
        if (old.data.length === 0 && old.pagination.page > 1) {
          setCurrentPage(old.pagination.page - 1);
        }
        return old;
      });
    },
  });

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  const handleDeleteOrder = (orderId: string) => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    deleteOrderMutation.mutate(orderId);
  };

  const handleSearch = () => {
    setSearch(searchInput);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setSearchInput("");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "PENDING":
        return "secondary";
      case "CONFIRMED":
        return "default";
      case "SHIPPED":
        return "outline";
      case "DELIVERED":
        return "default";
      case "CANCELLED":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "SHIPPED":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "DELIVERED":
        return "bg-green-100 text-green-800 border-green-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Redirect if not admin
  if (isSessionLoading) {
    return <LoadingUi />;
  }

  if (!session || session.user.role !== "admin") {
    router.push("/auth/signin");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Order Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage and track customer orders
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Orders
                </label>
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    placeholder="Search by name, email, phone, or order ID..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <Button onClick={handleSearch}>Search</Button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status Filter
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="PENDING">PENDING</SelectItem>
                    <SelectItem value="CONFIRMED">CONFIRMED</SelectItem>
                    <SelectItem value="SHIPPED">SHIPPED</SelectItem>
                    <SelectItem value="DELIVERED">DELIVERED</SelectItem>
                    <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 items-center ">
                <Button
                  onClick={() => {
                    setCurrentPage(1);
                    refetchOrders();
                  }}
                  className="flex-1 "
                >
                  Apply Filters
                </Button>
                <Button variant="outline" onClick={handleClearFilters}>
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {isOrdersLoading ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : ordersError ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">Error loading orders</p>
                <Button onClick={() => refetchOrders()}>Retry</Button>
              </div>
            ) : !ordersData?.data || ordersData.data.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No orders found</p>
                {(search || statusFilter !== "all") && (
                  <Button
                    variant="outline"
                    onClick={handleClearFilters}
                    className="mt-4"
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ordersData.data.map((order) => (
                      <TableRow key={order.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              #{order.id.slice(-8).toUpperCase()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {order.customerName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.customerEmail}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.customerPhone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-900">
                          ৳{order.totalAmount}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getStatusVariant(order.status)}
                            className={getStatusColor(order.status)}
                          >
                            {order.status.charAt(0).toUpperCase() +
                              order.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {order.paymentMethod}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Select
                              value={order.status}
                              onValueChange={(value) =>
                                handleStatusUpdate(order.id, value)
                              }
                              disabled={updateStatusMutation.isPending}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PENDING">PENDING</SelectItem>
                                <SelectItem value="CONFIRMED">
                                  CONFIRMED
                                </SelectItem>
                                <SelectItem value="SHIPPED">SHIPPED</SelectItem>
                                <SelectItem value="DELIVERED">
                                  DELIVERED
                                </SelectItem>
                                <SelectItem value="CANCELLED">
                                  CANCELLED
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                router.push(`/admin/orders/${order.id}`)
                              }
                            >
                              View
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteOrder(order.id)}
                              disabled={deleteOrderMutation.isPending}
                            >
                              {deleteOrderMutation.isPending
                                ? "Deleting..."
                                : "Delete"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {ordersData?.pagination && ordersData.pagination.totalPages > 1 && (
          <Card>
            <CardContent className="pt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(Math.max(1, currentPage - 1));
                      }}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>

                  {Array.from(
                    { length: Math.min(5, ordersData.pagination.totalPages) },
                    (_, i) => {
                      let pageNum;
                      if (ordersData.pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (
                        currentPage >=
                        ordersData.pagination.totalPages - 2
                      ) {
                        pageNum = ordersData.pagination.totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(pageNum);
                            }}
                            isActive={currentPage === pageNum}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                  )}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(
                          Math.min(
                            ordersData.pagination.totalPages,
                            currentPage + 1
                          )
                        );
                      }}
                      className={
                        currentPage === ordersData.pagination.totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>

              <div className="text-center mt-2 text-sm text-gray-600">
                Page {currentPage} of {ordersData.pagination.totalPages} •{" "}
                {ordersData.pagination.totalCount} total orders
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
