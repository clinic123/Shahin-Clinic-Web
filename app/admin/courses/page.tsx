import { CourseList } from "@/components/admin/CourseList";
import LoadingUi from "@/components/loading";
import { Suspense } from "react";

const page = () => {
  return (
    <Suspense fallback={<LoadingUi />}>
      {/* <AdminClientCoursesPage /> */}
      <div className="py-6">
        <CourseList />
      </div>
    </Suspense>
  );
};

export default page;
