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
import { useCreateCategory } from "@/hooks/useForum";
import { useSession } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Category name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  color: z.string().min(4, {
    message: "Please select a color.",
  }),
  order: z.number().min(0).default(0),
});

type FormData = z.infer<typeof formSchema>;

interface CreateCategoryDialogProps {
  onSuccess?: () => void;
}

export function CreateCategoryDialog({ onSuccess }: CreateCategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const createCategory = useCreateCategory();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema as any),

    defaultValues: {
      name: "",
      description: "",
      color: "#3b82f6",
      order: 0,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createCategory.mutateAsync(data);
      form.reset();
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      // Error is handled by the mutation
      console.error("Failed to create category:", error);
    }
  };

  // Only show for admins
  if (!session) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Category
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Category</DialogTitle>
          <DialogDescription>
            Add a new category to organize forum topics.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., General Discussion" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what this category is about..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          className="w-16 h-10 p-1"
                          {...field}
                        />
                        <Input
                          value={field.value}
                          onChange={field.onChange}
                          className="flex-1"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormDescription>Display order</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createCategory.isPending}>
                {createCategory.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Create Category
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
