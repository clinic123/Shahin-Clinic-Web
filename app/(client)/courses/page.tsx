import CourseList from "@/components/courses-list";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Courses - Shaheen's Clinic | Homeopathy Education & Training",
  description: "Enroll in comprehensive homeopathy courses and training programs at Shaheen's Clinic. Learn classical homeopathy, holistic healing techniques, and advance your medical knowledge.",
  keywords: "homeopathy courses, medical courses, homeopathy training, online homeopathy courses, medical education",
};

const CoursePage = () => {
  return (
    <div>
      <CourseList redirectAuth='/login?redirect="/courses"' params="course" />
    </div>
  );
};

export default CoursePage;
