import { supabase } from "@/lib/supabase";

export async function saveCondition(payload: any) {
  try {
    const { header, clamping, injection, temperature, cooling } = payload;
    
    // 1. Insert header to condition_records
    const { data: record, error: recordError } = await supabase
      .from("condition_records")
      .insert({
        type: header.type,
        is_active_master: header.type === "Master" ? true : false,
        date: header.date,
        id_code: header.idCode,
        mc_no: header.mcNo,
        part_name: header.partName,
        part_code: header.partCode,
        mc_ton: header.mcTon,
        part_weight: header.partWeight ? parseFloat(header.partWeight) : null,
        rn_weight: header.rnWeight ? parseFloat(header.rnWeight) : null,
        cycle_time: header.cycleTime ? parseFloat(header.cycleTime) : null,
        matl1: header.matl1,
        matl2: header.matl2,
        matl3: header.matl3,
        grade: header.grade,
        color_no: header.colorNo,
      })
      .select()
      .single();

    if (recordError) throw new Error(recordError.message);
    const recordId = record.id;

    // Helper to strip out existing primary keys before inserting as new record
    const cleanSubUnit = (data: any, recId: string) => {
      if (!data) return { record_id: recId };
      const { id, created_at, updated_at, record_id, ...rest } = data;
      return { ...rest, record_id: recId };
    };

    // 2. Insert sub-units (spreading actual payload data)
    const clampDataToInsert = cleanSubUnit(clamping, recordId);
    const injDataToInsert = cleanSubUnit(injection, recordId);
    const tempDataToInsert = cleanSubUnit(temperature, recordId);
    const coolDataToInsert = cleanSubUnit(cooling, recordId);

    const { error: e1 } = await supabase.from("clamping_units").insert(clampDataToInsert);
    if (e1) throw new Error("Clamping Insert Error: " + e1.message);

    const { error: e2 } = await supabase.from("injection_units").insert(injDataToInsert);
    if (e2) throw new Error("Injection Insert Error: " + e2.message);

    const { error: e3 } = await supabase.from("temperature_units").insert(tempDataToInsert);
    if (e3) throw new Error("Temperature Insert Error: " + e3.message);

    const { error: e4 } = await supabase.from("cooling_units").insert(coolDataToInsert);
    if (e4) throw new Error("Cooling Insert Error: " + e4.message);

    // If it's a new Master, deactivate other masters for this ID Code / MC No
    if (header.type === "Master") {
      await supabase
        .from("condition_records")
        .update({ is_active_master: false })
        .eq("id_code", header.idCode)
        .neq("id", recordId);
    }

    return { success: true, data: record };
  } catch (error: any) {
    console.error("Save Error:", error);
    return { success: false, error: error.message };
  }
}

export async function getConditionById(id: string) {
  try {
    const { data, error } = await supabase
      .from("condition_records")
      .select(`
        *,
        clamping_units(*),
        injection_units(*),
        temperature_units(*),
        cooling_units(*)
      `)
      .eq("id", id)
      .single();

    if (error) throw new Error(error.message);

    return { success: true, data };
  } catch (error: any) {
    console.error("Fetch Error:", error);
    return { success: false, error: error.message };
  }
}
