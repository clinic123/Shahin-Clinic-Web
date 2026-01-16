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
  DialogTrigger,
} from "@/components/ui/dialog";
import { ImageUpload } from "@/components/ui/image-upload";
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
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateStudent,
  useDeleteStudent,
  useStudentSearch,
  useUpdateStudent,
  type StudentFormData,
} from "@/hooks/useStudents";
import type { StudentRecord } from "@/lib/actions/fetchStudentsData";
import { Edit, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export default function StudentsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(
    null
  );
  const { students, allStudents, isLoading, error, refetch } =
    useStudentSearch(searchTerm);
  const deleteMutation = useDeleteStudent();
  const createMutation = useCreateStudent();
  const updateMutation = useUpdateStudent();

  const [newStudentData, setNewStudentData] = useState<StudentFormData>({
    name: "",
    description: "",
    image: "",
    facebookUrl: "",
    twitterUrl: "",
    youtubeUrl: "",
    linkedinUrl: "",
    instagramUrl: "",
  });

  const handleDeleteStudent = (studentId: string) => {
    deleteMutation.mutate(studentId);
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!newStudentData.name) {
      toast.error("Name is required");
      return;
    }

    createMutation.mutate(newStudentData, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
        setNewStudentData({
          name: "",
          description: "",
          image: "",
          facebookUrl: "",
          twitterUrl: "",
          youtubeUrl: "",
          linkedinUrl: "",
          instagramUrl: "",
        });
      },
    });
  };

  const handleEditStudent = (student: StudentRecord) => {
    setSelectedStudent(student);
    setNewStudentData({
      name: student.name,
      description: student.description || "",
      image: student.image || "",
      facebookUrl: student.facebookUrl || "",
      twitterUrl: student.twitterUrl || "",
      youtubeUrl: student.youtubeUrl || "",
      linkedinUrl: student.linkedinUrl || "",
      instagramUrl: student.instagramUrl || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateStudent = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStudent) return;

    if (!newStudentData.name) {
      toast.error("Name is required");
      return;
    }

    updateMutation.mutate(
      {
        id: selectedStudent.id,
        data: newStudentData,
      },
      {
        onSuccess: () => {
          setIsEditDialogOpen(false);
          setSelectedStudent(null);
          setNewStudentData({
            name: "",
            description: "",
            image: "",
            facebookUrl: "",
            twitterUrl: "",
            youtubeUrl: "",
            linkedinUrl: "",
            instagramUrl: "",
          });
        },
      }
    );
  };

  const handleInputChange = useCallback(
    (field: keyof StudentFormData, value: any) => {
      setNewStudentData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleImageChange = useCallback(
    async (url: string) => {
      handleInputChange("image", url);
    },
    [handleInputChange]
  );

  const handleImageRemove = useCallback(async () => {
    handleInputChange("image", "");
  }, [handleInputChange]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading students...</span>
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
              <h3 className="text-lg font-semibold">Error Loading Students</h3>
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
              <CardTitle>Students Management</CardTitle>
              <CardDescription>
                Manage students and their profiles
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-sm">
                {allStudents.length}{" "}
                {allStudents.length === 1 ? "Student" : "Students"}
              </Badge>
              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Student
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Student</DialogTitle>
                    <DialogDescription>
                      Create a new student profile in the system.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateStudent} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={newStudentData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newStudentData.description}
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="image">Profile Image</Label>
                      <ImageUpload
                        currentImage={newStudentData.image || null}
                        onImageChange={handleImageChange}
                        onImageRemove={handleImageRemove}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="facebookUrl">Facebook URL</Label>
                        <Input
                          id="facebookUrl"
                          type="url"
                          value={newStudentData.facebookUrl}
                          onChange={(e) =>
                            handleInputChange("facebookUrl", e.target.value)
                          }
                          placeholder="https://facebook.com/..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="twitterUrl">Twitter URL</Label>
                        <Input
                          id="twitterUrl"
                          type="url"
                          value={newStudentData.twitterUrl}
                          onChange={(e) =>
                            handleInputChange("twitterUrl", e.target.value)
                          }
                          placeholder="https://twitter.com/..."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="instagramUrl">Instagram URL</Label>
                        <Input
                          id="instagramUrl"
                          type="url"
                          value={newStudentData.instagramUrl}
                          onChange={(e) =>
                            handleInputChange("instagramUrl", e.target.value)
                          }
                          placeholder="https://instagram.com/..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="youtubeUrl">YouTube URL</Label>
                        <Input
                          id="youtubeUrl"
                          type="url"
                          value={newStudentData.youtubeUrl}
                          onChange={(e) =>
                            handleInputChange("youtubeUrl", e.target.value)
                          }
                          placeholder="https://youtube.com/..."
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                      <Input
                        id="linkedinUrl"
                        type="url"
                        value={newStudentData.linkedinUrl}
                        onChange={(e) =>
                          handleInputChange("linkedinUrl", e.target.value)
                        }
                        placeholder="https://linkedin.com/..."
                      />
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
                        Create Student
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Social Links</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{student.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground line-clamp-2">
                        {student.description || "No description"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {student.image ? (
                        <img
                          src={student.image}
                          alt={student.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          No image
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {student.facebookUrl && (
                          <Badge variant="outline" className="text-xs">
                            FB
                          </Badge>
                        )}
                        {student.twitterUrl && (
                          <Badge variant="outline" className="text-xs">
                            TW
                          </Badge>
                        )}
                        {student.instagramUrl && (
                          <Badge variant="outline" className="text-xs">
                            IG
                          </Badge>
                        )}
                        {student.youtubeUrl && (
                          <Badge variant="outline" className="text-xs">
                            YT
                          </Badge>
                        )}
                        {student.linkedinUrl && (
                          <Badge variant="outline" className="text-xs">
                            LI
                          </Badge>
                        )}
                        {!student.facebookUrl &&
                          !student.twitterUrl &&
                          !student.instagramUrl &&
                          !student.youtubeUrl &&
                          !student.linkedinUrl && (
                            <span className="text-xs text-muted-foreground">
                              None
                            </span>
                          )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditStudent(student)}
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
                                This action will permanently delete{" "}
                                {student.name}. This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteStudent(student.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                disabled={deleteMutation.isPending}
                              >
                                {deleteMutation.isPending ? (
                                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                                ) : null}
                                Delete Student
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

          {students.length === 0 && (
            <div className="text-center py-8 border rounded-md">
              <div className="flex flex-col items-center">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchTerm ? "No students found" : "No students available"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm
                    ? "No students match your search criteria. Try adjusting your search terms."
                    : "There are no students in the system yet."}
                </p>
                {searchTerm && (
                  <Button variant="outline" onClick={() => setSearchTerm("")}>
                    Clear Search
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>
              Update student profile information.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateStudent} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name *</Label>
              <Input
                id="edit-name"
                value={newStudentData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={newStudentData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-image">Profile Image</Label>
              <ImageUpload
                currentImage={newStudentData.image || null}
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
                  value={newStudentData.facebookUrl}
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
                  value={newStudentData.twitterUrl}
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
                  value={newStudentData.instagramUrl}
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
                  value={newStudentData.youtubeUrl}
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
                value={newStudentData.linkedinUrl}
                onChange={(e) =>
                  handleInputChange("linkedinUrl", e.target.value)
                }
                placeholder="https://linkedin.com/..."
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setSelectedStudent(null);
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
                Update Student
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
