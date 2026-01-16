import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CourseOrder } from "@/types";
import { useState } from "react";
import { CourseOrderActions } from "./course-order-actions";

interface CourseOrdersTableProps {
  orders: CourseOrder[];
  loading: boolean;
  onBulkAction: (action: string, orderIds: string[]) => void;
  pagination?: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  onPageChange: (page: number) => void;
}

export function CourseOrdersTable({
  orders,
  loading,
  onBulkAction,
  pagination,
  onPageChange,
}: CourseOrdersTableProps) {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const toggleAllOrders = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map((order) => order.id));
    }
  };

  const handleBulkAction = (action: string) => {
    onBulkAction(action, selectedOrders);
    setSelectedOrders([]);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="w-full">
      {/* Bulk Actions */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={
              selectedOrders.length === orders.length && orders.length > 0
            }
            onCheckedChange={toggleAllOrders}
          />
          <span>Select All</span>
        </div>
        {selectedOrders.length > 0 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction("CONFIRMED")}
            >
              Confirm Selected
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction("ACCESS_GRANTED")}
            >
              Grant Access
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction("CANCELLED")}
            >
              Cancel Selected
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Select</TableHead>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Course</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment Method</TableHead>
            <TableHead>Transaction ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>
                <Checkbox
                  checked={selectedOrders.includes(order.id)}
                  onCheckedChange={() => toggleOrderSelection(order.id)}
                />
              </TableCell>
              <TableCell className="font-medium">
                {order.id.slice(-8)}
              </TableCell>
              <TableCell>
                <div>
                  <div>{order.user.name}</div>
                  <div className="text-sm text-gray-500">
                    {order.user.email}
                  </div>
                </div>
              </TableCell>
              <TableCell>{order.course.title}</TableCell>
              <TableCell>৳{order.totalAmount}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    order.status === "CONFIRMED"
                      ? "default"
                      : order.status === "ACCESS_GRANTED"
                      ? "secondary"
                      : order.status === "CANCELLED"
                      ? "destructive"
                      : "outline"
                  }
                >
                  {order.status}
                </Badge>
              </TableCell>
              <TableCell>{order.paymentMethod}</TableCell>
              <TableCell>{order.paymentTransactionId}</TableCell>
              <TableCell>
                {new Date(order.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <CourseOrderActions order={order} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between mt-4">
          <div>
            Page {pagination.page} of {pagination.totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={!pagination.hasPrevPage}
              onClick={() => onPageChange(pagination.page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={!pagination.hasNextPage}
              onClick={() => onPageChange(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
