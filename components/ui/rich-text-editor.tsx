"use client";

import { cn } from "@/lib/utils";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

const ToolbarButton = ({
  onClick,
  icon: Icon,
  title,
  active = false,
  disabled = false,
}: {
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  active?: boolean;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={cn(
      "p-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-muted-foreground hover:bg-muted",
      active && "bg-muted text-foreground"
    )}
  >
    <Icon className="h-4 w-4" />
  </button>
);

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Enter description...",
  className = "",
}: RichTextEditorProps) {
  const isClient = typeof window !== "undefined";
  const isUpdatingRef = useRef(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      // Prevent infinite loops by checking if we're updating
      if (!isUpdatingRef.current) {
        isUpdatingRef.current = true;
        onChange(editor.getHTML());
        // Reset flag after a short delay
        setTimeout(() => {
          isUpdatingRef.current = false;
        }, 100);
      }
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl max-w-none min-h-[200px] p-4 focus:outline-none",
      },
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleImageUpload = useCallback(
    async (file: File) => {
      if (!editor) return;

      // Validate file size (max 5MB)
      const MAX_FILE_SIZE = 5 * 1024 * 1024;
      if (file.size > MAX_FILE_SIZE) {
        toast.error(
          `File size too large. Maximum size is ${
            MAX_FILE_SIZE / 1024 / 1024
          }MB`
        );
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files are allowed");
        return;
      }

      setIsUploadingImage(true);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Upload failed");
        }

        const result = await response.json();
        const imageUrl = result.secure_url;

        if (imageUrl) {
          editor.chain().focus().setImage({ src: imageUrl }).run();
          toast.success("Image uploaded successfully!");
        }
      } catch (error) {
        console.error("Image upload error:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to upload image"
        );
      } finally {
        setIsUploadingImage(false);
        // Reset input value to allow selecting the same file again
        if (imageInputRef.current) {
          imageInputRef.current.value = "";
        }
      }
    },
    [editor]
  );

  const setImage = useCallback(() => {
    if (!editor || isUploadingImage) return;
    imageInputRef.current?.click();
  }, [editor, isUploadingImage]);

  // Sync editor content when value prop changes (from external source)
  useEffect(() => {
    if (!editor || !isClient || isUpdatingRef.current) return;

    try {
      const currentContent = editor.getHTML();
      // Only update if the value actually changed to prevent infinite loops
      if (value !== undefined && value !== currentContent) {
        isUpdatingRef.current = true;

        // Use setTimeout to ensure this happens after render cycle
        const timeoutId = setTimeout(() => {
          if (editor && !editor.isDestroyed && !editor.isDestroyed) {
            try {
              editor.commands.setContent(value || "", { emitUpdate: false });
            } catch (err) {
              console.error("Error updating editor content:", err);
            }
          }
          isUpdatingRef.current = false;
        }, 0);

        return () => {
          clearTimeout(timeoutId);
          isUpdatingRef.current = false;
        };
      }
    } catch (error) {
      console.error("Error in editor sync:", error);
      isUpdatingRef.current = false;
    }
  }, [value, editor, isClient]);

  // Don't render until mounted on client
  if (!isClient || !editor) {
    return (
      <div
        className={cn(
          "border border-border rounded-lg overflow-hidden bg-card min-h-[200px]",
          className
        )}
      >
        <div className="flex items-center gap-1 p-2 border-b border-border bg-muted flex-wrap opacity-50">
          <div className="h-8 w-64 bg-muted rounded animate-pulse" />
        </div>
        <div className="min-h-[200px] p-4">
          <div className="h-4 bg-muted rounded animate-pulse mb-2" />
          <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "border border-border rounded-lg overflow-hidden bg-card text-foreground",
        className
      )}
    >
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-border bg-muted/60 flex-wrap">
        {/* Text Format */}
        <div className="flex items-center gap-1 border-r border-border pr-2 mr-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            icon={Bold}
            title="Bold"
            active={editor.isActive("bold")}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            icon={Italic}
            title="Italic"
            active={editor.isActive("italic")}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            icon={UnderlineIcon}
            title="Underline"
            active={editor.isActive("underline")}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            icon={Strikethrough}
            title="Strikethrough"
            active={editor.isActive("strike")}
          />
        </div>

        {/* Headings */}
        <div className="flex items-center gap-1 border-r border-border pr-2 mr-1">
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            icon={Heading1}
            title="Heading 1"
            active={editor.isActive("heading", { level: 1 })}
          />
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            icon={Heading2}
            title="Heading 2"
            active={editor.isActive("heading", { level: 2 })}
          />
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            icon={Heading3}
            title="Heading 3"
            active={editor.isActive("heading", { level: 3 })}
          />
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 4 }).run()
            }
            icon={Heading4}
            title="Heading 4"
            active={editor.isActive("heading", { level: 4 })}
          />
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-1 border-r border-border pr-2 mr-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            icon={AlignLeft}
            title="Align Left"
            active={editor.isActive({ textAlign: "left" })}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            icon={AlignCenter}
            title="Align Center"
            active={editor.isActive({ textAlign: "center" })}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            icon={AlignRight}
            title="Align Right"
            active={editor.isActive({ textAlign: "right" })}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            icon={AlignJustify}
            title="Justify"
            active={editor.isActive({ textAlign: "justify" })}
          />
        </div>

        {/* Lists */}
        <div className="flex items-center gap-1 border-r border-border pr-2 mr-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            icon={List}
            title="Bullet List"
            active={editor.isActive("bulletList")}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            icon={ListOrdered}
            title="Numbered List"
            active={editor.isActive("orderedList")}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            icon={Quote}
            title="Quote"
            active={editor.isActive("blockquote")}
          />
        </div>

        {/* Code */}
        <div className="flex items-center gap-1 border-r border-border pr-2 mr-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            icon={Code}
            title="Code"
            active={editor.isActive("code")}
          />
        </div>

        {/* Insert */}
        <div className="flex items-center gap-1 border-r border-border pr-2 mr-1">
          <ToolbarButton
            onClick={setLink}
            icon={LinkIcon}
            title="Insert Link"
          />
          <ToolbarButton
            onClick={setImage}
            icon={ImageIcon}
            title={isUploadingImage ? "Uploading..." : "Upload Image"}
            disabled={isUploadingImage}
          />
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleImageUpload(file);
              }
            }}
          />
        </div>

        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            icon={Undo}
            title="Undo"
            disabled={!editor.can().undo()}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            icon={Redo}
            title="Redo"
            disabled={!editor.can().redo()}
          />
        </div>
      </div>

      {/* Editor Content */}
      <div className="relative">
        <EditorContent editor={editor} />
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        .ProseMirror {
          outline: none;
          background-color: hsl(var(--card));
          color: hsl(var(--foreground));
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          color: hsl(var(--muted-foreground));
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          display: inline-block;
        }
        .ProseMirror a {
          color: hsl(var(--primary));
          text-decoration: underline;
          cursor: pointer;
        }
        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 1.5rem;
        }
        .ProseMirror ul {
          list-style-type: disc;
        }
        .ProseMirror ol {
          list-style-type: decimal;
        }
        .ProseMirror h1 {
          font-size: 2em;
          font-weight: bold;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
        .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
        .ProseMirror h3 {
          font-size: 1.25em;
          font-weight: bold;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
        .ProseMirror h4 {
          font-size: 1.1em;
          font-weight: bold;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
        .ProseMirror blockquote {
          border-left: 4px solid hsl(var(--border));
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: hsl(var(--muted-foreground));
        }
        .ProseMirror code {
          background-color: hsl(var(--muted));
          color: hsl(var(--foreground));
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-family: monospace;
          font-size: 0.9em;
        }
        .ProseMirror pre {
          background-color: hsl(var(--foreground));
          color: hsl(var(--background));
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1rem 0;
        }
        .ProseMirror pre code {
          background-color: transparent;
          color: inherit;
          padding: 0;
        }
      `}</style>
    </div>
  );
}
