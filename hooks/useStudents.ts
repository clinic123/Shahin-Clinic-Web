import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { StudentRecord } from "@/lib/actions/fetchStudentsData";
import { toast } from "sonner";

interface FetchStudentsResponse {
  success: boolean;
  students: StudentRecord[];
}

export interface StudentFormData {
  name: string;
  description?: string;
  image?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
}

const fetchStudents = async (): Promise<FetchStudentsResponse> => {
  const response = await fetch("/api/students");
  if (!response.ok) {
    throw new Error("Failed to fetch students");
  }
  return response.json();
};

const fetchStudentById = async (id: string): Promise<{ student: StudentRecord }> => {
  const response = await fetch(`/api/students/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch student");
  }
  return response.json();
};

const createStudent = async (
  data: StudentFormData
): Promise<{ student: StudentRecord }> => {
  const response = await fetch("/api/students", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create student");
  }

  return response.json();
};

const updateStudent = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<StudentFormData>;
}): Promise<{ student: StudentRecord }> => {
  const response = await fetch(`/api/students/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update student");
  }

  return response.json();
};

const deleteStudent = async (
  id: string
): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`/api/students/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete student");
  }

  return response.json();
};

export const useStudents = () => {
  return useQuery({
    queryKey: ["students"],
    queryFn: fetchStudents,
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });
};

export const useStudent = (id: string) => {
  return useQuery({
    queryKey: ["student", id],
    queryFn: () => fetchStudentById(id),
    enabled: !!id,
    retry: 2,
  });
};

export const useCreateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStudent,
    onSuccess: (data) => {
      // Update the students list cache with the new student
      queryClient.setQueryData(
        ["students"],
        (old: FetchStudentsResponse | undefined) => {
          if (!old) return { success: true, students: [data.student] };
          return {
            success: true,
            students: [...old.students, data.student],
          };
        }
      );

      toast.success("Student created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateStudent,
    onSuccess: (data, variables) => {
      // Update the specific student in the cache
      queryClient.setQueryData(["student", variables.id], data);

      // Also update in the students list if it exists
      queryClient.setQueryData(
        ["students"],
        (old: FetchStudentsResponse | undefined) => {
          if (!old) return old;
          return {
            success: true,
            students: old.students.map((student) =>
              student.id === variables.id ? data.student : student
            ),
          };
        }
      );

      toast.success("Student updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteStudent,
    onSuccess: (data, id) => {
      // Invalidate and refetch students list
      queryClient.invalidateQueries({ queryKey: ["students"] });
      // Remove the specific student from cache
      queryClient.removeQueries({ queryKey: ["student", id] });

      toast.success(data.message || "Student deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Search hook for client-side filtering
export const useStudentSearch = (searchTerm: string) => {
  const { data, ...query } = useStudents();

  const filteredStudents =
    data?.students.filter(
      (student) =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  return {
    ...query,
    students: filteredStudents,
    allStudents: data?.students || [],
  };
};

