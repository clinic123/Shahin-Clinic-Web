"use client";

import { useState, useTransition } from "react";

import { CourseOrdersFilters } from "@/components/admin/course-orders-filters";
import { CourseOrdersTable } from "@/components/admin/course-orders-table";
import { useCourseOrders } from "@/hooks/useCourseOrders";
import { bulkUpdateCourseOrders } from "@/lib/actions/course-orders";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";

export default function CourseOrdersAdminPage() {
  const { data: session, isPending } = useSession();
  const [filters, setFilters] = useState({
    status: "",
    search: "",
    paymentMethod: "",
    page: 1,
    limit: 10,
  });

  const { data, isLoading, error } = useCourseOrders(filters);
  const [isBulkUpdating, startBulkTransition] = useTransition();

  if (isPending) return <div>Loading...</div>;
  if (!session || session?.user?.role !== "admin") {
    return <div>Unauthorized</div>;
  }

  const handleBulkAction = (action: string, orderIds: string[]) => {
    if (orderIds.length === 0) {
      toast.error("Please select at least one order");
      return;
    }

    startBulkTransition(async () => {
      try {
        const result = await bulkUpdateCourseOrders(orderIds, action, true);

        if (result.success) {
          toast.success(result.message || "Orders updated successfully");
        } else {
          toast.error(result.error || "Failed to update orders");
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update orders"
        );
      }
    });
  };

  return (
    <div className="mx-auto px-4 w-full py-6">
      <div className="w-full">
        <div>
          <h3>Course Orders Management</h3>
        </div>
        <div className="w-full">
          <CourseOrdersFilters filters={filters} setFilters={setFilters} />
          <CourseOrdersTable
            orders={data?.data || []}
            loading={isLoading}
            onBulkAction={handleBulkAction}
            pagination={data?.pagination}
            onPageChange={(page) => setFilters({ ...filters, page })}
          />
        </div>
      </div>
    </div>
  );
}
