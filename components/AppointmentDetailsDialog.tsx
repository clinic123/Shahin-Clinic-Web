import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getStatusVariant } from "@/hooks/useAppointments";
import type { Appointment } from "@/prisma/generated/prisma";

interface AppointmentDetailsDialogProps {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AppointmentDetailsDialog({
  appointment,
  open,
  onOpenChange,
}: AppointmentDetailsDialogProps) {
  if (!appointment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Appointment Details</DialogTitle>
          <DialogDescription>
            Complete information for appointment #{appointment.id.slice(-8)}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Patient Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Patient Name</Label>
              <Input value={appointment.patientName} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Age & Gender</Label>
              <Input
                value={`${appointment.patientAge}y, ${appointment.patientGender}`}
                readOnly
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Mobile</Label>
              <Input value={appointment.mobile} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={appointment.email} readOnly />
            </div>
          </div>

          {/* Symptoms */}
          <div>
            <Label>Symptoms</Label>
            <div className="p-3 border rounded-md bg-muted/50">
              {appointment.symptoms || "N/A"}
            </div>
          </div>

          {/* Payment Details */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="space-y-2">
              <Label>Payment Amount</Label>
              <Input
                value={
                  appointment.amountPaid != null
                    ? `${appointment.amountPaid} BDT`
                    : "Not Paid"
                }
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Input value={appointment.paymentMethod || "N/A"} readOnly />
            </div>
          </div>

          {/* Payment Transaction ID */}
          <div className="space-y-2 pt-2">
            <Label>Transaction ID</Label>
            <Input value={appointment.paymentTransactionId || "N/A"} readOnly />
          </div>
          <Badge variant={getStatusVariant(appointment.status)}>
            {appointment.status}
          </Badge>
        </div>
      </DialogContent>
    </Dialog>
  );
}
