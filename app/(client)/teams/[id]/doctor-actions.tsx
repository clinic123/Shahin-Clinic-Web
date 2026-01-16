"use client";

import { Button } from "@/components/ui/button";
import {
  useDeleteDoctor,
  useUpdateDoctorStatus,
} from "@/hooks/useDoctors";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
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
import { Loader2 } from "lucide-react";

interface DoctorActionsProps {
  doctorId: string;
  status: "ACTIVE" | "INACTIVE";
}

export function DoctorActions({ doctorId, status }: DoctorActionsProps) {
  const router = useRouter();
  const deleteDoctorMutation = useDeleteDoctor();
  const updateStatusMutation = useUpdateDoctorStatus();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleStatusToggle = async () => {
    const newStatus = status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await updateStatusMutation.mutateAsync({
        id: doctorId,
        status: newStatus,
      });
      toast.success(`Doctor ${newStatus.toLowerCase()} successfully`);
      router.refresh();
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDoctorMutation.mutateAsync(doctorId);
      toast.success("Doctor deleted successfully");
      router.push("/teams");
    } catch (error) {
      // Error handling is done in the mutation
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleStatusToggle}
        disabled={updateStatusMutation.isPending}
        variant={status === "ACTIVE" ? "destructive" : "default"}
        size="sm"
        className="shadow-sm"
      >
        {updateStatusMutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Updating...
          </>
        ) : status === "ACTIVE" ? (
          "Deactivate"
        ) : (
          "Activate"
        )}
      </Button>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm" className="shadow-sm">
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete this doctor profile. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteDoctorMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteDoctorMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

