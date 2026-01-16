"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
} from "@/components/ui/dialog";
import { ImageUpload } from "@/components/ui/image-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
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
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateDoctor,
  useDeleteDoctor,
  useDoctorSearch,
  useUpdateDoctor,
  useUpdateDoctorStatus,
  type Doctor,
  type DoctorFormData,
} from "@/hooks/useDoctors";
import { Edit, Eye, RefreshCw, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function DoctorsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;
  const { doctors, allDoctors, isLoading, error, refetch } =
    useDoctorSearch(searchTerm);
  const deleteMutation = useDeleteDoctor();
  const statusMutation = useUpdateDoctorStatus();
  const createMutation = useCreateDoctor();
  const updateMutation = useUpdateDoctor();

  // Calculate pagination
  const totalCount = doctors.length;
  const totalPages = Math.ceil(totalCount / limit);
  const startIndex = (currentPage - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedDoctors = doctors.slice(startIndex, endIndex);

  // Reset to page 1 when search term changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Adjust page if current page is empty after deletion
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const [newDoctorData, setNewDoctorData] = useState<DoctorFormData>({
    name: "",
    specialization: "",
    department: "",
    email: "",
    phone: "",
    bio: "",
    experience: 0,
    education: "",
    consultationFee: 0,
    availableDays: [],
    status: "ACTIVE",
    password: "",
  });

  const getStatusVariant = (status: string) => {
    return status === "ACTIVE" ? "default" : "secondary";
  };

  const handleStatusToggle = (doctor: Doctor) => {
    const newStatus = doctor.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    statusMutation.mutate({
      id: doctor.id,
      status: newStatus,
    });
  };

  const handleDeleteDoctor = (doctorId: string) => {
    deleteMutation.mutate(doctorId);
  };

  const handleCreateDoctor = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (
      !newDoctorData.name ||
      !newDoctorData.email ||
      !newDoctorData.password
    ) {
      toast.error("Name, email, and password are required");
      return;
    }

    createMutation.mutate(newDoctorData, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
        setNewDoctorData({
          name: "",
          specialization: "",
          department: "",
          email: "",
          phone: "",
          bio: "",
          experience: 0,
          education: "",
          consultationFee: 0,
          availableDays: [],
          status: "ACTIVE",
          password: "",
        });
      },
    });
  };

  const handleInputChange = useCallback(
    (field: keyof DoctorFormData, value: any) => {
      setNewDoctorData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleImageChange = useCallback(
    async (url: string) => {
      handleInputChange("profileImage", url);
    },
    [handleInputChange]
  );

  const handleImageRemove = useCallback(async () => {
    handleInputChange("profileImage", "");
  }, [handleInputChange]);

  const handleViewDoctor = (doctor: Doctor) => {
    toast.info(`Viewing details for Dr. ${doctor.name}`, {
      description: "Doctor details view coming soon...",
    });
  };

  const handleEditDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setNewDoctorData({
      name: doctor.name,
      specialization: doctor.specialization,
      department: doctor.department,
      email: doctor.email,
      phone: doctor.phone,
      bio: doctor.bio || "",
      experience: doctor.experience,
      education: doctor.education,
      consultationFee: doctor.consultationFee,
      availableDays: doctor.availableDays,
      status: doctor.status,
      profileImage: doctor.profileImage || "",
      facebookUrl: doctor.facebookUrl || "",
      twitterUrl: doctor.twitterUrl || "",
      youtubeUrl: doctor.youtubeUrl || "",
      linkedinUrl: doctor.linkedinUrl || "",
      instagramUrl: doctor.instagramUrl || "",
      password: "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateDoctor = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDoctor) return;

    // Basic validation
    if (
      !newDoctorData.name ||
      !newDoctorData.specialization ||
      !newDoctorData.department
    ) {
      toast.error("Name, specialization, and department are required");
      return;
    }

    // Remove password from update if it's empty
    const updateData = { ...newDoctorData };
    if (!updateData.password) {
      delete updateData.password;
    }

    updateMutation.mutate(
      {
        id: selectedDoctor.id,
        data: updateData,
      },
      {
        onSuccess: () => {
          // Refetch to get the latest data from server
          refetch();
          setIsEditDialogOpen(false);
          setSelectedDoctor(null);
          setNewDoctorData({
            name: "",
            specialization: "",
            department: "",
            email: "",
            phone: "",
            bio: "",
            experience: 0,
            education: "",
            consultationFee: 0,
            availableDays: [],
            status: "ACTIVE",
            password: "",
          });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading doctors...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <span className="text-red-600 text-lg">!</span>
              </div>
              <h3 className="text-lg font-semibold">Error Loading Doctors</h3>
              <p className="text-muted-foreground mt-2 mb-4">
                {(error as Error).message}
              </p>
              <Button onClick={() => refetch()} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Doctors Management</CardTitle>
              <CardDescription>
                Manage doctors, their profiles, and availability
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-sm">
                {allDoctors.length}{" "}
                {allDoctors.length === 1 ? "Doctor" : "Doctors"}
              </Badge>
              {/* <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Doctor
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Doctor</DialogTitle>
                    <DialogDescription>
                      Create a new doctor profile in the system.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateDoctor} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={newDoctorData.name}
                          onChange={(e) =>
                            handleInputChange("name", e.target.value)
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newDoctorData.email}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="specialization">Specialization *</Label>
                        <Input
                          id="specialization"
                          value={newDoctorData.specialization}
                          onChange={(e) =>
                            handleInputChange("specialization", e.target.value)
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="department">Department *</Label>
                        <Input
                          id="department"
                          value={newDoctorData.department}
                          onChange={(e) =>
                            handleInputChange("department", e.target.value)
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={newDoctorData.phone}
                          onChange={(e) =>
                            handleInputChange("phone", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password *</Label>
                        <Input
                          id="password"
                          type="password"
                          value={newDoctorData.password}
                          onChange={(e) =>
                            handleInputChange("password", e.target.value)
                          }
                          required
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createMutation.isPending}
                        className="min-w-24"
                      >
                        {createMutation.isPending ? (
                          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Create Doctor
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog> */}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search doctors by name, specialization, department, or email..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedDoctors.map((doctor) => (
                  <TableRow key={doctor.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{doctor.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {doctor.education}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{doctor.specialization}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{doctor.department}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{doctor.email}</span>
                        <span className="text-sm text-muted-foreground">
                          {doctor.phone}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{doctor.experience} years</TableCell>
                    <TableCell>৳{doctor.consultationFee}</TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-2">
                        <Badge variant={getStatusVariant(doctor.status)}>
                          {doctor.status}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusToggle(doctor as any)}
                          disabled={statusMutation.isPending}
                          className="h-6 text-xs"
                        >
                          {statusMutation.isPending ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            `Mark as ${
                              doctor.status === "ACTIVE" ? "Inactive" : "Active"
                            }`
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="sr-only"
                          onClick={() => handleViewDoctor(doctor as any)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditDoctor(doctor as any)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={deleteMutation.isPending}
                            >
                              {deleteMutation.isPending ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action will deactivate Dr. {doctor.name}{" "}
                                and change their status to INACTIVE. They will
                                no longer be available for new appointments, but
                                existing data will be preserved.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteDoctor(doctor.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                disabled={deleteMutation.isPending}
                              >
                                {deleteMutation.isPending ? (
                                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                                ) : null}
                                Deactivate Doctor
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {doctors.length === 0 && (
            <div className="text-center py-8 border rounded-md">
              <div className="flex flex-col items-center">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchTerm ? "No doctors found" : "No doctors available"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm
                    ? "No doctors match your search criteria. Try adjusting your search terms."
                    : "There are no doctors in the system yet."}
                </p>
                {searchTerm && (
                  <Button variant="outline" onClick={() => handleSearchChange("")}>
                    Clear Search
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between px-2">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, totalCount)} of{" "}
                {totalCount} {totalCount === 1 ? "doctor" : "doctors"}
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) {
                          setCurrentPage(currentPage - 1);
                        }
                      }}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
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
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) {
                          setCurrentPage(currentPage + 1);
                        }
                      }}
                      className={
                        currentPage >= totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          {/* Loading state for mutations */}
          {(deleteMutation.isPending ||
            statusMutation.isPending ||
            createMutation.isPending ||
            updateMutation.isPending) && (
            <div className="fixed bottom-4 right-4 bg-background border rounded-lg p-4 shadow-lg">
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span className="text-sm">
                  {deleteMutation.isPending
                    ? "Deleting doctor..."
                    : statusMutation.isPending
                    ? "Updating status..."
                    : createMutation.isPending
                    ? "Creating doctor..."
                    : "Updating doctor..."}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Doctor</DialogTitle>
            <DialogDescription>
              Update doctor profile information.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateDoctor} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name *</Label>
                <Input
                  id="edit-name"
                  value={newDoctorData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={newDoctorData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-specialization">Specialization *</Label>
                <Input
                  id="edit-specialization"
                  value={newDoctorData.specialization}
                  onChange={(e) =>
                    handleInputChange("specialization", e.target.value)
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-department">Department *</Label>
                <Input
                  id="edit-department"
                  value={newDoctorData.department}
                  onChange={(e) =>
                    handleInputChange("department", e.target.value)
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={newDoctorData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-experience">Experience (years)</Label>
                <Input
                  id="edit-experience"
                  type="number"
                  value={newDoctorData.experience}
                  onChange={(e) =>
                    handleInputChange(
                      "experience",
                      parseInt(e.target.value) || 0
                    )
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-education">Education</Label>
                <Input
                  id="edit-education"
                  value={newDoctorData.education}
                  onChange={(e) =>
                    handleInputChange("education", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-consultationFee">Consultation Fee</Label>
                <Input
                  id="edit-consultationFee"
                  type="number"
                  step="0.01"
                  value={newDoctorData.consultationFee}
                  onChange={(e) =>
                    handleInputChange(
                      "consultationFee",
                      parseFloat(e.target.value) || 0
                    )
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-bio">Bio</Label>
              <Textarea
                id="edit-bio"
                value={newDoctorData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-availableDays">
                Available Days (comma-separated)
              </Label>
              <Input
                id="edit-availableDays"
                value={newDoctorData.availableDays.join(", ")}
                onChange={(e) =>
                  handleInputChange(
                    "availableDays",
                    e.target.value.split(",").map((day) => day.trim())
                  )
                }
                placeholder="Monday, Tuesday, Wednesday"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-profileImage">Profile Image</Label>
              <ImageUpload
                currentImage={newDoctorData.profileImage || null}
                onImageChange={handleImageChange}
                onImageRemove={handleImageRemove}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-facebookUrl">Facebook URL</Label>
                <Input
                  id="edit-facebookUrl"
                  type="url"
                  value={newDoctorData.facebookUrl}
                  onChange={(e) =>
                    handleInputChange("facebookUrl", e.target.value)
                  }
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-twitterUrl">Twitter URL</Label>
                <Input
                  id="edit-twitterUrl"
                  type="url"
                  value={newDoctorData.twitterUrl}
                  onChange={(e) =>
                    handleInputChange("twitterUrl", e.target.value)
                  }
                  placeholder="https://twitter.com/..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-instagramUrl">Instagram URL</Label>
                <Input
                  id="edit-instagramUrl"
                  type="url"
                  value={newDoctorData.instagramUrl}
                  onChange={(e) =>
                    handleInputChange("instagramUrl", e.target.value)
                  }
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-youtubeUrl">YouTube URL</Label>
                <Input
                  id="edit-youtubeUrl"
                  type="url"
                  value={newDoctorData.youtubeUrl}
                  onChange={(e) =>
                    handleInputChange("youtubeUrl", e.target.value)
                  }
                  placeholder="https://youtube.com/..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-linkedinUrl">LinkedIn URL</Label>
              <Input
                id="edit-linkedinUrl"
                type="url"
                value={newDoctorData.linkedinUrl}
                onChange={(e) =>
                  handleInputChange("linkedinUrl", e.target.value)
                }
                placeholder="https://linkedin.com/..."
              />
            </div>

            <div className="space-y-2 hidden">
              <Label htmlFor="edit-password">
                New Password (leave empty to keep current)
              </Label>
              <Input
                id="edit-password"
                type="password"
                value={newDoctorData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="Enter new password only if changing"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={newDoctorData.status}
                onValueChange={(value) =>
                  handleInputChange("status", value as "ACTIVE" | "INACTIVE")
                }
              >
                <SelectTrigger id="edit-status" className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setSelectedDoctor(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="min-w-24"
              >
                {updateMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Update Doctor
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
