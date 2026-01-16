import { AppointmentType } from "@/types";
import { cacheLife } from "next/cache";
export const fetchAppointments = async ({
  status,
  sort,
  search,
}: {
  status?: string;
  sort?: string;
  search?: string;
}) => {
  "use cache";
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/appointments?${
      status ? `status=${status}` : ""
    }${search ? `&search=${search}` : ""}&sort=${sort || "newest"}`,
    {
      next: {
        tags: [`appointments`],
      },
    }
  );
  cacheLife("hours");
  const data: AppointmentType[] = await res.json();
  return data;
};
