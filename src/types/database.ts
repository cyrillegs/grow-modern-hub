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
  };
};
