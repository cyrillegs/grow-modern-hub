// Hand-written to match supabase/migrations/*.sql.
// Once the project is live, regenerate with:
//   npx supabase gen types typescript --project-id <project-ref> > src/types/database.ts

export type QuoteStatus = "pending" | "processed" | "cancelled";
export type ContactStatus = "new" | "replied" | "archived";
export type ReplySourceTable = "quotes" | "contacts";

export type Database = {
  public: {
    Tables: {
      contacts: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          email: string;
          phone: string | null;
          message: string;
          status: ContactStatus;
          admin_notes: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          email: string;
          phone?: string | null;
          message: string;
          status?: ContactStatus;
          admin_notes?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          message?: string;
          status?: ContactStatus;
          admin_notes?: string | null;
        };
      };
      quotes: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          email: string;
          phone: string;
          product: string;
          quantity: string;
          message: string | null;
          status: QuoteStatus;
          admin_notes: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          email: string;
          phone: string;
          product: string;
          quantity: string;
          message?: string | null;
          status?: QuoteStatus;
          admin_notes?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string;
          email?: string;
          phone?: string;
          product?: string;
          quantity?: string;
          message?: string | null;
          status?: QuoteStatus;
          admin_notes?: string | null;
        };
      };
      admin_replies: {
        Row: {
          id: string;
          created_at: string;
          source_table: ReplySourceTable;
          source_id: string;
          to_email: string;
          subject: string;
          body: string;
          sent_by_user_id: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          source_table: ReplySourceTable;
          source_id: string;
          to_email: string;
          subject: string;
          body: string;
          sent_by_user_id?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          source_table?: ReplySourceTable;
          source_id?: string;
          to_email?: string;
          subject?: string;
          body?: string;
          sent_by_user_id?: string | null;
        };
      };
    };
    // Empty Views / Functions / Enums / CompositeTypes are required by recent
    // @supabase/supabase-js versions even when you don't use them. Without
    // them, `.update()` / `.insert()` argument types can collapse to `never`.
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
