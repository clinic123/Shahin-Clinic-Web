import Image from "next/image";
import Link from "next/link";

export default function NoticeButton() {
  return (
    <div className="fixed  top-52 right-5 z-50">
      <Link href="/notices">
        <Image
          alt="notice"
          src={"/bgn.png"}
          height={90}
          width={90}
          className="rounded-lg w-28 h-20  "
        />
      </Link>
    </div>
  );
}

