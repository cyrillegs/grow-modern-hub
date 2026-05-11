// Hand-written to match supabase/migrations/0001_init.sql.
// Once the project is live, regenerate with:
//   npx supabase gen types typescript --project-id <project-ref> > src/types/database.ts

export type QuoteStatus = "pending" | "processed" | "cancelled";
export type ContactStatus = "new" | "replied" | "archived";

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
    };
  };
};
