import { DoctorWithAppointmentRelationship } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  department: string;
  email: string;
  phone: string;
  bio?: string;
  experience: number;
  education: string;
  consultationFee: number;
  availableDays: string[];
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
  profileImage?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  userId?: string;
}

export interface DoctorFormData {
  name?: string;
  specialization: string;
  department: string;
  email?: string;
  phone: string;
  bio?: string;
  experience: number;
  education: string;
  consultationFee: number;
  availableDays: string[];
  status?: "ACTIVE" | "INACTIVE";
  profileImage?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  password?: string;
}

// API functions for doctors management
const fetchDoctors = async (): Promise<{
  doctors: DoctorWithAppointmentRelationship[];
}> => {
  const response = await fetch("/api/doctors");
  if (!response.ok) {
    throw new Error("Failed to fetch doctors");
  }
  return response.json();
};

const fetchDoctorById = async (id: string): Promise<{ doctor: Doctor }> => {
  const response = await fetch(`/api/doctors/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch doctor");
  }
  return response.json();
};

const createDoctor = async (
  data: DoctorFormData
): Promise<{ doctor: Doctor }> => {
  const response = await fetch("/api/doctors", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create doctor");
  }

  return response.json();
};

const updateDoctor = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<DoctorFormData>;
}): Promise<{ doctor: Doctor }> => {
  const response = await fetch(`/api/doctors/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update doctor");
  }

  return response.json();
};

const deleteDoctor = async (
  id: string
): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`/api/doctors/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete doctor");
  }

  return response.json();
};

const updateDoctorStatus = async ({
  id,
  status,
}: {
  id: string;
  status: "ACTIVE" | "INACTIVE";
}): Promise<{ doctor: Doctor }> => {
  const response = await fetch(`/api/doctors/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update doctor status");
  }

  return response.json();
};

const uploadProfileImage = async ({
  file,
  doctorId,
}: {
  file: File;
  doctorId: string;
}): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload image");
  }

  const { url } = await response.json();

  // Update the doctor with the new image URL
  await updateDoctor({ id: doctorId, data: { profileImage: url } });

  return { url };
};

export const useDoctors = () => {
  return useQuery({
    queryKey: ["doctors"],
    queryFn: fetchDoctors,
    retry: 2,
    staleTime: 1 * 60 * 1000, // 1 minute - allows refetch after mutations
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useDoctor = (id: string) => {
  return useQuery({
    queryKey: ["doctor", id],
    queryFn: () => fetchDoctorById(id),
    enabled: !!id,
    retry: 2,
  });
};

export const useCreateDoctor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDoctor,
    onSuccess: (data) => {
      // Invalidate queries to trigger refetch from server
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["doctorProfile"] });
      
      // Also update cache optimistically for immediate UI feedback
      queryClient.setQueryData(
        ["doctors"],
        (old: { doctors: Doctor[] } | undefined) => {
          if (!old) return { doctors: [data.doctor] };
          return {
            doctors: [...old.doctors, data.doctor],
          };
        }
      );
      queryClient.setQueryData(["doctorProfile"], { doctor: data.doctor });

      toast.success("Doctor profile created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useUpdateDoctor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDoctor,
    onSuccess: (data, variables) => {
      // Invalidate and refetch all related queries to get fresh data from server
      queryClient.invalidateQueries({ 
        queryKey: ["doctors"],
        refetchType: "active"
      });
      queryClient.invalidateQueries({ 
        queryKey: ["doctor", variables.id],
        refetchType: "active"
      });
      queryClient.invalidateQueries({ 
        queryKey: ["doctorProfile"],
        refetchType: "active"
      });
      
      // Update cache optimistically for immediate UI feedback
      queryClient.setQueryData(["doctor", variables.id], data);
      queryClient.setQueryData(
        ["doctors"],
        (old: { doctors: Doctor[] } | undefined) => {
          if (!old) return old;
          return {
            doctors: old.doctors.map((doctor) =>
              doctor.id === variables.id ? data.doctor : doctor
            ),
          };
        }
      );
      queryClient.setQueryData(
        ["doctorProfile"],
        (old: { doctor: Doctor } | undefined) => {
          if (!old || old.doctor.id !== variables.id) return old;
          return { doctor: data.doctor };
        }
      );

      toast.success("Profile updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteDoctor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDoctor,
    onSuccess: (data, id) => {
      // Invalidate and refetch doctors list
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      // Remove the specific doctor from cache
      queryClient.removeQueries({ queryKey: ["doctor", id] });
      // Also invalidate doctor profile if it exists
      queryClient.invalidateQueries({ queryKey: ["doctorProfile"] });

      toast.success(data.message || "Doctor deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useUpdateDoctorStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDoctorStatus,
    onSuccess: (data, variables) => {
      // Invalidate and refetch all related queries to get fresh data from server
      queryClient.invalidateQueries({ 
        queryKey: ["doctors"],
        refetchType: "active"
      });
      queryClient.invalidateQueries({ 
        queryKey: ["doctor", variables.id],
        refetchType: "active"
      });
      queryClient.invalidateQueries({ 
        queryKey: ["doctorProfile"],
        refetchType: "active"
      });
      
      // Update cache optimistically for immediate UI feedback
      queryClient.setQueryData(["doctor", variables.id], data);
      queryClient.setQueryData(
        ["doctors"],
        (old: { doctors: Doctor[] } | undefined) => {
          if (!old) return old;
          return {
            doctors: old.doctors.map((doctor) =>
              doctor.id === variables.id ? data.doctor : doctor
            ),
          };
        }
      );
      queryClient.setQueryData(
        ["doctorProfile"],
        (old: { doctor: Doctor } | undefined) => {
          if (!old || old.doctor.id !== variables.id) return old;
          return { doctor: data.doctor };
        }
      );

      toast.success(`Doctor ${variables.status.toLowerCase()} successfully`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useUploadProfileImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadProfileImage,
    onSuccess: (data, variables) => {
      // Update the doctor cache with new image
      queryClient.setQueryData(
        ["doctor", variables.doctorId],
        (old: { doctor: Doctor } | undefined) => {
          if (!old) return old;
          return {
            doctor: {
              ...old.doctor,
              profileImage: data.url,
            },
          };
        }
      );

      // Update in doctors list
      queryClient.setQueryData(
        ["doctors"],
        (old: { doctors: Doctor[] } | undefined) => {
          if (!old) return old;
          return {
            doctors: old.doctors.map((doctor) =>
              doctor.id === variables.doctorId
                ? { ...doctor, profileImage: data.url }
                : doctor
            ),
          };
        }
      );

      // Update doctor profile
      queryClient.setQueryData(
        ["doctorProfile"],
        (old: { doctor: Doctor } | undefined) => {
          if (!old || old.doctor.id !== variables.doctorId) return old;
          return {
            doctor: {
              ...old.doctor,
              profileImage: data.url,
            },
          };
        }
      );

      toast.success("Profile image updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Search hook for client-side filtering
export const useDoctorSearch = (searchTerm: string) => {
  const { data, ...query } = useDoctors();

  const filteredDoctors =
    data?.doctors.filter(
      (doctor) =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        doctor.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.email.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  return {
    ...query,
    doctors: filteredDoctors,
    allDoctors: data?.doctors || [],
  };
};
