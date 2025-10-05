import { supabase } from "./supabase";

export type FulfillmentStage =
  | "new_signup"
  | "tag_writing"
  | "packed"
  | "out_for_delivery"
  | "delivered";

export interface FulfillmentTask {
  id: number;
  user_id: number;
  name: string;
  email: string;
  phone?: string | null;
  pet_name?: string | null;
  pet_username?: string | null;
  stage: FulfillmentStage;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export const fulfillmentService = {
  async listTasks() {
    const { data, error } = await supabase
      .from("fulfillment_tasks")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []) as FulfillmentTask[];
  },

  async createTask(task: {
    user_id: number;
    name: string;
    email: string;
    phone?: string;
    pet_name?: string;
    pet_username?: string;
    stage?: FulfillmentStage;
    notes?: string;
  }) {
    const payload = {
      ...task,
      stage: task.stage || "new_signup",
    };
    const { data, error } = await supabase
      .from("fulfillment_tasks")
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    return data as FulfillmentTask;
  },

  async updateTask(id: number, updates: Partial<FulfillmentTask>) {
    const { data, error } = await supabase
      .from("fulfillment_tasks")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as FulfillmentTask;
  },

  async updateStage(id: number, stage: FulfillmentStage) {
    return this.updateTask(id, { stage } as Partial<FulfillmentTask>);
  },
};

