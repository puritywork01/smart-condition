import { supabase } from "@/lib/supabase";

export async function fetchParts() {
  try {
    const { data, error } = await supabase
      .from("part_master")
      .select("*")
      .order("id_code", { ascending: true });

    if (error) throw new Error(error.message);
    return { success: true, parts: data };
  } catch (error: any) {
    console.error("Fetch Parts Error:", error);
    return { success: false, error: error.message };
  }
}

export async function getPartByIdCode(idCode: string) {
  try {
    const { data, error } = await supabase
      .from("part_master")
      .select("*")
      .eq("id_code", idCode)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return { success: true, data: null };
      }
      throw new Error(error.message);
    }
    return { success: true, data };
  } catch (error: any) {
    console.error("Get Part Error:", error);
    return { success: false, error: error.message };
  }
}

export async function savePart(part: any, isNew: boolean) {
  try {
    if (isNew) {
      const { data, error } = await supabase
        .from("part_master")
        .insert(part)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return { success: true, data };
    } else {
      const { id, created_at, updated_at, ...updateData } = part;
      const { data, error } = await supabase
        .from("part_master")
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return { success: true, data };
    }
  } catch (error: any) {
    console.error("Save Part Error:", error);
    return { success: false, error: error.message };
  }
}

export async function deletePart(id: string) {
  try {
    const { error } = await supabase
      .from("part_master")
      .delete()
      .eq("id", id);
    
    if (error) throw new Error(error.message);
    return { success: true };
  } catch (error: any) {
    console.error("Delete Part Error:", error);
    return { success: false, error: error.message };
  }
}

export async function upsertParts(parts: any[]) {
  try {
    const { data, error } = await supabase
      .from("part_master")
      .upsert(parts, { onConflict: "id_code" })
      .select();

    if (error) throw new Error(error.message);
    return { success: true, data };
  } catch (error: any) {
    console.error("Upsert Parts Error:", error);
    return { success: false, error: error.message };
  }
}
