import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateCourseOrder } from "@/lib/actions/course-orders";
import { CourseOrder } from "@/types";
import { MoreHorizontal } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CourseOrderGrantAccessDialog } from "./course-access-granted-dialog";
import { CourseOrderEditDialog } from "./course-order-edit-dialog";

interface CourseOrderActionsProps {
  order: CourseOrder;
}

export function CourseOrderActions({ order }: CourseOrderActionsProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [accessGlandDialogOpen, setAccessGlandDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (newStatus: string) => {
    startTransition(async () => {
      try {
        const result = await updateCourseOrder(order.id, {
          status: newStatus,
          sendEmail: true,
        });

        if (result.success) {
          toast.success(result.message || "Status updated successfully");
        } else {
          toast.error(result.error || "Failed to update status");
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to update status");
      }
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatusChange("CONFIRMED")}>
            Mark as Confirmed
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setAccessGlandDialogOpen(true);
            }}
          >
            Grant Access
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatusChange("CANCELLED")}>
            Cancel
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CourseOrderEditDialog
        order={order}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      <CourseOrderGrantAccessDialog
        order={order}
        open={accessGlandDialogOpen}
        onOpenChange={setAccessGlandDialogOpen}
      />
    </>
  );
}
