import { supabase } from "./supabase";

export interface Invite {
  id: number;
  token: string;
  expires_at: string; // ISO
  used: boolean;
  used_at?: string;
  created_at: string;
  created_by?: number;
}

const generateToken = (): string => {
  if (typeof crypto !== "undefined" && (crypto as any).randomUUID) {
    // UUID v4 then base64url-like cleanup
    return (crypto as any).randomUUID().replace(/-/g, "");
  }
  // Fallback simple random
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
};

export const inviteService = {
  async createInvite(expireInMinutes = 15) {
    const token = generateToken();
    const expiresAt = new Date(Date.now() + expireInMinutes * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from("invites")
      .insert([{ token, expires_at: expiresAt, used: false }])
      .select()
      .single();

    if (error) throw error;
    return data as Invite;
  },

  async validateInvite(token: string) {
    const { data, error } = await supabase
      .from("invites")
      .select("*")
      .eq("token", token)
      .single();

    if (error) throw error;
    const now = Date.now();
    const valid = !!data && !data.used && new Date(data.expires_at).getTime() > now;
    return { valid, invite: data as Invite | null };
  },

  async consumeInvite(token: string, usedByUserId?: number) {
    const updates: any = { used: true, used_at: new Date().toISOString() };
    if (usedByUserId) updates.used_by = usedByUserId;

    const { data, error } = await supabase
      .from("invites")
      .update(updates)
      .eq("token", token)
      .eq("used", false)
      .select()
      .single();

    if (error) throw error;
    return data as Invite;
  },
};

