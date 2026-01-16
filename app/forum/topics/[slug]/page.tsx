import TopicDetail from "@/components/forum/TopicDetail";
import LoadingUi from "@/components/loading";
import { Suspense } from "react";
const fetchPost = async (slug: string) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/forum/topics/${slug}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch post");
  }

  const data = await res.json();
  return data;
};
export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;

  const post = await fetchPost(slug);
  return {
    title: post.title,
    describe: post.shortDescription,
  };
};

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const topic = await fetchPost(slug);

  return (
    <Suspense fallback={<LoadingUi />}>
      <TopicDetail topic={topic} />
    </Suspense>
  );
}
