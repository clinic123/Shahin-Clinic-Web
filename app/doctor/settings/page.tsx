import { getServerSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import DoctorSettingsPage from "../_components/settings-client";

async function SessionProvider() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <>
      <DoctorSettingsPage userId={session.user.id} />
    </>
  );
}

const ProfilePage = ({ params }: { params: Promise<{ slug: string }> }) => {
  return (
    <Suspense fallback={<div className="container"></div>}>
      <SessionProvider />
    </Suspense>
  );
};

export default ProfilePage;
