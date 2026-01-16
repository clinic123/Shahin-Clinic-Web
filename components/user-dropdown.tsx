"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/lib/auth";
import { authClient } from "@/lib/auth-client";
import { LogOutIcon, ShieldIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaUserDoctor } from "react-icons/fa6";
import { toast } from "sonner";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface UserDropdownProps {
  user?: User;
}

export function UserDropdown({ user }: UserDropdownProps) {
  if (!user) {
    return (
      <Button>
        <Link href="/login">Login</Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="relative">
          {user.image !== "" ? (
            <Avatar>
              <AvatarImage src={user.image || "/avatar.png"} />
              <AvatarFallback>{user.name.slice(0, 1)}</AvatarFallback>
            </Avatar>
          ) : (
            <UserIcon />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
        <span className="text-sm">{user.name}</span>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <UserIcon className="size-4" /> <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        {user.role === "admin" && <AdminItem />}
        {user.role === "doctor" && <DoctorItem />}
        {user.role === "user" && <UserItem />}
        <SignOutItem />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AdminItem() {
  return (
    <DropdownMenuItem asChild>
      <Link href="/admin">
        <ShieldIcon className="size-4" /> <span>Admin</span>
      </Link>
    </DropdownMenuItem>
  );
}
function DoctorItem() {
  return (
    <DropdownMenuItem asChild>
      <Link href="/doctor">
        <FaUserDoctor className="size-4" /> <span>Doctor</span>
      </Link>
    </DropdownMenuItem>
  );
}
function UserItem() {
  return (
    <DropdownMenuItem asChild>
      <Link href="/dashboard">
        <FaUserDoctor className="size-4" /> <span>Dashboard</span>
      </Link>
    </DropdownMenuItem>
  );
}

function SignOutItem() {
  const router = useRouter();

  async function handleSignOut() {
    const { error } = await authClient.signOut();
    if (error) {
      toast.error(error.message || "Something went wrong");
    } else {
      toast.success("Signed out successfully");
      router.push("/login");
    }
  }

  return (
    <DropdownMenuItem onClick={handleSignOut}>
      <LogOutIcon className="size-4" /> <span>Sign out</span>
    </DropdownMenuItem>
  );
}
