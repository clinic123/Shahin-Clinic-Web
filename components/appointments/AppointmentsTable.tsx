"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getStatusVariant,
  useAcceptAppointment,
  useCompleteAppointment,
  useRejectAppointment,
} from "@/hooks/useAppointments";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import type { Appointment } from "@/prisma/generated/prisma";
import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  Eye,
  Mail,
  MoreHorizontal,
  Phone,
  RefreshCw,
  Stethoscope,
  User,
  XCircle,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

interface AppointmentsTableProps {
  appointments: Appointment[];
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

export default function AppointmentsTable({
  appointments,
  currentPage = 1,
}: AppointmentsTableProps) {
  const { data: session } = useSession();
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [appointmentToReject, setAppointmentToReject] = useState<string | null>(
    null
  );
  const [rejectError, setRejectError] = useState("");

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const acceptMutation = useAcceptAppointment();
  const rejectMutation = useRejectAppointment();
  const completeMutation = useCompleteAppointment();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleAcceptAppointment = async (appointmentId: string) => {
    setActionLoading(appointmentId);
    try {
      await acceptMutation.mutateAsync(appointmentId);
      // Success handled in mutation
    } catch (error) {
      // Error handled in mutation
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteAppointment = async (appointmentId: string) => {
    setActionLoading(appointmentId);
    try {
      await completeMutation.mutateAsync(appointmentId);
      // Success handled in mutation
    } catch (error) {
      // Error handled in mutation
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectAppointment = async (
    appointmentId: string,
    reason: string
  ) => {
    if (!reason.trim()) {
      setRejectError("Rejection reason is required");
      return;
    }

    setActionLoading(appointmentId);
    try {
      await rejectMutation.mutateAsync({ appointmentId, reason });
      setShowRejectDialog(false);
      setRejectReason("");
      setAppointmentToReject(null);
      setRejectError("");
    } catch (error) {
      // Error handled in mutation
    } finally {
      setActionLoading(null);
    }
  };

  const openRejectDialog = (appointmentId: string) => {
    setAppointmentToReject(appointmentId);
    setShowRejectDialog(true);
    setRejectReason("");
    setRejectError("");
  };

  const handleRejectReasonChange = (value: string) => {
    setRejectReason(value);
    if (value.trim() && rejectError) {
      setRejectError("");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-3 w-3" />;
      case "CONFIRMED":
        return <CheckCircle className="h-3 w-3" />;
      case "CANCELLED":
        return <XCircle className="h-3 w-3" />;
      case "COMPLETED":
        return <CheckCircle className="h-3 w-3" />;
      default:
        return <MoreHorizontal className="h-3 w-3" />;
    }
  };

  const isActionLoading = (appointmentId: string) => {
    return actionLoading === appointmentId;
  };

  if (appointments.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
          <Calendar className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No appointments found</h3>
        <p className="text-muted-foreground mb-4 max-w-md mx-auto">
          {searchParams.toString()
            ? "No appointments match your current filters. Try adjusting your search criteria."
            : "There are no appointments scheduled at the moment. New appointments will appear here."}
        </p>
        {searchParams.toString() && (
          <Button variant="outline" onClick={() => router.push(pathname)}>
            Clear all filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[280px]">Patient Information</TableHead>
              <TableHead className="w-[180px]">Appointment Time</TableHead>
              <TableHead className="w-[200px]">Doctor</TableHead>
              <TableHead className="w-[120px]">Payment</TableHead>
              <TableHead className="w-[130px]">Status</TableHead>
              <TableHead className="w-[130px]">Appointment Place</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((appointment) => (
              <TableRow
                key={appointment.id}
                className="group hover:bg-muted/50 transition-colors"
              >
                <TableCell>
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm truncate">
                          {appointment.patientName}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {appointment.patientAge}y
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {appointment.patientGender}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>{appointment.mobile}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{appointment.email}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <Calendar className="h-3 w-3" />
                      {formatDate(appointment.appointmentDate.toString())}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Created: {formatDate(appointment.createdAt.toString())}
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="h-4 w-4 text-blue-600" />
                      <p className="font-medium text-sm">
                        Dr. {appointment.doctorName}
                      </p>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <CreditCard className="h-3 w-3" />
                      <span className="text-sm font-medium">
                        {appointment.amountPaid
                          ? `${appointment.amountPaid} BDT`
                          : "Not Paid"}
                      </span>
                    </div>
                    {appointment.paymentTransactionId && (
                      <div className="text-xs text-muted-foreground truncate">
                        ID: {appointment.paymentTransactionId}
                      </div>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <Badge
                    variant={getStatusVariant(appointment.status)}
                    className={cn(
                      "flex items-center gap-1 w-fit text-xs",
                      appointment.status === "PENDING" && "animate-pulse",
                      appointment.status === "COMPLETED" && "bg-green-600"
                    )}
                  >
                    {getStatusIcon(appointment.status)}
                    {appointment.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={getStatusVariant(appointment.status)}
                    className={cn(
                      "flex items-center gap-1 w-fit text-xs",
                      appointment.appointmentType === "IN_PERSON" &&
                        "animate-pulse",
                      appointment.appointmentType === "VIRTUAL" &&
                        "bg-green-600"
                    )}
                  >
                    {appointment.appointmentType === "VIRTUAL"
                      ? "Online"
                      : "Offline"}
                  </Badge>
                </TableCell>

                <TableCell>
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setDialogOpen(true);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {session?.user.role !== "user" &&
                      appointment.status === "CONFIRMED" && (
                        <Button
                          size="sm"
                          className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
                          onClick={() =>
                            handleCompleteAppointment(appointment.id)
                          }
                          disabled={isActionLoading(appointment.id)}
                        >
                          {isActionLoading(appointment.id) ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            <Check className="h-3 w-3" />
                          )}
                        </Button>
                      )}

                    {appointment.status === "PENDING" && (
                      <>
                        {session?.user.role !== "user" && (
                          <>
                            <Button
                              size="sm"
                              className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
                              onClick={() =>
                                handleAcceptAppointment(appointment.id)
                              }
                              disabled={isActionLoading(appointment.id)}
                            >
                              {isActionLoading(appointment.id) ? (
                                <RefreshCw className="h-3 w-3 animate-spin" />
                              ) : (
                                <CheckCircle className="h-3 w-3" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-8 w-8 p-0"
                              onClick={() => openRejectDialog(appointment.id)}
                              disabled={isActionLoading(appointment.id)}
                            >
                              {isActionLoading(appointment.id) ? (
                                <RefreshCw className="h-3 w-3 animate-spin" />
                              ) : (
                                <XCircle className="h-3 w-3" />
                              )}
                            </Button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Simple Pagination */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-muted-foreground">
          Showing {appointments.length} appointments
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground px-3">
            Page {currentPage}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Appointment Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedAppointment && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Appointment Details
                </DialogTitle>
                <DialogDescription>
                  Complete information for appointment #
                  {selectedAppointment.id.slice(-8)}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6">
                {/* Patient Information */}
                <div className="grid gap-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Patient Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input value={selectedAppointment.patientName} readOnly />
                    </div>
                    <div className="space-y-2">
                      <Label>Age & Gender</Label>
                      <Input
                        value={`${selectedAppointment.patientAge} years, ${selectedAppointment.patientGender}`}
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Mobile Number</Label>
                      <Input value={selectedAppointment.mobile} readOnly />
                    </div>
                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <Input value={selectedAppointment.email} readOnly />
                    </div>
                  </div>
                </div>

                {/* Appointment Details */}
                <div className="grid gap-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Appointment Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Scheduled Date & Time</Label>
                      <Input
                        value={formatDate(
                          selectedAppointment.appointmentDate.toString()
                        )}
                        readOnly
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Created On</Label>
                      <Input
                        value={formatDate(
                          selectedAppointment.createdAt.toString()
                        )}
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Symptoms & Notes</Label>
                    <div className="p-3 border rounded-md bg-muted/50 min-h-[80px]">
                      {selectedAppointment.symptoms || "No symptoms provided"}
                    </div>
                  </div>
                </div>

                {/* Medical Professional */}
                <div className="grid gap-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Stethoscope className="h-4 w-4" />
                    Medical Professional
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Doctor</Label>
                      <Input
                        value={`Dr. ${selectedAppointment.doctorName}`}
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="grid gap-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Payment Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Amount Paid</Label>
                      <Input
                        value={
                          selectedAppointment.amountPaid != null
                            ? `${selectedAppointment.amountPaid} BDT`
                            : "Not Paid"
                        }
                        readOnly
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Payment Method</Label>
                      <Input
                        value={selectedAppointment.paymentMethod || "N/A"}
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Payment Mobile</Label>
                      <Input
                        value={selectedAppointment.paymentMobile || "N/A"}
                        readOnly
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Transaction ID</Label>
                      <Input
                        value={
                          selectedAppointment.paymentTransactionId || "N/A"
                        }
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="text-sm font-medium">
                      Current Status
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Last updated:{" "}
                      {formatDate(selectedAppointment.updatedAt.toString())}
                    </p>
                  </div>
                  <Badge
                    variant={getStatusVariant(selectedAppointment.status)}
                    className="text-sm"
                  >
                    {getStatusIcon(selectedAppointment.status)}
                    {selectedAppointment.status}
                  </Badge>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Appointment Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Reject Appointment
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this appointment. This will
              be sent to the patient and is required to proceed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejectReason" className="required">
                Reason for rejection *
              </Label>
              <Input
                id="rejectReason"
                placeholder="Enter reason for rejection (required)..."
                value={rejectReason}
                onChange={(e) => handleRejectReasonChange(e.target.value)}
                className={rejectError ? "border-destructive" : ""}
              />
              {rejectError && (
                <p className="text-sm text-destructive">{rejectError}</p>
              )}
              <p className="text-xs text-muted-foreground">
                This reason will be included in the cancellation email sent to
                the patient.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectReason("");
                  setRejectError("");
                }}
                disabled={isActionLoading(appointmentToReject!)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() =>
                  appointmentToReject &&
                  handleRejectAppointment(appointmentToReject, rejectReason)
                }
                disabled={
                  isActionLoading(appointmentToReject!) || !rejectReason.trim()
                }
              >
                {isActionLoading(appointmentToReject!) ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Appointment
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
