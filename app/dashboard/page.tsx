import AppointmentForm from "@/components/AppointmentForm";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    userName?: string;
  }>;
}) {
  return (
    <div className="space-y-8">
      <AppointmentForm />
    </div>
  );
}
