import TiptapViewer from "@/components/TiptapRenderer";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
const fetchPost = async (slug: string) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/blogs/${slug}`
  );
  const data = await res.json();
  return data;
};

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const post = await fetchPost(slug);

  console.log("Post:", post);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Breadcrumb className="pb-2">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/blogs">Blogs</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{post.post.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <article className="prose lg:prose-xl max-w-none">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{post.post.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{post?.post.author.name}</span>
            <span>•</span>
            <time>
              {new Date(post.post.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </div>
        </header>
        <TiptapViewer
          content={post?.post.content || ""}
          className="tiptap-content"
        />
      </article>
    </div>
  );
}
