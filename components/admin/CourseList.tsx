// components/courses/CourseList.tsx
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCourses, useDeleteCourse } from "@/hooks/useCourses";
import { CourseType } from "@/types";
import { format } from "date-fns";
import { Edit, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CourseEditDialog } from "./CourseEditDialog";

export function CourseList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<CourseType | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseType | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data, isLoading, error } = useCourses({
    search: searchTerm,
    category: categoryFilter,
  });

  const deleteCourse = useDeleteCourse();

  const handleDelete = (course: CourseType) => {
    setCourseToDelete(course);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (courseToDelete) {
      deleteCourse.mutate(courseToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setCourseToDelete(null);
        },
      });
    }
  };

  const handleEdit = (course: CourseType) => {
    setSelectedCourse(course);
    setEditDialogOpen(true);
  };

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-destructive">
            Error loading courses: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Courses</CardTitle>
              <CardDescription>Manage your courses and content</CardDescription>
            </div>
            <Link href={"/admin/courses/create"}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Course
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="w-48">
              <Input
                placeholder="Filter by category..."
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-0">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading courses...
                    </TableCell>
                  </TableRow>
                ) : data?.courses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No courses found
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.courses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={course.image}
                            alt={course.title}
                            className="w-10 h-10 rounded object-cover"
                          />
                          <div>
                            <div className="font-medium">{course.title}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {course.shortDescription?.slice(0, 40)}...
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {course.category ? (
                          <Badge variant="outline">{course.category}</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>${course.price}</TableCell>
                      <TableCell>
                        <Badge
                          variant={course.isActive ? "default" : "secondary"}
                        >
                          {course.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(course.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handleEdit(course)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(course)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the course "{courseToDelete?.title}". This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteCourse.isPending}
            >
              {deleteCourse.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <CourseEditDialog
        course={selectedCourse}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={() => setEditDialogOpen(false)}
      />
    </div>
  );
}
