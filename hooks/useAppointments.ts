// hooks/useAppointments.ts
import type { Appointment } from "@/prisma/generated/prisma";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface UseAppointmentsParams {
  sort?: string;
  status?: string;
  search?: string;
  doctorName?: string;
  department?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

// API functions
const fetchAppointments = async (
  params: UseAppointmentsParams = {}
): Promise<Appointment[]> => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, value.toString());
    }
  });

  const response = await fetch(`/api/appointments?${searchParams}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    if (response.status === 403) {
      throw new Error(errorData.error || "Admin access required");
    }

    if (response.status === 401) {
      throw new Error("Please sign in to access this page");
    }

    throw new Error(errorData.error || "Failed to fetch appointments");
  }

  const data = await response.json();
  return data.appointments || [];
};

const acceptAppointmentAPI = async (appointmentId: string): Promise<void> => {
  const response = await fetch("/api/appointments/accept", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ appointmentId }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to accept appointment");
  }
};
const completeAppointmentAPI = async (appointmentId: string): Promise<void> => {
  const response = await fetch("/api/appointments/completed", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ appointmentId }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to accept appointment");
  }
};

const rejectAppointmentAPI = async ({
  appointmentId,
  reason,
}: {
  appointmentId: string;
  reason?: string;
}): Promise<void> => {
  const response = await fetch("/api/appointments/reject", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ appointmentId, reason }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to reject appointment");
  }
};

// Custom hooks
export const useAppointments = (params: UseAppointmentsParams = {}) => {
  return useQuery({
    queryKey: ["appointments", params],
    queryFn: () => fetchAppointments(params),
    retry: 2,
    staleTime: 1000 * 60 * 5,
  });
};

export const useAcceptAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: acceptAppointmentAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
};

export const useRejectAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rejectAppointmentAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
};
export const useCompleteAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: completeAppointmentAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
};

// Utility functions
export const getStatusVariant = (status: string) => {
  switch (status) {
    case "PENDING":
      return "secondary";
    case "CONFIRMED":
      return "default";
    case "CANCELLED":
      return "destructive";
    case "COMPLETED":
      return "default";
    default:
      return "outline";
  }
};

export const formatAppointmentDate = (dateStr: string) =>
  new Date(dateStr).toLocaleString();
