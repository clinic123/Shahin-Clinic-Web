"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateNotice,
  useUpdateNotice,
  type Notice,
} from "@/hooks/useNotices";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";

const noticeFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  summary: z.string().max(300).optional(),
  content: z.string().min(1, "Content is required"),
  category: z.enum(["general", "important", "update", "maintenance"]),
  isPublished: z.boolean().default(false),
  isPinned: z.boolean().default(false),
  expiresAt: z.date().optional().nullable(),
});

type NoticeFormValues = z.infer<typeof noticeFormSchema>;

interface NoticeFormProps {
  notice?: Notice;
  onSuccess?: () => void;
}

export function NoticeForm({ notice, onSuccess }: NoticeFormProps) {
  const router = useRouter();
  const createNoticeMutation = useCreateNotice();
  const updateNoticeMutation = useUpdateNotice();

  const isLoading =
    createNoticeMutation.isPending || updateNoticeMutation.isPending;

  const form = useForm<NoticeFormValues>({
    resolver: zodResolver(noticeFormSchema as any),
    defaultValues: {
      title: notice?.title || "",
      summary: notice?.summary || "",
      content: notice?.content || "",
      category: notice?.category || ("general" as any),
      isPublished: notice?.isPublished || false,
      isPinned: notice?.isPinned || false,
      expiresAt: notice?.expiresAt ? new Date(notice.expiresAt) : null,
    },
  });

  const onSubmit = async (data: NoticeFormValues) => {
    try {
      if (notice) {
        // Update existing notice
        await updateNoticeMutation.mutateAsync({
          id: notice.id,
          ...data,
        });
      } else {
        // Create new notice
        await createNoticeMutation.mutateAsync(data);
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/admin/notices");
      }
    } catch (error) {
      // Error handling is done in the mutation
      console.error("Error saving notice:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title *</FormLabel>
              <FormControl>
                <Input placeholder="Enter notice title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="summary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Summary</FormLabel>
              <FormControl>
                <RichTextEditor
                  value={field.value || ""}
                  onChange={field.onChange}
                  placeholder="Brief summary of the notice (optional)..."
                />
              </FormControl>
              <FormDescription>
                A short summary that will be shown in notice lists
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content *</FormLabel>
              <FormControl>
                <RichTextEditor
                  value={field.value || ""}
                  onChange={(val: string) => form.setValue("content", val)}
                  placeholder="Enter notice content..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="important">Important</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expiresAt"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Expiry Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                    <div className="p-3 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => field.onChange(null)}
                        className="w-full"
                      >
                        Clear Date
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Notices will be automatically hidden after this date
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="isPublished"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Publish</FormLabel>
                  <FormDescription>
                    Make this notice visible to users
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isPinned"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Pin Notice</FormLabel>
                  <FormDescription>
                    Keep this notice at the top of the list
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {notice ? "Update Notice" : "Create Notice"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/notices")}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
