export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type SubscriptionTier = "free" | "pro" | "business";

export type RequestStatus =
  | "pending"
  | "analyzing"
  | "generating"
  | "completed"
  | "failed";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          credits: number;
          subscription_tier: SubscriptionTier;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          credits?: number;
          subscription_tier?: SubscriptionTier;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          credits?: number;
          subscription_tier?: SubscriptionTier;
          created_at?: string;
          updated_at?: string;
        };
      };
      devices: {
        Row: {
          id: string;
          brand: string;
          model: string;
          category: string | null;
          serial_pattern: string | null;
          manual_url: string | null;
          specs: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          brand: string;
          model: string;
          category?: string | null;
          serial_pattern?: string | null;
          manual_url?: string | null;
          specs?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          brand?: string;
          model?: string;
          category?: string | null;
          serial_pattern?: string | null;
          manual_url?: string | null;
          specs?: Json | null;
          created_at?: string;
        };
      };
      tutorial_requests: {
        Row: {
          id: string;
          user_id: string;
          problem_description: string;
          problem_audio_url: string | null;
          problem_image_url: string | null;
          device_id: string | null;
          device_input: string | null;
          status: RequestStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          problem_description: string;
          problem_audio_url?: string | null;
          problem_image_url?: string | null;
          device_id?: string | null;
          device_input?: string | null;
          status?: RequestStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          problem_description?: string;
          problem_audio_url?: string | null;
          problem_image_url?: string | null;
          device_id?: string | null;
          device_input?: string | null;
          status?: RequestStatus;
          created_at?: string;
        };
      };
      tutorials: {
        Row: {
          id: string;
          request_id: string;
          title: string;
          script: Json | null;
          video_url: string | null;
          thumbnail_url: string | null;
          duration_seconds: number | null;
          language: string;
          steps_count: number | null;
          is_public: boolean;
          views: number;
          helpful_votes: number;
          not_helpful_votes: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          request_id: string;
          title: string;
          script?: Json | null;
          video_url?: string | null;
          thumbnail_url?: string | null;
          duration_seconds?: number | null;
          language?: string;
          steps_count?: number | null;
          is_public?: boolean;
          views?: number;
          helpful_votes?: number;
          not_helpful_votes?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          request_id?: string;
          title?: string;
          script?: Json | null;
          video_url?: string | null;
          thumbnail_url?: string | null;
          duration_seconds?: number | null;
          language?: string;
          steps_count?: number | null;
          is_public?: boolean;
          views?: number;
          helpful_votes?: number;
          not_helpful_votes?: number;
          created_at?: string;
        };
      };
      feedback: {
        Row: {
          id: string;
          tutorial_id: string;
          user_id: string;
          was_helpful: boolean;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tutorial_id: string;
          user_id: string;
          was_helpful: boolean;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tutorial_id?: string;
          user_id?: string;
          was_helpful?: boolean;
          comment?: string | null;
          created_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          stripe_payment_id: string | null;
          amount_cents: number;
          credits_purchased: number;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_payment_id?: string | null;
          amount_cents: number;
          credits_purchased: number;
          status: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_payment_id?: string | null;
          amount_cents?: number;
          credits_purchased?: number;
          status?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      subscription_tier: SubscriptionTier;
      request_status: RequestStatus;
    };
  };
}

// Utility types for easier access
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export type Device = Database["public"]["Tables"]["devices"]["Row"];
export type DeviceInsert = Database["public"]["Tables"]["devices"]["Insert"];
export type DeviceUpdate = Database["public"]["Tables"]["devices"]["Update"];

export type TutorialRequest =
  Database["public"]["Tables"]["tutorial_requests"]["Row"];
export type TutorialRequestInsert =
  Database["public"]["Tables"]["tutorial_requests"]["Insert"];
export type TutorialRequestUpdate =
  Database["public"]["Tables"]["tutorial_requests"]["Update"];

export type Tutorial = Database["public"]["Tables"]["tutorials"]["Row"];
export type TutorialInsert =
  Database["public"]["Tables"]["tutorials"]["Insert"];
export type TutorialUpdate =
  Database["public"]["Tables"]["tutorials"]["Update"];

export type Feedback = Database["public"]["Tables"]["feedback"]["Row"];
export type FeedbackInsert =
  Database["public"]["Tables"]["feedback"]["Insert"];
export type FeedbackUpdate =
  Database["public"]["Tables"]["feedback"]["Update"];

export type Payment = Database["public"]["Tables"]["payments"]["Row"];
export type PaymentInsert = Database["public"]["Tables"]["payments"]["Insert"];
export type PaymentUpdate = Database["public"]["Tables"]["payments"]["Update"];
