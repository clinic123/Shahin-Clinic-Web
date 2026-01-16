interface TiptapViewerProps {
  content: string;
  className?: string;
}

export default function TiptapViewer({
  content,
  className = "",
}: TiptapViewerProps) {
  return (
    <div className={`${className}`}>
      <div
        className="prose prose-sm max-w-none text-foreground [&_p]:mb-3 [&_p:last-child]:mb-0 [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-2 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:ml-5 [&_ol]:list-decimal [&_ol]:ml-5 [&_li]:mb-1 [&_a]:text-primary [&_a]:underline [&_img]:rounded-lg [&_img]:my-3 [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic [&_code]:bg-muted [&_code]:px-1 [&_code]:rounded [&_code]:text-xs"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}
