import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface Scope {
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

export interface ScopeFormData {
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

// API functions for scopes management
const fetchScopes = async (): Promise<{
  scopes: Scope[];
}> => {
  const response = await fetch("/api/scopes");
  if (!response.ok) {
    throw new Error("Failed to fetch scopes");
  }
  return response.json();
};

const fetchScopeById = async (id: string): Promise<{ scope: Scope }> => {
  const response = await fetch(`/api/scopes/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch scope");
  }
  return response.json();
};

const createScope = async (
  data: ScopeFormData
): Promise<{ scope: Scope }> => {
  const response = await fetch("/api/scopes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create scope");
  }

  return response.json();
};

const updateScope = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<ScopeFormData>;
}): Promise<{ scope: Scope }> => {
  const response = await fetch(`/api/scopes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update scope");
  }

  return response.json();
};

const deleteScope = async (
  id: string
): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`/api/scopes/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete scope");
  }

  return response.json();
};

const updateScopeStatus = async ({
  id,
  status,
}: {
  id: string;
  status: "ACTIVE" | "INACTIVE";
}): Promise<{ scope: Scope }> => {
  const response = await fetch(`/api/scopes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update scope status");
  }

  return response.json();
};

const uploadProfileImage = async ({
  file,
  scopeId,
}: {
  file: File;
  scopeId: string;
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

  // Update the scope with the new image URL
  await updateScope({ id: scopeId, data: { profileImage: url } });

  return { url };
};

export const useScopes = () => {
  return useQuery({
    queryKey: ["scopes"],
    queryFn: fetchScopes,
    retry: 2,
    staleTime: 1 * 60 * 1000, // 1 minute - allows refetch after mutations
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useScope = (id: string) => {
  return useQuery({
    queryKey: ["scope", id],
    queryFn: () => fetchScopeById(id),
    enabled: !!id,
    retry: 2,
  });
};

export const useCreateScope = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createScope,
    onSuccess: (data) => {
      // Invalidate queries to trigger refetch from server
      queryClient.invalidateQueries({ queryKey: ["scopes"] });
      queryClient.invalidateQueries({ queryKey: ["scopeProfile"] });
      
      // Also update cache optimistically for immediate UI feedback
      queryClient.setQueryData(
        ["scopes"],
        (old: { scopes: Scope[] } | undefined) => {
          if (!old) return { scopes: [data.scope] };
          return {
            scopes: [...old.scopes, data.scope],
          };
        }
      );
      queryClient.setQueryData(["scopeProfile"], { scope: data.scope });

      toast.success("Scope profile created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useUpdateScope = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateScope,
    onSuccess: (data, variables) => {
      // Invalidate and refetch all related queries to get fresh data from server
      queryClient.invalidateQueries({ 
        queryKey: ["scopes"],
        refetchType: "active" // Only refetch active queries
      });
      queryClient.invalidateQueries({ 
        queryKey: ["scope", variables.id],
        refetchType: "active"
      });
      queryClient.invalidateQueries({ 
        queryKey: ["scopeProfile"],
        refetchType: "active"
      });
      
      // Update cache optimistically for immediate UI feedback
      // This will be overwritten by the refetch, but provides instant feedback
      queryClient.setQueryData(["scope", variables.id], data);
      queryClient.setQueryData(
        ["scopes"],
        (old: { scopes: Scope[] } | undefined) => {
          if (!old) return old;
          return {
            scopes: old.scopes.map((scope) =>
              scope.id === variables.id ? data.scope : scope
            ),
          };
        }
      );
      queryClient.setQueryData(
        ["scopeProfile"],
        (old: { scope: Scope } | undefined) => {
          if (!old || old.scope.id !== variables.id) return old;
          return { scope: data.scope };
        }
      );

      toast.success("Profile updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteScope = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteScope,
    onSuccess: (data, id) => {
      // Invalidate and refetch scopes list
      queryClient.invalidateQueries({ queryKey: ["scopes"] });
      // Remove the specific scope from cache
      queryClient.removeQueries({ queryKey: ["scope", id] });
      // Also invalidate scope profile if it exists
      queryClient.invalidateQueries({ queryKey: ["scopeProfile"] });

      toast.success(data.message || "Scope deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useUpdateScopeStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateScopeStatus,
    onSuccess: (data, variables) => {
      // Invalidate and refetch all related queries to get fresh data from server
      queryClient.invalidateQueries({ 
        queryKey: ["scopes"],
        refetchType: "active"
      });
      queryClient.invalidateQueries({ 
        queryKey: ["scope", variables.id],
        refetchType: "active"
      });
      queryClient.invalidateQueries({ 
        queryKey: ["scopeProfile"],
        refetchType: "active"
      });
      
      // Update cache optimistically for immediate UI feedback
      queryClient.setQueryData(["scope", variables.id], data);
      queryClient.setQueryData(
        ["scopes"],
        (old: { scopes: Scope[] } | undefined) => {
          if (!old) return old;
          return {
            scopes: old.scopes.map((scope) =>
              scope.id === variables.id ? data.scope : scope
            ),
          };
        }
      );
      queryClient.setQueryData(
        ["scopeProfile"],
        (old: { scope: Scope } | undefined) => {
          if (!old || old.scope.id !== variables.id) return old;
          return { scope: data.scope };
        }
      );

      toast.success(`Scope ${variables.status.toLowerCase()} successfully`);
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
      // Update the scope cache with new image
      queryClient.setQueryData(
        ["scope", variables.scopeId],
        (old: { scope: Scope } | undefined) => {
          if (!old) return old;
          return {
            scope: {
              ...old.scope,
              profileImage: data.url,
            },
          };
        }
      );

      // Update in scopes list
      queryClient.setQueryData(
        ["scopes"],
        (old: { scopes: Scope[] } | undefined) => {
          if (!old) return old;
          return {
            scopes: old.scopes.map((scope) =>
              scope.id === variables.scopeId
                ? { ...scope, profileImage: data.url }
                : scope
            ),
          };
        }
      );

      // Update scope profile
      queryClient.setQueryData(
        ["scopeProfile"],
        (old: { scope: Scope } | undefined) => {
          if (!old || old.scope.id !== variables.scopeId) return old;
          return {
            scope: {
              ...old.scope,
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
export const useScopeSearch = (searchTerm: string) => {
  const { data, ...query } = useScopes();

  const filteredScopes =
    data?.scopes.filter(
      (scope) =>
        scope.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scope.specialization
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        scope.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scope.email.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  return {
    ...query,
    scopes: filteredScopes,
    allScopes: data?.scopes || [],
  };
};






