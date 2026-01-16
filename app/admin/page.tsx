"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Loader2,
  Plus,
  RefreshCw,
  Trash,
  UserCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";

type User = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user" | "doctor";
  banned?: boolean;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState<{
    email: string;
    password: string;
    name: string;
    role: "admin" | "user" | "doctor";
  }>({
    email: "",
    password: "",
    name: "",
    role: "user",
  });
  const [isLoading, setIsLoading] = useState<string | undefined>();
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const [banForm, setBanForm] = useState({
    userId: "",
    reason: "",
    expirationDate: undefined as Date | undefined,
  });

  // State for users data
  const [users, setUsers] = useState<User[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 10;

  // Fetch users on component mount and when page changes
  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const fetchUsers = async () => {
    setIsUsersLoading(true);
    setUsersError(null);
    try {
      const offset = (currentPage - 1) * limit;
      const data = await authClient.admin.listUsers(
        {
          query: {
            limit: limit,
            offset: offset,
            sortBy: "createdAt",
            sortDirection: "desc",
          },
        },
        {
          throw: true,
        }
      );
      setUsers((data?.users as any) || []);

      // Calculate pagination info
      // If API returns total, use it; otherwise estimate from current data
      const total =
        (data as any)?.total ||
        (data as any)?.count ||
        data?.users?.length ||
        0;
      const pages = total > limit ? Math.ceil(total / limit) : 1;
      setTotalCount(total);
      setTotalPages(pages || 1);

      // If we got a full page of results, there might be more pages
      if (data?.users?.length === limit && totalPages === 1) {
        setTotalPages(currentPage + 1);
      }
    } catch (error: any) {
      setUsersError(error.message || "Failed to fetch users");
      toast.error(error.message || "Failed to fetch users");
    } finally {
      setIsUsersLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading("create");
    try {
      // Create user with Better-auth (supports admin and user roles)
      const roleToCreate = newUser.role === "doctor" ? "user" : newUser.role;
      const createdUser = await authClient.admin.createUser({
        email: newUser.email,
        password: newUser.password,
        name: newUser.name,
        role: roleToCreate as "admin" | "user",
      });

      // If role is "doctor", update it after creation
      // Better-auth returns user data in different formats, so we need to handle both
      const userId =
        (createdUser as any)?.user?.id ||
        (createdUser as any)?.id ||
        (createdUser as any)?.data?.user?.id;

      if (newUser.role === "doctor" && userId) {
        const response = await fetch(`/api/admin/users/${userId}/role`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: "doctor" }),
      });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to set doctor role");
        }
      }

      toast.success("User created successfully");
      setNewUser({ email: "", password: "", name: "", role: "user" });
      setIsDialogOpen(false);
      // Refresh the users list - go to first page to see new user
      setCurrentPage(1);
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast.error(error.message || "Failed to create user");
    } finally {
      setIsLoading(undefined);
    }
  };

  const handleDeleteUser = async (id: string) => {
    setIsLoading(`delete-${id}`);
    try {
      await authClient.admin.removeUser({ userId: id });
      toast.success("User deleted successfully");
      // Refresh the users list
      // If current page becomes empty, go to previous page
      if (users.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchUsers();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete user");
    } finally {
      setIsLoading(undefined);
    }
  };

  const handleUpdateRole = async (
    id: any,
    role: "admin" | "user" | "doctor"
  ) => {
    setIsLoading(`update-${id}`);
    try {
      // Use custom API route to update role directly in database
      // This ensures "doctor" role is properly saved
      const response = await fetch(`/api/admin/users/${id}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update user role");
      }

      toast.success("User role updated successfully");
      // Refresh the users list to show updated role
      await fetchUsers();
    } catch (error: any) {
      console.error("Error updating role:", error);
      toast.error(error.message || "Failed to update user role");
    } finally {
      setIsLoading(undefined);
    }
  };

  const handleRevokeSessions = async (id: string) => {
    setIsLoading(`revoke-${id}`);
    try {
      await authClient.admin.revokeUserSessions({ userId: id });

      toast.success("Sessions revoked for user");
    } catch (error: any) {
      toast.error(error.message || "Failed to revoke sessions");
    } finally {
      setIsLoading(undefined);
    }
  };

  const handleImpersonateUser = async (id: string) => {
    setIsLoading(`impersonate-${id}`);
    try {
      await authClient.admin.impersonateUser({ userId: id });
      toast.success("Impersonated user");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to impersonate user");
    } finally {
      setIsLoading(undefined);
    }
  };

  const handleBanUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(`ban-${banForm.userId}`);
    try {
      if (!banForm.expirationDate) {
        throw new Error("Expiration date is required");
      }
      await authClient.admin.banUser({
        userId: banForm.userId,
        banReason: banForm.reason,
        banExpiresIn: banForm.expirationDate.getTime() - new Date().getTime(),
      });
      toast.success("User banned successfully");
      setIsBanDialogOpen(false);
      // Refresh the users list
      await fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to ban user");
    } finally {
      setIsLoading(undefined);
    }
  };

  const handleUnbanUser = async (userId: string) => {
    setIsLoading(`ban-${userId}`);
    try {
      await authClient.admin.unbanUser(
        {
          userId: userId,
        },
        {
          onError(context) {
            toast.error(context.error.message || "Failed to unban user");
            setIsLoading(undefined);
          },
          onSuccess() {
            // Refresh the users list
            fetchUsers();
            toast.success("User unbanned successfully");
          },
        }
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to unban user");
      setIsLoading(undefined);
    }
  };

  return (
    <div className="space-y-8">
      <Toaster richColors />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                if (currentPage !== 1) {
                  setCurrentPage(1);
                } else {
                  fetchUsers();
                }
              }}
              variant="outline"
              disabled={isUsersLoading}
            >
              {isUsersLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Create User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      placeholder="Enter user email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) =>
                        setNewUser({ ...newUser, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter user password"
                      value={newUser.password}
                      onChange={(e) =>
                        setNewUser({ ...newUser, password: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={newUser.name}
                      placeholder="Enter full name"
                      onChange={(e) =>
                        setNewUser({ ...newUser, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={newUser.role}
                      onValueChange={(value: "admin" | "user" | "doctor") =>
                        setNewUser({ ...newUser, role: value })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="doctor">Doctor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading === "create"}
                  >
                    {isLoading === "create" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create User"
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <Dialog open={isBanDialogOpen} onOpenChange={setIsBanDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ban User</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleBanUser} className="space-y-4">
                <div>
                  <Label htmlFor="reason">Reason</Label>
                  <Input
                    id="reason"
                    value={banForm.reason}
                    onChange={(e) =>
                      setBanForm({ ...banForm, reason: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="expirationDate">Expiration Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="expirationDate"
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !banForm.expirationDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {banForm.expirationDate ? (
                          format(banForm.expirationDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={banForm.expirationDate}
                        onSelect={(date) =>
                          setBanForm({ ...banForm, expirationDate: date })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading === `ban-${banForm.userId}`}
                >
                  {isLoading === `ban-${banForm.userId}` ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Banning...
                    </>
                  ) : (
                    "Ban User"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isUsersLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : usersError ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <p className="text-red-500 mb-4">{usersError}</p>
                <Button onClick={fetchUsers}>Retry</Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Banned</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.role === "admin"
                            ? "default"
                            : user.role === "doctor"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {(user.role || "user").charAt(0).toUpperCase() +
                          (user.role || "user").slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.banned ? (
                        <Badge variant="destructive">Yes</Badge>
                      ) : (
                        <Badge variant="outline">No</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={isLoading?.startsWith("delete")}
                        >
                          {isLoading === `delete-${user.id}` ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRevokeSessions(user.id)}
                          disabled={isLoading?.startsWith("revoke")}
                        >
                          {isLoading === `revoke-${user.id}` ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleImpersonateUser(user.id)}
                          disabled={isLoading?.startsWith("impersonate")}
                        >
                          {isLoading === `impersonate-${user.id}` ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <UserCircle className="h-4 w-4 mr-2" />
                              Impersonate
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            setBanForm({
                              userId: user.id,
                              reason: "",
                              expirationDate: undefined,
                            });
                            if (user.banned) {
                              await handleUnbanUser(user.id);
                            } else {
                              setIsBanDialogOpen(true);
                            }
                          }}
                          disabled={isLoading?.startsWith("ban")}
                        >
                          {isLoading === `ban-${user.id}` ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : user.banned ? (
                            "Unban"
                          ) : (
                            "Ban"
                          )}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="border px-2 rounded bg-background">
                            Change Role
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() => handleUpdateRole(user.id, "admin")}
                            >
                              Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateRole(user.id, "doctor")
                              }
                            >
                              Doctor
                            </DropdownMenuItem>{" "}
                            <DropdownMenuItem
                              onClick={() => handleUpdateRole(user.id, "user")}
                            >
                              User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between px-2">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * limit + 1} to{" "}
                {Math.min(currentPage * limit, totalCount)} of {totalCount}{" "}
                users
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) {
                          setCurrentPage(currentPage - 1);
                        }
                      }}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(pageNum);
                          }}
                          isActive={currentPage === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) {
                          setCurrentPage(currentPage + 1);
                        }
                      }}
                      className={
                        currentPage >= totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
