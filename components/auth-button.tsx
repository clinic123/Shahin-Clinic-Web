"use client";

import SignoutButton from "@/components/signout-button";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

export default function AuthButtons() {
  const { data: session } = authClient.useSession();

  return !session ? (
    <div className="flex gap-2 justify-center">
      <Link href="/login">
        <Button variant={"secondary"}>Sign In</Button>
      </Link>
      <Link href="/signup">
        <Button className="bg-blue-600 hover:bg-blue-500">Sign Up</Button>
      </Link>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <SignoutButton />
    </div>
  );
}
