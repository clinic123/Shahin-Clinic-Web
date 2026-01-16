import TiptapViewer from "@/components/TiptapRenderer";
import { formatDate } from "@/lib/utils";
import { PostTypeWithRelations } from "@/types/post";

const fetchPost = async (id: string) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/posts/${id}`
  );
  const data: PostTypeWithRelations = await res.json();
  return data;
};

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  const post = await fetchPost(id);
  return {
    title: post.title,
    describe: post.shortDescription,
  };
};

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const post = await fetchPost(id);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <article className="prose lg:prose-xl max-w-none">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <time dateTime={post.publishedAt!.toISOString()}>
              {formatDate(post.publishedAt!)}
            </time>
            <span>•</span>
            <span>{post.author.name}</span>
          </div>
        </header>
        <TiptapViewer content={post.content} className="tiptap-content" />
      </article>
      {/* <CommentSection postId={post.id} /> */}
    </div>
  );
}
