import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import type { ReplySourceTable } from "@/types/database";

const replySchema = z.object({
  subject: z.string().trim().min(1, "Subject is required").max(255, "Subject is too long"),
  body: z.string().trim().min(1, "Message is required").max(10000, "Message is too long"),
});

type ReplyFormValues = z.infer<typeof replySchema>;

type Props = {
  /** Customer email to send to. */
  to: string;
  /** Customer name — used to personalize the greeting in the default body. */
  toName: string;
  /** Pre-filled subject (admin can edit). */
  defaultSubject: string;
  /** Table that owns the row this reply belongs to. */
  sourceTable: ReplySourceTable;
  /** UUID of the row in `sourceTable`. */
  sourceId: string;
  /**
   * Called after a successful send (after the email goes out + reply is
   * logged). Typically used to mark the related row as replied/processed.
   */
  onSentSuccessfully?: () => void;
  trigger: React.ReactNode;
};

const defaultBody = (name: string) =>
  `Hi ${name},

Thanks for reaching out to GreenGrows.



— The GreenGrows team`;

export const ReplyDialog = ({
  to,
  toName,
  defaultSubject,
  sourceTable,
  sourceId,
  onSentSuccessfully,
  trigger,
}: Props) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<ReplyFormValues>({
    resolver: zodResolver(replySchema),
    defaultValues: {
      subject: defaultSubject,
      body: defaultBody(toName),
    },
  });

  const onSubmit = async (values: ReplyFormValues) => {
    const { data, error } = await supabase.functions.invoke<{
      ok?: boolean;
      warning?: string;
      error?: string;
    }>("send-reply", {
      body: {
        to,
        subject: values.subject,
        body: values.body,
        sourceTable,
        sourceId,
      },
    });

    if (error) {
      toast({
        title: "Failed to send reply",
        description: error.message || "Try again in a moment.",
        variant: "destructive",
      });
      return;
    }

    if (data?.warning) {
      toast({
        title: "Reply sent — but logging failed",
        description: data.warning,
      });
    } else {
      toast({
        title: "Reply sent",
        description: `Delivered to ${to}.`,
      });
    }

    // Refresh the replies history for this row so the new reply appears.
    queryClient.invalidateQueries({
      queryKey: ["admin_replies", sourceTable, sourceId],
    });

    form.reset();
    setOpen(false);
    onSentSuccessfully?.();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          form.reset({
            subject: defaultSubject,
            body: defaultBody(toName),
          });
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Reply to {toName}</DialogTitle>
          <DialogDescription>
            Sending to <strong>{to}</strong>. Replies come back to your inbox.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea className="min-h-[260px] text-sm" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Sending…" : "Send Reply"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
