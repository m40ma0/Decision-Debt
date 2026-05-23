export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type DecisionCategory =
  | "work"
  | "school"
  | "money"
  | "health"
  | "relationships"
  | "personal"
  | "other";

export type DecisionStatus =
  | "open"
  | "committed"
  | "deferred"
  | "delegated"
  | "deleted";

export type DecisionStakes = "low" | "medium" | "high";
export type ProConKind = "pro" | "con";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string | null;
          full_name?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      decisions: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          category: DecisionCategory;
          status: DecisionStatus;
          deadline: string | null;
          review_date: string | null;
          stakes: DecisionStakes;
          emotional_load: number;
          time_impact: number;
          money_impact: number;
          confidence: number;
          blockers: string[];
          missing_information: string[];
          next_action: string;
          final_decision: string;
          resolution_reason: string;
          outcome_notes: string;
          delegated_to: string;
          defer_reason: string;
          is_demo: boolean;
          created_at: string;
          updated_at: string;
          resolved_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string;
          category?: DecisionCategory;
          status?: DecisionStatus;
          deadline?: string | null;
          review_date?: string | null;
          stakes?: DecisionStakes;
          emotional_load?: number;
          time_impact?: number;
          money_impact?: number;
          confidence?: number;
          blockers?: string[];
          missing_information?: string[];
          next_action?: string;
          final_decision?: string;
          resolution_reason?: string;
          outcome_notes?: string;
          delegated_to?: string;
          defer_reason?: string;
          is_demo?: boolean;
          created_at?: string;
          updated_at?: string;
          resolved_at?: string | null;
        };
        Update: {
          title?: string;
          description?: string;
          category?: DecisionCategory;
          status?: DecisionStatus;
          deadline?: string | null;
          review_date?: string | null;
          stakes?: DecisionStakes;
          emotional_load?: number;
          time_impact?: number;
          money_impact?: number;
          confidence?: number;
          blockers?: string[];
          missing_information?: string[];
          next_action?: string;
          final_decision?: string;
          resolution_reason?: string;
          outcome_notes?: string;
          delegated_to?: string;
          defer_reason?: string;
          is_demo?: boolean;
          resolved_at?: string | null;
        };
        Relationships: [];
      };
      decision_options: {
        Row: {
          id: string;
          decision_id: string;
          user_id: string;
          title: string;
          description: string;
          is_selected: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          decision_id: string;
          user_id: string;
          title: string;
          description?: string;
          is_selected?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string;
          is_selected?: boolean;
        };
        Relationships: [];
      };
      decision_option_pros_cons: {
        Row: {
          id: string;
          option_id: string;
          decision_id: string;
          user_id: string;
          kind: ProConKind;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          option_id: string;
          decision_id: string;
          user_id: string;
          kind: ProConKind;
          body: string;
          created_at?: string;
        };
        Update: {
          kind?: ProConKind;
          body?: string;
        };
        Relationships: [];
      };
      decision_events: {
        Row: {
          id: string;
          decision_id: string;
          user_id: string;
          event_type: string;
          title: string;
          body: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          decision_id: string;
          user_id: string;
          event_type: string;
          title: string;
          body?: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          event_type?: string;
          title?: string;
          body?: string;
          metadata?: Json;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      decision_category: DecisionCategory;
      decision_status: DecisionStatus;
      decision_stakes: DecisionStakes;
      pro_con_kind: ProConKind;
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Decision = Database["public"]["Tables"]["decisions"]["Row"];
export type DecisionInsert = Database["public"]["Tables"]["decisions"]["Insert"];
export type DecisionUpdate = Database["public"]["Tables"]["decisions"]["Update"];
export type DecisionOption =
  Database["public"]["Tables"]["decision_options"]["Row"];
export type DecisionOptionInsert =
  Database["public"]["Tables"]["decision_options"]["Insert"];
export type DecisionOptionProCon =
  Database["public"]["Tables"]["decision_option_pros_cons"]["Row"];
export type DecisionEvent =
  Database["public"]["Tables"]["decision_events"]["Row"];
