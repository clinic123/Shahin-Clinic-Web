"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import {
  useDeleteNotice,
  useToggleNoticePin,
  useToggleNoticePublish,
  type Notice,
} from "@/hooks/useNotices";
import { format } from "date-fns";
import {
  Calendar,
  Edit,
  Eye,
  MoreHorizontal,
  Pin,
  Send,
  Trash2,
  User,
} from "lucide-react";
import { useState } from "react";

interface NoticeListProps {
  notices: Notice[];
  onEdit: (notice: Notice) => void;
  onDelete: (noticeId: string) => void;
}

export function NoticeList({ notices, onEdit, onDelete }: NoticeListProps) {
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const togglePublishMutation = useToggleNoticePublish();
  const togglePinMutation = useToggleNoticePin();
  const deleteMutation = useDeleteNotice();

  const handleView = (notice: Notice) => {
    setSelectedNotice(notice);
    setViewDialogOpen(true);
  };

  const handleTogglePublish = (notice: Notice) => {
    togglePublishMutation.mutate({
      id: notice.id,
      isPublished: !notice.isPublished,
    });
  };

  const handleTogglePin = (notice: Notice) => {
    togglePinMutation.mutate({
      id: notice.id,
      isPinned: !notice.isPinned,
    });
  };

  const handleDelete = async (noticeId: string) => {
    if (!confirm("Are you sure you want to delete this notice?")) {
      return;
    }
    deleteMutation.mutate(noticeId);
    onDelete(noticeId);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "important":
        return "destructive";
      case "update":
        return "default";
      case "maintenance":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <>
      <div className="space-y-4">
        {notices.map((notice) => (
          <Card key={notice.id} className="relative">
            {notice.isPinned && (
              <div className="absolute top-4 right-4">
                <Pin className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              </div>
            )}

            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {notice.title}
                    {!notice.isPublished && (
                      <Badge variant="outline" className="text-xs">
                        Draft
                      </Badge>
                    )}
                  </CardTitle>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {notice.author.name}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(notice.createdAt), "MMM d, yyyy")}
                    </div>
                    <Badge variant={getCategoryColor(notice.category)}>
                      {notice.category}
                    </Badge>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleView(notice)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(notice)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleTogglePublish(notice)}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {notice.isPublished ? "Unpublish" : "Publish"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleTogglePin(notice)}>
                      <Pin className="h-4 w-4 mr-2" />
                      {notice.isPinned ? "Unpin" : "Pin"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(notice.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            {notice.summary && (
              <CardContent>
                <p className="text-muted-foreground">{notice.summary}</p>

                {/* Quick Actions */}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={notice.isPublished}
                      onCheckedChange={() => handleTogglePublish(notice)}
                      disabled={togglePublishMutation.isPending}
                    />
                    <span className="text-sm">
                      {notice.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={notice.isPinned}
                      onCheckedChange={() => handleTogglePin(notice)}
                      disabled={togglePinMutation.isPending}
                    />
                    <span className="text-sm">
                      {notice.isPinned ? "Pinned" : "Pin"}
                    </span>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}

        {notices.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No notices found</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedNotice?.title}
              {selectedNotice?.isPinned && (
                <Pin className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              )}
            </DialogTitle>
            <DialogDescription>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {selectedNotice?.author.name}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {selectedNotice &&
                    format(new Date(selectedNotice.createdAt), "PPP")}
                </div>
                <Badge
                  variant={getCategoryColor(
                    selectedNotice?.category || "general"
                  )}
                >
                  {selectedNotice?.category}
                </Badge>
                {selectedNotice?.expiresAt && (
                  <div className="text-sm text-muted-foreground">
                    Expires: {format(new Date(selectedNotice.expiresAt), "PPP")}
                  </div>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>

          {selectedNotice && (
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: selectedNotice.content }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
