import BookPurchaseActions from "@/components/books/BookPurchaseActions";
import prisma from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeftIcon } from "lucide-react";
import { unstable_cache } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

interface BookRecord {
  id: string;
  title: string;
  author: string;
  description: string;
  image: string;
  price: number;
  stock: number;
  rokomariLinkForDirectBuy?: string | null;
  amazonLink?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

async function getBookById(bookId: string): Promise<BookRecord | null> {
  // Validate bookId
  if (!bookId || bookId.trim() === "") {
    return null;
  }

  // Use unstable_cache for better cache control with revalidation tags
  const getCachedBook = unstable_cache(
    async () => {
      const book = await prisma.book.findUnique({
        where: {
          id: bookId.trim(),
          isActive: true,
        },
        select: {
          id: true,
          title: true,
          author: true,
          description: true,
          image: true,
          price: true,
          stock: true,
          rokomariLinkForDirectBuy: true,
          amazonLink: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return book;
    },
    [`book-${bookId}`],
    {
      tags: [`book-${bookId}`, "books"],
      revalidate: 60, // Revalidate every 60 seconds to show updated books
    }
  );

  return getCachedBook();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const book = await getBookById(id);

  if (!book) {
    return {
      title: "Book Not Found - Shaheen's Clinic",
      description: "The requested book could not be found.",
    };
  }

  return {
    title: `${book.title} by ${book.author} - Shaheen's Clinic Books`,
    description: book.description || `Purchase ${book.title} by ${book.author} from Shaheen's Clinic bookstore.`,
    keywords: `${book.title}, ${book.author}, homeopathy book, medical book, Shaheen's Clinic`,
  };
}

export default async function BookDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const book = await getBookById(id);

    if (!book) {
      notFound();
    }

    // Convert Date objects to strings for compatibility
    const bookData = {
      ...book,
      createdAt:
        typeof book.createdAt === "string"
          ? book.createdAt
          : book.createdAt.toISOString(),
      updatedAt:
        typeof book.updatedAt === "string"
          ? book.updatedAt
          : book.updatedAt.toISOString(),
    };

    return (
      <section className="container py-12 space-y-10">
        <Link
          href="/books"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" /> Back to books
        </Link>

        <div className="grid gap-10 lg:grid-cols-2">
          <div className="relative aspect-square overflow-hidden rounded-3xl border bg-white">
            <Image
              src={book.image}
              alt={book.title}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain"
              priority
            />
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-sm uppercase tracking-wide text-muted-foreground">
                {book.author}
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
                {book.title}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-primary">
                ৳{book.price.toLocaleString()}
              </span>
              {book.stock > 0 ? (
                <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
                  In stock ({book.stock})
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-600">
                  Out of stock
                </span>
              )}
            </div>

            <div
              className="prose prose-sm max-w-none text-foreground [&_p]:mb-3 [&_p:last-child]:mb-0 [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-2 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:ml-5 [&_ol]:list-decimal [&_ol]:ml-5 [&_li]:mb-1 [&_a]:text-primary [&_a]:underline [&_img]:rounded-lg [&_img]:my-3 [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic [&_code]:bg-muted [&_code]:px-1 [&_code]:rounded [&_code]:text-xs"
              dangerouslySetInnerHTML={{ __html: book.description }}
            />

            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                Published:{" "}
                {new Date(bookData.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p>
                Last updated:{" "}
                {formatDistanceToNow(new Date(bookData.updatedAt), {
                  addSuffix: true,
                })}
              </p>
            </div>

            <BookPurchaseActions
              bookId={book.id}
              inStock={book.stock > 0}
              rokomariLink={book.rokomariLinkForDirectBuy ?? undefined}
              amazonLink={book.amazonLink ?? undefined}
            />
          </div>
        </div>
      </section>
    );
  } catch (error) {
    console.error("Error fetching book:", error);
    notFound();
  }
}
