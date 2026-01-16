"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDeleteNotice, useNotices, type Notice } from "@/hooks/useNotices";
import { Loader2, Plus, RefreshCw, Search } from "lucide-react";
import { useState } from "react";
import { NoticeForm } from "./notice-form";
import { NoticeList } from "./notice-list";

export function NoticeManager() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);

  // Build query filters
  const filters = {
    page: 1,
    limit: 50,
    category: categoryFilter !== "all" ? categoryFilter : undefined,
    publishedOnly: activeTab === "published" ? true : undefined,
    search: searchTerm || undefined,
  };

  // Use TanStack Query to fetch notices
  const { data, isLoading, isError, error, refetch } = useNotices(filters);

  const deleteNoticeMutation = useDeleteNotice();

  const notices = data?.notices || [];

  const handleEdit = (notice: Notice) => {
    setEditingNotice(notice);
    setShowForm(true);
  };

  const handleDelete = (noticeId: string) => {
    deleteNoticeMutation.mutate(noticeId);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingNotice(null);
    // The mutation will automatically invalidate and refetch
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingNotice(null);
  };

  const handleRefresh = () => {
    refetch();
  };

  if (showForm) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {editingNotice ? "Edit Notice" : "Create New Notice"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <NoticeForm
              notice={editingNotice as any}
              onSuccess={handleFormSuccess}
            />
            <Button variant="outline" onClick={handleCancel} className="mt-4">
              Cancel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Notice Management
          </h1>
          <p className="text-muted-foreground">
            Create and manage notices for your application
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Notice
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>Notices</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notices..."
                  className="pl-8 w-full sm:w-[200px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="important">Important</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All Notices</TabsTrigger>
              <TabsTrigger value="published">Published</TabsTrigger>
              <TabsTrigger value="drafts">Drafts</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>Loading notices...</p>
                </div>
              ) : isError ? (
                <div className="text-center py-8">
                  <p className="text-destructive mb-4">Error loading notices</p>
                  <Button onClick={handleRefresh} variant="outline">
                    Try Again
                  </Button>
                </div>
              ) : (
                <NoticeList
                  notices={notices}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
