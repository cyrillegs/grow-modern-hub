// Hand-written to match supabase/migrations/*.sql.
// Once the project is live, regenerate with:
//   npx supabase gen types typescript --project-id <project-ref> > src/types/database.ts

export type QuoteStatus = "pending" | "processed" | "cancelled";
export type ContactStatus = "new" | "replied" | "archived";
export type ReplySourceTable = "quotes" | "contacts";
export type ProductImageKey = "organic" | "liquid" | "specialty";
export type ProductIconKey = "leaf" | "droplets" | "sprout";

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
        Relationships: [];
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
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          slug: string;
          description: string;
          features: string[];
          npk: string;
          application: string;
          coverage: string;
          price: string;
          image_key: ProductImageKey;
          icon_key: ProductIconKey;
          sort_order: number;
          is_featured: boolean;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          slug: string;
          description: string;
          features?: string[];
          npk: string;
          application: string;
          coverage: string;
          price: string;
          image_key?: ProductImageKey;
          icon_key?: ProductIconKey;
          sort_order?: number;
          is_featured?: boolean;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string;
          slug?: string;
          description?: string;
          features?: string[];
          npk?: string;
          application?: string;
          coverage?: string;
          price?: string;
          image_key?: ProductImageKey;
          icon_key?: ProductIconKey;
          sort_order?: number;
          is_featured?: boolean;
          is_active?: boolean;
        };
        Relationships: [];
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
        Relationships: [];
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
