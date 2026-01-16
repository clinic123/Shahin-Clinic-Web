import { Suspense } from "react";
import CategoryPage from "./_components/CategoryPageDetails";

const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;

  return (
    <Suspense
      fallback={
        <>
          <p>Loading.....</p>
        </>
      }
    >
      <CategoryPage slug={slug} />
    </Suspense>
  );
};

export default Page;
