import AppointmentsList from "@/components/appointments/AppointmentsList";

const AdminAppointments = async ({
  searchParams,
}: {
  searchParams: Promise<{
    status: string;
    sort: string;
    search: string;
    doctorName: string;
    department: string;
    dateFrom: string;
    dateTo: string;
    page: string;
    limit: string;
  }>;
}) => {
  const params = await searchParams;

  return (
    <AppointmentsList
      status={params.status}
      sort={params.sort}
      search={params.search}
      doctorName={params.doctorName}
      department={params.department}
      dateFrom={params.dateFrom}
      dateTo={params.dateTo}
      page={params.page ? parseInt(params.page) : 1}
      limit={params.limit ? parseInt(params.limit) : 10}
    />
  );
};

export default AdminAppointments;
