import { ContentSkeleton, NavbarSkeleton } from "@/components/loading/admin";
import { getServerSession } from "@/lib/get-session";
import { Suspense } from "react";
import ForumHeader from "../../components/forum/ForumHeader";

async function LayoutContent({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  const user = session?.user;

  return (
    <>
      <ForumHeader user={user} />
      {children}
    </>
  );
}

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex container items-start gap-4">
          <div className="flex-1">
            <NavbarSkeleton />
            <ContentSkeleton />
          </div>
        </div>
      }
    >
      <LayoutContent> {children}</LayoutContent>
    </Suspense>
  );
}
