"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";

import { useCreateTopic } from "@/hooks/useForum";
import { useSession } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  title: z.string().min(5, {
    message: "Topic title must be at least 5 characters.",
  }),
  content: z.string().min(10, {
    message: "Content must be at least 10 characters.",
  }),
});

type FormData = z.infer<typeof formSchema>;

interface CreateTopicDialogProps {
  categoryId: string;
  categoryName: string;
  onSuccess?: () => void;
}

export function CreateTopicDialog({
  categoryId,
  categoryName,
  onSuccess,
}: CreateTopicDialogProps) {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const createTopic = useCreateTopic();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createTopic.mutateAsync({
        ...data,
        categoryId,
      });
      form.reset();
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to create topic:", error);
    }
  };

  if (!session) {
    return (
      <Button asChild>
        <a href="/auth/signin">
          <Plus className="h-4 w-4 mr-2" />
          Sign in to Create Topic
        </a>
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Topic
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Topic</DialogTitle>
          <DialogDescription>
            Create a new discussion topic in {categoryName}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter a descriptive title for your topic..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write your topic content here... You can use Markdown formatting."
                      rows={10}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Be descriptive and clear about what you want to discuss.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createTopic.isPending}>
                {createTopic.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Create Topic
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
