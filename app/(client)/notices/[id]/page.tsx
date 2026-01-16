import { ClientNoticeDetails } from "@/components/notices/client-notice-details";
import { Metadata } from "next";

interface NoticePageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: NoticePageProps): Promise<Metadata> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/notices/${params.id}`,
      {
        next: { revalidate: 60 }, // Revalidate every minute
      }
    );

    if (!response.ok) {
      return {
        title: "Notice Not Found",
      };
    }

    const { notice } = await response.json();

    return {
      title: `${notice.title} | Notices`,
      description: notice.summary || notice.content.slice(0, 160),
    };
  } catch {
    return {
      title: "Notice",
    };
  }
}

export default function NoticeDetailPage({ params }: NoticePageProps) {
  return <ClientNoticeDetails noticeId={params.id} />;
}
