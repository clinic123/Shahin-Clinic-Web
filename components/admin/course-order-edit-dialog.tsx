import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateCourseOrder } from "@/lib/actions/course-orders";
import { CourseOrder } from "@/types";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface CourseOrderEditDialogProps {
  order: CourseOrder;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CourseOrderEditDialog({
  order,
  open,
  onOpenChange,
}: CourseOrderEditDialogProps) {
  const [formData, setFormData] = useState({
    status: order.status,
    paymentTransactionId: order.paymentTransactionId || "",
    paymentMobile: order.paymentMobile || "",
    customerEmail: order.user.email,
    customerPhone: order.customerPhone || order.paymentMobile || "",
  });

  const [isPending, startTransition] = useTransition();

  const handleSave = async () => {
    startTransition(async () => {
      try {
        const result = await updateCourseOrder(order.id, {
          status: formData.status,
          paymentTransactionId: formData.paymentTransactionId || undefined,
          paymentMobile: formData.paymentMobile || undefined,
          customerEmail: formData.customerEmail || undefined,
          customerPhone: formData.customerPhone || undefined,
          sendEmail: false,
        });

        if (result.success) {
          onOpenChange(false);
          toast.success(result.message || "Course order updated successfully");
        } else {
          toast.error(result.error || "Failed to update course order");
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to update course order");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Course Order</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="ACCESS_GRANTED">Access Granted</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="paymentTransactionId">Transaction ID</Label>
            <Input
              id="paymentTransactionId"
              value={formData.paymentTransactionId}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  paymentTransactionId: e.target.value,
                })
              }
            />
          </div>
          <div>
            <Label htmlFor="paymentMobile">Payment Mobile</Label>
            <Input
              id="paymentMobile"
              value={formData.paymentMobile}
              onChange={(e) =>
                setFormData({ ...formData, paymentMobile: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="customerEmail">Customer Email</Label>
            <Input
              id="customerEmail"
              type="email"
              value={formData.customerEmail}
              onChange={(e) =>
                setFormData({ ...formData, customerEmail: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="customerPhone">Customer Phone</Label>
            <Input
              id="customerPhone"
              value={formData.customerPhone}
              onChange={(e) =>
                setFormData({ ...formData, customerPhone: e.target.value })
              }
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
