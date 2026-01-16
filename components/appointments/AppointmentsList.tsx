"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAppointments } from "@/hooks/useAppointments";
import { RefreshCw } from "lucide-react";
import LoadingUi from "../loading";
import AppointmentFilters from "./AppointmentFilters";
import AppointmentsTable from "./AppointmentsTable";

export interface AppointmentsListProps {
  status?: string;
  sort?: string;
  search?: string;
  doctorName?: string;
  department?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

const AdminAppointmentsList = ({
  status = "all",
  sort = "newest",
  search = "",
  doctorName = "",
  department = "",
  dateFrom = "",
  dateTo = "",
  page = 1,
  limit = 10,
}: AppointmentsListProps) => {
  const {
    data: appointments = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useAppointments({
    status: status === "all" ? "" : status,
    sort,
    search,
    doctorName,
    department,
    dateFrom,
    dateTo,
    page,
    limit,
  });

  if (isError) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-destructive">Error loading appointments</p>
          <p className="text-sm text-muted-foreground">{error?.message}</p>
          <Button onClick={() => refetch()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full py-10">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Appointment Management</CardTitle>
              <CardDescription>
                Manage and review all patient appointments
              </CardDescription>
            </div>
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <AppointmentFilters
            currentFilters={{
              status,
              sort,
              search,
              doctorName,
              department,
              dateFrom,
              dateTo,
            }}
          />
          {isLoading ? (
            <LoadingUi />
          ) : (
            <AppointmentsTable
              appointments={appointments}
              currentPage={page}
              onPageChange={(newPage) => {}}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAppointmentsList;
