"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle, Plus, RefreshCw, XIcon } from "lucide-react";
import { useEffect, useState } from "react";

import AdminAppointmentsList from "@/components/appointments/AppointmentsList";
import RichTextEditor from "@/components/ui/rich-text-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Doctor } from "@/prisma/generated/prisma";
import { DoctorWithAppointmentRelationship } from "@/types";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Import the mutation hooks
import {
  useCreateDoctor,
  useUpdateDoctor,
  useUploadProfileImage,
} from "@/hooks/useDoctors";

// API functions with improved error handling
const fetchDoctorProfile = async (): Promise<{
  doctor: DoctorWithAppointmentRelationship;
}> => {
  const response = await fetch("/api/doctors/profile");

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `HTTP error! status: ${response.status}`;

    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }

    throw new Error(errorMessage);
  }

  try {
    return await response.json();
  } catch (error) {
    throw new Error("Invalid JSON response from server");
  }
};

export default function DoctorAppointmentsPageComponent({
  status = "all",
  sort = "newest",
  search = "",
  doctorName = "",
  department = "",
  dateFrom = "",
  dateTo = "",
  page = 1,
  limit = 10,
}: {
  status?: string;
  sort?: string;
  search?: string;
  doctorName?: string;
  department?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}) {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const router = useRouter();

  // Use mutation hooks
  const createDoctorMutation = useCreateDoctor();
  const updateDoctorMutation = useUpdateDoctor();
  const uploadProfileImageMutation = useUploadProfileImage();

  const {
    data: doctorData,
    isLoading: isDoctorLoading,
    error: doctorError,
  } = useQuery({
    queryKey: ["doctorProfile"],
    queryFn: fetchDoctorProfile,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const doctor = doctorData?.doctor || null;
  const appointments = doctorData?.doctor.appointments || [];
  const error = doctorError?.message;

  const [formData, setFormData] = useState({
    specialization: doctor?.specialization || "",
    department: doctor?.department || "",
    phone: doctor?.phone || "",
    bio: doctor?.bio || "",
    experience: doctor?.experience || 0,
    education: doctor?.education || "",
    consultationFee: doctor?.consultationFee || 0,
    availableDays: doctor?.availableDays || ([] as string[]),
    status: doctor?.status || ("ACTIVE" as "ACTIVE" | "INACTIVE"),
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Update form data when doctor data loads
  useEffect(() => {
    if (doctor) {
      setFormData({
        specialization: doctor.specialization || "",
        department: doctor.department || "",
        phone: doctor.phone || "",
        bio: doctor.bio || "",
        experience: doctor.experience || 0,
        education: doctor.education || "",
        consultationFee: doctor.consultationFee || 0,
        availableDays: doctor.availableDays || [],
        status: doctor.status || "ACTIVE",
      });
    }
  }, [doctor]);

  // Set editing doctor based on DoctorProfile prop
  useEffect(() => {
    if (doctor) {
      setEditingDoctor(doctor);
    }
  }, [doctor]);

  const validateForm = () => {
    if (!formData.specialization.trim()) {
      toast.error("Specialization is required");
      return false;
    }
    if (!formData.department.trim()) {
      toast.error("Department is required");
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error("Phone is required");
      return false;
    }
    if (formData.experience < 0) {
      toast.error("Experience cannot be negative");
      return false;
    }
    if (formData.consultationFee < 0) {
      toast.error("Consultation fee cannot be negative");
      return false;
    }
    if (!formData.education.trim()) {
      toast.error("Education is required");
      return false;
    }
    return true;
  };

  const resetForm = () => {
    if (editingDoctor) {
      // Reset to current doctor data
      setFormData({
        specialization: editingDoctor.specialization || "",
        department: editingDoctor.department || "",
        phone: editingDoctor.phone || "",
        bio: editingDoctor.bio || "",
        experience: editingDoctor.experience || 0,
        education: editingDoctor.education || "",
        consultationFee: editingDoctor.consultationFee || 0,
        availableDays: editingDoctor.availableDays || [],
        status: editingDoctor.status || "ACTIVE",
      });
    } else {
      // Reset to empty form for new profile
      setFormData({
        specialization: "",
        department: "",
        phone: "",
        bio: "",
        experience: 0,
        education: "",
        consultationFee: 0,
        availableDays: [],
        status: "ACTIVE",
      });
    }
  };

  const handleCompleteDoctorProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    createDoctorMutation.mutate(formData, {
      onSuccess: () => {
        setIsDialogOpen(false);
        resetForm();
        // Additional cache invalidation if needed
        queryClient.invalidateQueries({ queryKey: ["doctorProfile"] });
      },
      // Error handling is already done in the mutation hook
    });
  };

  const handleUpdateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoctor) return;
    if (!validateForm()) return;

    updateDoctorMutation.mutate(
      { id: editingDoctor.id, data: formData },
      {
        onSuccess: () => {
          setIsDialogOpen(false);
          resetForm();
          // Additional cache invalidation if needed
          queryClient.invalidateQueries({ queryKey: ["doctorProfile"] });
        },
        // Error handling is already done in the mutation hook
      }
    );
  };

  const handleDialogOpen = (open: boolean) => {
    setIsDialogOpen(open);
    if (open) {
      // Reset form to current data when dialog opens
      resetForm();
    }
  };

  const confirmedAppointments =
    doctor?.appointments?.filter((apt) => apt.status === "CONFIRMED") || [];
  const completedAppointments =
    doctor?.appointments?.filter((apt) => apt.status === "COMPLETED") || [];
  const pendingAppointments =
    doctor?.appointments?.filter((apt) => apt.status === "PENDING") || [];
  const canceledAppointments =
    doctor?.appointments?.filter((apt) => apt.status === "CANCELLED") || [];

  const isUpdatingProfile = !!doctor || !!editingDoctor;

  // Combine loading states from mutations
  const isActionLoading =
    createDoctorMutation.isPending ||
    updateDoctorMutation.isPending ||
    uploadProfileImageMutation.isPending;

  if (doctorError && doctorError.message?.includes("Access Denied")) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold">Access Denied</h3>
              <p className="text-muted-foreground mt-2">
                You don't have permission to access the doctor dashboard. Please
                contact administration if you believe this is an error.
              </p>
              <Button
                onClick={() => router.push("/")}
                className="mt-4"
                variant="outline"
              >
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-6">
      {/* Error Alert */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-800 text-sm">{error}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Clear errors by refetching
                  if (doctorError)
                    queryClient.invalidateQueries({
                      queryKey: ["doctorProfile"],
                    });
                }}
                className="ml-auto"
              >
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Doctor Profile Header */}
      {doctor && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Dr. {doctor.name}</CardTitle>
                <CardDescription>
                  {doctor.specialization} - {doctor.department}
                </CardDescription>
              </div>
              <Badge variant="default" className="text-sm">
                Doctor Dashboard
              </Badge>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Profile Completion/Update Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleDialogOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {isUpdatingProfile
              ? "Update Doctor Information"
              : "Complete Your Profile"}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isUpdatingProfile
                ? "Update Doctor Profile"
                : "Complete Your Profile"}
            </DialogTitle>
            <DialogDescription>
              {isUpdatingProfile
                ? "Update your doctor information and availability"
                : "Complete your doctor profile to start accepting appointments"}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={
              isUpdatingProfile
                ? handleUpdateDoctor
                : handleCompleteDoctorProfile
            }
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization *</Label>
                <Input
                  id="specialization"
                  value={formData.specialization}
                  onChange={(e) =>
                    handleInputChange("specialization", e.target.value)
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) =>
                    handleInputChange("department", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cardiology">Cardiology</SelectItem>
                    <SelectItem value="Neurology">Neurology</SelectItem>
                    <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                    <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                    <SelectItem value="Dermatology">Dermatology</SelectItem>
                    <SelectItem value="Psychiatry">Psychiatry</SelectItem>
                    <SelectItem value="Surgery">Surgery</SelectItem>
                    <SelectItem value="Radiology">Radiology</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="experience">Experience (Years) *</Label>
                <Input
                  id="experience"
                  type="number"
                  min="0"
                  value={formData.experience}
                  onChange={(e) =>
                    handleInputChange(
                      "experience",
                      parseInt(e.target.value) || 0
                    )
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="consultationFee">Consultation Fee (৳) *</Label>
                <Input
                  id="consultationFee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.consultationFee}
                  onChange={(e) =>
                    handleInputChange(
                      "consultationFee",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="education">Education *</Label>
              <Input
                id="education"
                value={formData.education}
                onChange={(e) => handleInputChange("education", e.target.value)}
                placeholder="e.g., MD, MBBS, PhD"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="availableDays">Available Days</Label>
              <Select
                value=""
                onValueChange={(value) => {
                  if (!formData.availableDays.includes(value)) {
                    handleInputChange("availableDays", [
                      ...formData.availableDays,
                      value,
                    ]);
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select available days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Monday">Monday</SelectItem>
                  <SelectItem value="Tuesday">Tuesday</SelectItem>
                  <SelectItem value="Wednesday">Wednesday</SelectItem>
                  <SelectItem value="Thursday">Thursday</SelectItem>
                  <SelectItem value="Friday">Friday</SelectItem>
                  <SelectItem value="Saturday">Saturday</SelectItem>
                  <SelectItem value="Sunday">Sunday</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.availableDays.map((day) => (
                  <Badge
                    key={day}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {day}
                    <button
                      type="button"
                      onClick={() =>
                        handleInputChange(
                          "availableDays",
                          formData.availableDays.filter((d) => d !== day)
                        )
                      }
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <RichTextEditor
                value={formData.bio || ""}
                onChange={(val: string) => handleInputChange("bio", val)}
                placeholder="Tell us about your medical background, specialties, and approach to patient care..."
              />
            </div>

            {isUpdatingProfile && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "ACTIVE" | "INACTIVE") =>
                    handleInputChange("status", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isActionLoading}
                className="min-w-24"
              >
                {isActionLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {isUpdatingProfile ? "Update Profile" : "Complete Profile"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Appointments
                </p>
                <p className="text-2xl font-bold">{appointments.length}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <RefreshCw className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pending
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {pendingAppointments?.length}
                </p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-full">
                <RefreshCw className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Confirmed
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {confirmedAppointments?.length}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Completed
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {completedAppointments?.length}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Canceled
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {canceledAppointments?.length}
                </p>
              </div>
              <div className="p-2 bg-red-100 rounded-full">
                <XIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appointments Table */}
      <AdminAppointmentsList
        status={status}
        sort={sort}
        search={search}
        doctorName={doctorName}
        department={department}
        dateFrom={dateFrom}
        dateTo={dateTo}
        page={page || 1}
        limit={limit || 10}
      />
    </div>
  );
}
