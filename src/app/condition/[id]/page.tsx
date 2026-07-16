"use client";

import { useEffect, useState, use, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, ChevronRight, CheckCircle2, FileDown, Search } from "lucide-react";
import { pdf } from '@react-pdf/renderer';
import styles from "./page.module.css";
import { saveCondition, getConditionById } from "@/lib/services/conditionService";
import { getPartByIdCode } from "@/lib/services/partService";
import { supabase } from "@/lib/supabase";

import ClampingUnitModal from "@/components/ClampingUnitModal";
import InjectionUnitModal from "@/components/InjectionUnitModal";
import TemperatureUnitModal from "@/components/TemperatureUnitModal";
import CoolingUnitModal from "@/components/CoolingUnitModal";
import ParameterSheetPdf from "@/components/ParameterSheetPdf";
import { useAuth } from "@/contexts/AuthContext";

export default function ConditionPage({ params }: { params: Promise<{ id: string }> }) {
  const { hasPermission } = useAuth();
  const router = useRouter();
  const resolvedParams = use(params);
  const isNew = resolvedParams.id === "new";
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    idCode: "",
    mcNo: "",
    partName: "",
    partCode: "",
    mcTon: "",
    partWeight: "",
    rnWeight: "",
    cycleTime: "",
    matl1: "",
    grade1: "",
    color1: "",
    matl2: "",
    grade2: "",
    color2: "",
    matl3: "",
    grade3: "",
    color3: ""
  });

  // States for sub-units (simplified to avoid huge boilerplate, using any for now)
  const [clampingData, setClampingData] = useState<any>({});
  const [injectionData, setInjectionData] = useState<any>({});
  const [temperatureData, setTemperatureData] = useState<any>({});
  const [coolingData, setCoolingData] = useState<any>({});

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(!isNew);
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isNew) return;

    const loadData = async () => {
      setIsLoading(true);
      const res = await getConditionById(resolvedParams.id);
      if (res.success && res.data) {
        const d = res.data;
        setFormData({
          date: d.date || "",
          idCode: d.id_code || "",
          mcNo: d.mc_no || "",
          partName: d.part_name || "",
          partCode: d.part_code || "",
          mcTon: d.mc_ton || "",
          partWeight: d.part_weight?.toString() || "",
          rnWeight: d.rn_weight?.toString() || "",
          cycleTime: d.cycle_time?.toString() || "",
          matl1: d.matl1 || "",
          grade1: d.grade1 || "",
          color1: d.color1 || "",
          matl2: d.matl2 || "",
          grade2: d.grade2 || "",
          color2: d.color2 || "",
          matl3: d.matl3 || "",
          grade3: d.grade3 || "",
          color3: d.color3 || ""
        });
        
        const extractData = (rel: any) => {
          if (!rel) return {};
          if (Array.isArray(rel)) return rel.length > 0 ? rel[0] : {};
          return rel;
        };

        setClampingData(extractData(d.clamping_units));
        setInjectionData(extractData(d.injection_units));
        setTemperatureData(extractData(d.temperature_units));
        setCoolingData(extractData(d.cooling_units));
      } else {
        alert("Failed to load condition details: " + res.error);
      }
      setIsLoading(false);
    };

    loadData();
  }, [isNew, resolvedParams.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSearchPart = async () => {
    if (!formData.idCode) {
      alert("กรุณากรอก ID Code ก่อนค้นหา");
      return;
    }
    setIsLoading(true);
    const res = await getPartByIdCode(formData.idCode);
    if (res.success && res.data) {
      const p = res.data;
      setFormData(prev => ({
        ...prev,
        partCode: p.part_code || "",
        partName: p.part_name || "",
        matl1: p.matl1 || "",
        grade1: p.grade1 || "",
        color1: p.color1 || "",
        matl2: p.matl2 || "",
        grade2: p.grade2 || "",
        color2: p.color2 || "",
        matl3: p.matl3 || "",
        grade3: p.grade3 || "",
        color3: p.color3 || "",
        partWeight: p.part_weight?.toString() || prev.partWeight,
        rnWeight: p.rn_weight?.toString() || prev.rnWeight,
        cycleTime: p.cycle_time?.toString() || prev.cycleTime,
        mcTon: p.mc_ton?.toString() || prev.mcTon,
      }));
    } else {
      alert("ไม่พบข้อมูลชิ้นงาน (ID Code) นี้ในระบบ Part Master");
    }
    setIsLoading(false);
  };

  const handleSave = async (type: "Mass Production" | "Master") => {
    try {
      setIsSaving(true);
      const payload = {
        header: { ...formData, type },
        clamping: clampingData,
        injection: injectionData,
        temperature: temperatureData,
        cooling: coolingData
      };
      
      const res = await saveCondition(payload);
      if (res.success) {
        alert(`บันทึกข้อมูล ${type} Condition สำเร็จ!`);
        router.push('/');
      } else {
        alert(`เกิดข้อผิดพลาด: ${res.error}`);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!hasPermission("delete")) {
      alert("คุณไม่มีสิทธิ์ลบข้อมูล");
      return;
    }
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบ Condition นี้? การกระทำนี้ไม่สามารถย้อนกลับได้")) {
      try {
        setIsSaving(true);
        const { error } = await supabase.from("condition_records").delete().eq("id", resolvedParams.id);
        if (error) throw error;
        alert("ลบข้อมูลสำเร็จ");
        router.push("/");
      } catch (error: any) {
        alert("ลบข้อมูลไม่สำเร็จ: " + error.message);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      
      const blob = await pdf(
        <ParameterSheetPdf 
          data={formData} 
          clamping={clampingData} 
          injection={injectionData} 
          temperature={temperatureData} 
          cooling={coolingData} 
        />
      ).toBlob();

      const filename = `Condition_${formData.idCode || 'Export'}.pdf`;
      const file = new File([blob], filename, { type: 'application/pdf' });

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      // Web Share API for Mobile Devices (iOS Safari, Line, Chrome Mobile etc.)
      if (isMobile && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: filename,
            text: `ดาวน์โหลด PDF สำหรับ ${formData.idCode || 'Condition'}`,
          });
          return;
        } catch (shareError: any) {
          console.error("Web Share failed, using fallback:", shareError);
        }
      }

      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);
      
    } catch (error: any) {
      alert("Export failed: " + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={`${styles.container} gradient-bg ${styles.noPrint}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>รายละเอียดการผลิต (Production Details)</h1>
        <div className="text-sm opacity-70">
          ID: {isNew ? "New Record" : resolvedParams.id}
        </div>
      </div>

      <div className={styles.formGrid}>
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>General Information</h2>
          <div className={styles.inputGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Date</label>
              <input type="date" name="date" className={styles.input} value={formData.date} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>ID Code</label>
              <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                <input type="text" name="idCode" className={styles.input} style={{ flex: 1, minWidth: 0 }} value={formData.idCode} onChange={handleChange} />
                <button type="button" onClick={handleSearchPart} style={{ padding: '0.5rem', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0 }} title="ดึงข้อมูลจาก Part Master">
                  <Search size={18} />
                </button>
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>M/C No.</label>
              <input type="text" name="mcNo" className={styles.input} value={formData.mcNo} onChange={handleChange} />
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Part Name</label>
              <input type="text" name="partName" className={styles.input} value={formData.partName} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Part Code</label>
              <input type="text" name="partCode" className={styles.input} value={formData.partCode} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>M/C (Ton)</label>
              <input type="text" name="mcTon" className={styles.input} value={formData.mcTon} onChange={handleChange} />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Part Weight (g)</label>
              <input type="number" name="partWeight" className={styles.input} value={formData.partWeight} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>R/N Weight (g)</label>
              <input type="number" name="rnWeight" className={styles.input} value={formData.rnWeight} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>C/T (sec)</label>
              <input type="number" name="cycleTime" className={styles.input} value={formData.cycleTime} onChange={handleChange} />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>MAT'L 1</label>
              <input type="text" name="matl1" className={styles.input} value={formData.matl1} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Grade 1</label>
              <input type="text" name="grade1" className={styles.input} value={formData.grade1} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Color 1</label>
              <input type="text" name="color1" className={styles.input} value={formData.color1} onChange={handleChange} />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>MAT'L 2</label>
              <input type="text" name="matl2" className={styles.input} value={formData.matl2} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Grade 2</label>
              <input type="text" name="grade2" className={styles.input} value={formData.grade2} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Color 2</label>
              <input type="text" name="color2" className={styles.input} value={formData.color2} onChange={handleChange} />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>MAT'L 3</label>
              <input type="text" name="matl3" className={styles.input} value={formData.matl3} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Grade 3</label>
              <input type="text" name="grade3" className={styles.input} value={formData.grade3} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Color 3</label>
              <input type="text" name="color3" className={styles.input} value={formData.color3} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div>
          <div className={styles.card} style={{ marginBottom: '2rem' }}>
            <h2 className={styles.sectionTitle}>Unit Configurations</h2>
            <div className={styles.unitButtonsContainer}>
              <button className={styles.unitBtn} onClick={() => setActiveModal('clamping')}>
                CLAMPING UNIT <ChevronRight size={20} />
              </button>
              <button className={styles.unitBtn} onClick={() => setActiveModal('injection')}>
                INJECTION UNIT <ChevronRight size={20} />
              </button>
              <button className={styles.unitBtn} onClick={() => setActiveModal('temperature')}>
                TEMPERATURE <ChevronRight size={20} />
              </button>
              <button className={styles.unitBtn} onClick={() => setActiveModal('cooling')}>
                COOLING <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className={styles.card}>
            <h2 className={styles.sectionTitle}>Actions</h2>
            <div className={styles.actionButtons}>
              {hasPermission("create_master") && (
                <button className={styles.btnSaveMaster} onClick={() => handleSave("Master")} disabled={isSaving}>
                  <CheckCircle2 size={20} />
                  {isSaving ? "Saving..." : "Save Standard (Master)"}
                </button>
              )}
              <button className={styles.btnSave} onClick={() => handleSave("Mass Production")} disabled={isSaving}>
                <Save size={20} />
                {isSaving ? "Saving..." : "Save Mass Production"}
              </button>
              {hasPermission("download_pdf") && (
                <button 
                  className={styles.btnBack} 
                  style={{ backgroundColor: '#f59e0b', color: 'white', border: 'none' }} 
                  onClick={handleExportPDF} 
                  disabled={isExporting}
                >
                  <FileDown size={20} />
                  {isExporting ? "Exporting..." : "Export PDF"}
                </button>
              )}
              {!isNew && hasPermission("delete") && (
                <button 
                  className={styles.btnBack} 
                  style={{ backgroundColor: '#ef4444', color: 'white', border: 'none' }} 
                  onClick={handleDelete} 
                  disabled={isSaving}
                >
                  <Save size={20} /> {/* Assuming we just use some icon or text */}
                  ลบข้อมูล (Delete)
                </button>
              )}
              <Link href="/" className={styles.btnBack}>
                <ArrowLeft size={20} />
                BACK TO HOMEPAGE
              </Link>
            </div>
          </div>
        </div>
      </div>



      <div className={styles.noPrint}>
        <ClampingUnitModal isOpen={activeModal === 'clamping'} onClose={() => setActiveModal(null)} data={clampingData} onChange={setClampingData} />
        <InjectionUnitModal isOpen={activeModal === 'injection'} onClose={() => setActiveModal(null)} data={injectionData} onChange={setInjectionData} />
        <TemperatureUnitModal isOpen={activeModal === 'temperature'} onClose={() => setActiveModal(null)} data={temperatureData} onChange={setTemperatureData} />
        <CoolingUnitModal isOpen={activeModal === 'cooling'} onClose={() => setActiveModal(null)} data={coolingData} onChange={setCoolingData} />
      </div>
    </div>
    </div>
  );
}
