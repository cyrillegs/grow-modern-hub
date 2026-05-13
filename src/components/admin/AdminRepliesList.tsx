import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Database, ReplySourceTable } from "@/types/database";

type AdminReply = Database["public"]["Tables"]["admin_replies"]["Row"];

type Props = {
  sourceTable: ReplySourceTable;
  sourceId: string;
};

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const AdminRepliesList = ({ sourceTable, sourceId }: Props) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: replies, isLoading } = useQuery<AdminReply[]>({
    queryKey: ["admin_replies", sourceTable, sourceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_replies")
        .select("*")
        .eq("source_table", sourceTable)
        .eq("source_id", sourceId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  if (isLoading) {
    return <p className="text-xs text-muted-foreground">Loading reply history…</p>;
  }

  if (!replies || replies.length === 0) {
    return <p className="text-xs text-muted-foreground italic">No replies sent yet.</p>;
  }

  return (
    <div className="space-y-2">
      {replies.map((reply) => {
        const isExpanded = expandedId === reply.id;
        return (
          <div
            key={reply.id}
            className="border rounded-md overflow-hidden bg-muted/30"
          >
            <button
              type="button"
              onClick={() => setExpandedId(isExpanded ? null : reply.id)}
              className="w-full flex items-start gap-2 p-3 text-left hover:bg-muted/50 transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-medium truncate">{reply.subject}</p>
                  <p className="text-xs text-muted-foreground flex-shrink-0">
                    {formatDate(reply.created_at)}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  To: {reply.to_email}
                </p>
              </div>
            </button>
            {isExpanded && (
              <div className="px-3 pb-3 pl-9 border-t bg-background/50">
                <pre className="text-sm whitespace-pre-wrap font-sans mt-3">
                  {reply.body}
                </pre>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
