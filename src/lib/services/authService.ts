import { supabase } from "@/lib/supabase";
import { User, Role } from "@/contexts/AuthContext";

export async function loginUser(username: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const { data, error } = await supabase
      .from("app_users")
      .select("*")
      .eq("username", username)
      .eq("password", password)
      .single();

    if (error || !data) {
      return { success: false, error: "Invalid username or password" };
    }

    const user: User = {
      id: data.id,
      username: data.username,
      role: data.role as Role,
      permissions: data.permissions || [],
    };

    return { success: true, user };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function fetchUsers(): Promise<{ success: boolean; users?: any[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from("app_users")
      .select("id, username, role, permissions, created_at")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return { success: true, users: data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateUserPermissions(id: string, permissions: string[]): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("app_users")
      .update({ permissions })
      .eq("id", id);

    if (error) throw new Error(error.message);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function createUser(username: string, password: string, role: string, permissions: string[]): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("app_users")
      .insert([{ username, password, role, permissions }]);

    if (error) throw new Error(error.message);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateUserPassword(id: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("app_users")
      .update({ password })
      .eq("id", id);

    if (error) throw new Error(error.message);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
