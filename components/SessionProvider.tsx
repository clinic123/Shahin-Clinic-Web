import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export async function SessionProvider({ children }: { children: ReactNode }) {
  const { getServerSession } = await import("@/lib/get-session");
  const cookieHeader = (await cookies()).toString();
  const session = await getServerSession(cookieHeader);
  if (!session) {
    redirect("/login");
  }

  return <>{children}</>;
}
