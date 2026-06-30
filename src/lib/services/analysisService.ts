import { supabase } from "@/lib/supabase";
import { saveCondition } from "./conditionService";

export async function fetchAnalysisData(masterId: string, startDate: string, endDate: string, tolerance: any = { pressure: 10, speed: 10, position: 10, time: 10, temperature: 10 }) {
  try {
    // 1. Fetch Master Condition Data
    const { data: masterRecord, error: masterError } = await supabase
      .from("condition_records")
      .select(`
        *,
        clamping_units(*),
        injection_units(*),
        temperature_units(*),
        cooling_units(*)
      `)
      .eq("id_code", masterId)
      .eq("type", "Master")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (masterError) throw new Error("Master record not found: " + masterError.message);

    // 2. Fetch Mass Production records in date range
    const { data: massRecords, error: massError } = await supabase
      .from("condition_records")
      .select(`
        id,
        clamping_units(*),
        injection_units(*),
        temperature_units(*),
        cooling_units(*)
      `)
      .eq("id_code", masterId)
      .eq("type", "Mass Production")
      .gte("date", startDate)
      .lte("date", endDate);

    if (massError) throw new Error(massError.message);

    // Helper to safely extract unit data (handling both object and array from Supabase)
    const extractUnit = (rel: any) => {
      if (!rel) return {};
      if (Array.isArray(rel)) return rel.length > 0 ? rel[0] : {};
      return rel;
    };

    const masterClamping = extractUnit(masterRecord.clamping_units);
    const masterInjection = extractUnit(masterRecord.injection_units);
    const masterCooling = extractUnit(masterRecord.cooling_units);
    const masterTemperature = extractUnit(masterRecord.temperature_units);

    // Calculate Averages from all records
    const averages = {
      mc_prs_1st: 0, count_prs1: 0,
      mc_prs_2nd: 0, count_prs2: 0,
      ij_spd_1st: 0, count_spd1: 0,
      cooling_time: 0, count_cool: 0
    };

    massRecords.forEach((record: any) => {
      const clamp = extractUnit(record.clamping_units);
      const inj = extractUnit(record.injection_units);
      const cool = extractUnit(record.cooling_units);

      if (clamp.mc_prs_1st !== null && clamp.mc_prs_1st !== undefined) { averages.mc_prs_1st += Number(clamp.mc_prs_1st); averages.count_prs1++; }
      if (clamp.mc_prs_2nd !== null && clamp.mc_prs_2nd !== undefined) { averages.mc_prs_2nd += Number(clamp.mc_prs_2nd); averages.count_prs2++; }
      if (inj.ij_spd_1st !== null && inj.ij_spd_1st !== undefined) { averages.ij_spd_1st += Number(inj.ij_spd_1st); averages.count_spd1++; }
      if (cool.cooling_time !== null && cool.cooling_time !== undefined) { averages.cooling_time += Number(cool.cooling_time); averages.count_cool++; }
    });

    const allResults = [
      { 
        param: "MOLD CLOSE 1st Pressure", 
        avg: averages.count_prs1 > 0 ? averages.mc_prs_1st / averages.count_prs1 : (masterClamping.mc_prs_1st || 0), 
        master: masterClamping.mc_prs_1st || 0 
      },
      { 
        param: "MOLD CLOSE 2nd Pressure", 
        avg: averages.count_prs2 > 0 ? averages.mc_prs_2nd / averages.count_prs2 : (masterClamping.mc_prs_2nd || 0), 
        master: masterClamping.mc_prs_2nd || 0 
      },
      { 
        param: "INJECTION 1st Speed", 
        avg: averages.count_spd1 > 0 ? averages.ij_spd_1st / averages.count_spd1 : (masterInjection.ij_spd_1st || 0), 
        master: masterInjection.ij_spd_1st || 0 
      },
      { 
        param: "COOLING TIME", 
        avg: averages.count_cool > 0 ? averages.cooling_time / averages.count_cool : (masterCooling.cooling_time || 0), 
        master: masterCooling.cooling_time || 0 
      },
    ];

    // Filter to show only parameters where difference exceeds tolerance
    const results = allResults.filter(r => {
      let tol = 0;
      if (r.param.includes("Pressure")) tol = tolerance.pressure;
      else if (r.param.includes("Speed")) tol = tolerance.speed;
      else if (r.param.includes("TIME")) tol = tolerance.time;
      else if (r.param.includes("Position")) tol = tolerance.position;
      
      return Math.abs(r.avg - r.master) > tol;
    });

    return { success: true, results, masterRecord };
  } catch (error: any) {
    console.error("Analysis Error:", error);
    return { success: false, error: error.message };
  }
}

export async function saveNewMasterFromAnalysis(masterRecord: any, updatedResults: any[]) {
  try {
    // We clone the old master record to create a new one (Versioning)
    const newHeader = {
      ...masterRecord,
      id: undefined, // Let DB generate new UUID
      created_at: undefined,
      updated_at: undefined,
      type: "Master",
      idCode: masterRecord.id_code,
      mcNo: masterRecord.mc_no,
      partName: masterRecord.part_name,
      partCode: masterRecord.part_code,
      mcTon: masterRecord.mc_ton,
      partWeight: masterRecord.part_weight,
      rnWeight: masterRecord.rn_weight,
      cycleTime: masterRecord.cycle_time,
      matl1: masterRecord.matl1,
      matl2: masterRecord.matl2,
      matl3: masterRecord.matl3,
      grade: masterRecord.grade,
      colorNo: masterRecord.color_no,
    };

    // Helper to extract
    const extractUnit = (rel: any) => {
      if (!rel) return {};
      if (Array.isArray(rel)) return rel.length > 0 ? rel[0] : {};
      return rel;
    };

    // Prepare updated units based on UI inputs
    const clamping = extractUnit(masterRecord.clamping_units);
    const injection = extractUnit(masterRecord.injection_units);
    const cooling = extractUnit(masterRecord.cooling_units);
    const temperature = extractUnit(masterRecord.temperature_units);

    // Map the updated results array back to the specific fields
    updatedResults.forEach(res => {
      if (res.param === "MOLD CLOSE 1st Pressure") clamping.mc_prs_1st = res.master;
      if (res.param === "MOLD CLOSE 2nd Pressure") clamping.mc_prs_2nd = res.master;
      if (res.param === "INJECTION 1st Speed") injection.ij_spd_1st = res.master;
      if (res.param === "COOLING TIME") cooling.cooling_time = res.master;
    });

    const payload = {
      header: newHeader,
      clamping,
      injection,
      cooling,
      temperature
    };

    const res = await saveCondition(payload);
    return res;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
