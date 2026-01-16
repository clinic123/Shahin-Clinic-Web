import { getServerSession } from "@/lib/get-session";
import { forbidden, unauthorized } from "next/navigation";
import DoctorAppointmentsPageComponent from "./_components/doctor";

const DoctorAdmin = async ({
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
  const session = await getServerSession();
  const user = session?.user;

  if (!user) unauthorized();

  if (user.role !== "doctor") forbidden();
  const params = await searchParams;

  return (
    <DoctorAppointmentsPageComponent
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

export default DoctorAdmin;
