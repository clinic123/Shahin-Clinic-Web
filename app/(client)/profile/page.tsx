import { ContentSkeleton, NavbarSkeleton } from "@/components/loading/admin";
import ProfileClient from "@/components/profile-client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function SessionProvider() {
  const { getServerSession } = await import("@/lib/get-session");
  const cookieHeader = (await cookies()).toString();
  const session = await getServerSession(cookieHeader);
  if (!session) {
    redirect("/login");
  }

  return (
    <>
      <ProfileClient />
    </>
  );
}

const ProfilePage = () => {
  return (
    <Suspense
      fallback={
        <div className="container">
          <NavbarSkeleton />
          <ContentSkeleton />
        </div>
      }
    >
      <SessionProvider />
    </Suspense>
  );
};

export default ProfilePage;
