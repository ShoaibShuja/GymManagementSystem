export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AppRole = "admin" | "staff";
export type MemberStatus = "active" | "inactive" | "expired";
export type TrainerStatus = "active" | "inactive";
export type PaymentStatus = "paid" | "unpaid";

type PublicTable<Row, Insert, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: PublicTable<
        {
          id: string;
          role: AppRole;
          full_name: string;
          created_at: string;
        },
        {
          id: string;
          role?: AppRole;
          full_name: string;
          created_at?: string;
        },
        {
          id?: string;
          role?: AppRole;
          full_name?: string;
          created_at?: string;
        }
      >;
      membership_plans: PublicTable<
        {
          id: string;
          name: string;
          duration_months: number;
          price: number;
          is_active: boolean;
          created_at: string;
        },
        {
          id?: string;
          name: string;
          duration_months: number;
          price: number;
          is_active?: boolean;
          created_at?: string;
        }
      >;
      members: PublicTable<
        {
          id: string;
          name: string;
          phone: string;
          email: string | null;
          address: string | null;
          join_date: string;
          status: MemberStatus;
          membership_plan_id: string | null;
          membership_start_date: string;
          membership_end_date: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          name: string;
          phone: string;
          email?: string | null;
          address?: string | null;
          join_date?: string;
          status?: MemberStatus;
          membership_plan_id?: string | null;
          membership_start_date?: string;
          membership_end_date: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      trainers: PublicTable<
        {
          id: string;
          name: string;
          phone: string | null;
          specialty: string | null;
          status: TrainerStatus;
          notes: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          name: string;
          phone?: string | null;
          specialty?: string | null;
          status?: TrainerStatus;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      trainer_member_assignments: PublicTable<
        {
          id: string;
          trainer_id: string;
          member_id: string;
          assigned_at: string;
        },
        {
          id?: string;
          trainer_id: string;
          member_id: string;
          assigned_at?: string;
        }
      >;
      payments: PublicTable<
        {
          id: string;
          member_id: string;
          membership_plan_id: string | null;
          amount: number;
          payment_month: string;
          payment_date: string | null;
          status: PaymentStatus;
          notes: string | null;
          recorded_by: string | null;
          created_at: string;
        },
        {
          id?: string;
          member_id: string;
          membership_plan_id?: string | null;
          amount: number;
          payment_month: string;
          payment_date?: string | null;
          status?: PaymentStatus;
          notes?: string | null;
          recorded_by?: string | null;
          created_at?: string;
        }
      >;
      attendance_logs: PublicTable<
        {
          id: string;
          member_id: string;
          check_in_time: string;
          recorded_by: string | null;
          notes: string | null;
        },
        {
          id?: string;
          member_id: string;
          check_in_time?: string;
          recorded_by?: string | null;
          notes?: string | null;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: {
      current_profile_role: {
        Args: Record<string, never>;
        Returns: AppRole | null;
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_staff_or_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
