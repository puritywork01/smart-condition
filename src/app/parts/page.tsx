"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchParts, savePart, deletePart, upsertParts } from "@/lib/services/partService";
import { Database, Plus, ArrowLeft, Search, Edit2, Trash2, X, Upload, Download, FileSpreadsheet } from "lucide-react";
import Link from "next/link";
import styles from "./page.module.css";
import * as XLSX from "xlsx";

const mapExcelToPart = (row: any) => {
  const getValue = (keys: string[]) => {
    for (const key of Object.keys(row)) {
      const cleanedKey = key.trim().toLowerCase().replace(/[\s_-]/g, "");
      if (keys.some(k => k.trim().toLowerCase().replace(/[\s_-]/g, "") === cleanedKey)) {
        return row[key];
      }
    }
    return undefined;
  };

  const getFloat = (keys: string[]) => {
    const val = getValue(keys);
    if (val === undefined || val === null || val === "") return null;
    const num = parseFloat(val);
    return isNaN(num) ? null : num;
  };

  const getInt = (keys: string[]) => {
    const val = getValue(keys);
    if (val === undefined || val === null || val === "") return null;
    const num = parseInt(val);
    return isNaN(num) ? null : num;
  };

  return {
    id_code: getValue(["id_code", "idcode", "id code", "ไอดีโค้ด", "id"])?.toString() || "",
    part_code: getValue(["part_code", "partcode", "part code", "รหัสชิ้นงาน", "partno", "part no"])?.toString() || "",
    part_name: getValue(["part_name", "partname", "part name", "ชื่อชิ้นงาน", "description"])?.toString() || "",
    mc_ton: getFloat(["mc_ton", "mcton", "mc ton", "เครื่อง", "ขนาดเครื่อง", "ton", "mc"]),
    cycle_time: getFloat(["cycle_time", "cycletime", "cycle time", "ct", "รอบเวลา", "c/t"]),
    cavity: getInt(["cavity", "cavities", "จำนวนคาวิที", "cav"]),
    part_weight: getFloat(["part_weight", "partweight", "part weight", "part w", "น้ำหนักชิ้นงาน", "partwt"]),
    rn_weight: getFloat(["rn_weight", "rnweight", "runner weight", "rn w", "น้ำหนักรันเนอร์", "runnerwt", "rnwt"]),
    matl1: getValue(["matl1", "material1", "วัตถุดิบ 1", "matl 1", "mat 1"])?.toString() || "",
    grade1: getValue(["grade1", "วัตถุดิบเกรด 1", "grade 1", "grd 1"])?.toString() || "",
    color1: getValue(["color1", "สีวัตถุดิบ 1", "color 1", "col 1"])?.toString() || "",
    matl2: getValue(["matl2", "material2", "วัตถุดิบ 2", "matl 2", "mat 2"])?.toString() || "",
    grade2: getValue(["grade2", "วัตถุดิบเกรด 2", "grade 2", "grd 2"])?.toString() || "",
    color2: getValue(["color2", "สีวัตถุดิบ 2", "color 2", "col 2"])?.toString() || "",
    matl3: getValue(["matl3", "material3", "วัตถุดิบ 3", "matl 3", "mat 3"])?.toString() || "",
    grade3: getValue(["grade3", "วัตถุดิบเกรด 3", "grade 3", "grd 3"])?.toString() || "",
    color3: getValue(["color3", "สีวัตถุดิบ 3", "color 3", "col 3"])?.toString() || "",
  };
};


const initialForm = {
  id_code: "",
  part_code: "",
  part_name: "",
  matl1: "",
  grade1: "",
  color1: "",
  matl2: "",
  grade2: "",
  color2: "",
  matl3: "",
  grade3: "",
  color3: "",
  part_weight: "",
  rn_weight: "",
  cycle_time: "",
  mc_ton: "",
  cavity: ""
};

export default function PartsPage() {
  const { user } = useAuth();
  const [parts, setParts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>(initialForm);

  // Excel Import states
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState<any[]>([]);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImportingInProgress, setIsImportingInProgress] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const templateData = [
      {
        "ID Code": "P-001",
        "Part Code": "PC-1001",
        "Part Name": "Cover Plate",
        "M/C Ton": 120,
        "Cycle Time": 15.5,
        "Cavity": 2,
        "Part Weight": 45.2,
        "R/N Weight": 5.4,
        "MATL 1": "PP",
        "Grade 1": "H100",
        "Color 1": "Red",
        "MATL 2": "ABS",
        "Grade 2": "G300",
        "Color 2": "Black",
        "MATL 3": "",
        "Grade 3": "",
        "Color 3": ""
      },
      {
        "ID Code": "P-002",
        "Part Code": "PC-1002",
        "Part Name": "Base Plate",
        "M/C Ton": 180,
        "Cycle Time": 22.0,
        "Cavity": 4,
        "Part Weight": 80.5,
        "R/N Weight": 10.2,
        "MATL 1": "PC",
        "Grade 1": "L1250",
        "Color 1": "Clear",
        "MATL 2": "",
        "Grade 2": "",
        "Color 2": "",
        "MATL 3": "",
        "Grade 3": "",
        "Color 3": ""
      }
    ];
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Part Master Template");
    XLSX.writeFile(workbook, "part_master_template.xlsx");
  };

  const handleExcelImportClick = () => {
    setImportData([]);
    setImportFile(null);
    setShowImportModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawRows = XLSX.utils.sheet_to_json(ws);
        
        const mappedRows = rawRows.map((row: any) => {
          const mapped = mapExcelToPart(row);
          return {
            ...mapped,
            isValid: !!mapped.id_code && mapped.id_code.trim() !== "",
            raw: row
          };
        });

        setImportData(mappedRows);
      } catch (err: any) {
        alert("ไม่สามารถอ่านไฟล์ Excel ได้: " + err.message);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleConfirmImport = async () => {
    const validRows = importData.filter(r => r.isValid).map(({ isValid, raw, ...rest }) => rest);
    
    if (validRows.length === 0) {
      alert("ไม่มีข้อมูลที่สามารถนำเข้าได้ (กรุณาใส่ข้อมูล ID Code ให้ครบถ้วน)");
      return;
    }

    if (confirm(`คุณต้องการนำเข้าข้อมูลจำนวน ${validRows.length} แถว ใช่หรือไม่? (ข้อมูลที่ ID Code ซ้ำจะถูกเขียนทับด้วยข้อมูลใหม่)`)) {
      setIsImportingInProgress(true);
      const res = await upsertParts(validRows);
      setIsImportingInProgress(false);
      
      if (res.success) {
        alert("นำเข้าข้อมูลจาก Excel สำเร็จแล้ว!");
        setShowImportModal(false);
        loadParts();
      } else {
        alert("เกิดข้อผิดพลาดในการนำเข้าข้อมูล: " + res.error);
      }
    }
  };

  const loadParts = async () => {
    setLoading(true);
    const res = await fetchParts();
    if (res.success && res.parts) {
      setParts(res.parts);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user && (user.role === "Admin" || user.role === "Manager")) {
      loadParts();
    }
  }, [user]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredParts = parts.filter(p => 
    p.id_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.part_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.part_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setFormData(initialForm);
    setIsEditing(false);
    setShowModal(true);
  };

  const handleOpenEdit = (part: any) => {
    setFormData(part);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id: string, idCode: string) => {
    if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบชิ้นงาน ${idCode}?`)) {
      const res = await deletePart(id);
      if (res.success) {
        alert("ลบข้อมูลสำเร็จ");
        loadParts();
      } else {
        alert("ลบข้อมูลไม่สำเร็จ: " + res.error);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id_code) {
      alert("กรุณากรอก ID Code");
      return;
    }
    const res = await savePart(formData, !isEditing);
    if (res.success) {
      alert("บันทึกข้อมูลสำเร็จ");
      setShowModal(false);
      loadParts();
    } else {
      alert("เกิดข้อผิดพลาด: " + res.error);
    }
  };

  if (!user || (user.role !== "Admin" && user.role !== "Manager")) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Access Denied. Only Admins or Managers can view this page.</div>;
  }

  return (
    <div className={`${styles.container} gradient-bg`} style={{ minHeight: '100vh', padding: '2rem' }}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <Database size={32} />
          ฐานข้อมูลชิ้นงาน (Part Master)
        </h1>
        <Link href="/" className={styles.backBtn}>
          <ArrowLeft size={20} /> กลับหน้าหลัก
        </Link>
      </div>

      <div className={styles.card}>
        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <Search size={20} color="#9ca3af" />
            <input 
              type="text" 
              placeholder="ค้นหา ID Code, Part Code หรือ Part Name..." 
              className={styles.searchInput}
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className={styles.importBtn} onClick={handleExcelImportClick}>
              <Upload size={20} /> นำเข้าจาก Excel
            </button>
            <button className={styles.addBtn} onClick={handleOpenAdd}>
              <Plus size={20} /> เพิ่มชิ้นงานใหม่
            </button>
          </div>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID Code</th>
                  <th>Part Code</th>
                  <th>Part Name</th>
                  <th>M/C Ton</th>
                  <th>C/T</th>
                  <th>Part W.</th>
                  <th>R/N W.</th>
                  <th>Mat'l 1</th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredParts.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 'bold' }}>{p.id_code}</td>
                    <td>{p.part_code}</td>
                    <td>{p.part_name}</td>
                    <td>{p.mc_ton}</td>
                    <td>{p.cycle_time}</td>
                    <td>{p.part_weight}</td>
                    <td>{p.rn_weight}</td>
                    <td>{p.matl1} {p.grade1}</td>
                    <td>
                      <button className={styles.actionBtn} onClick={() => handleOpenEdit(p)} style={{ color: '#3b82f6', marginRight: '0.5rem' }}>
                        <Edit2 size={18} />
                      </button>
                      {user.role === "Admin" && (
                        <button className={styles.actionBtn} onClick={() => handleDelete(p.id, p.id_code)} style={{ color: '#ef4444' }}>
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredParts.length === 0 && (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>ไม่พบข้อมูลชิ้นงาน</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setShowModal(false)}>
              <X size={24} />
            </button>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'var(--primary)' }}>
              {isEditing ? `แก้ไขชิ้นงาน: ${formData.id_code}` : 'เพิ่มชิ้นงานใหม่'}
            </h2>

            <form onSubmit={handleSave}>
              <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.25rem' }}>ข้อมูลทั่วไป</h3>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>ID Code *</label>
                  <input type="text" name="id_code" required className={styles.input} value={formData.id_code} onChange={handleChange} disabled={isEditing} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Part Code</label>
                  <input type="text" name="part_code" className={styles.input} value={formData.part_code || ""} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Part Name</label>
                  <input type="text" name="part_name" className={styles.input} value={formData.part_name || ""} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>M/C Ton</label>
                  <input type="number" name="mc_ton" className={styles.input} value={formData.mc_ton || ""} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>C/T (sec)</label>
                  <input type="number" name="cycle_time" step="0.1" className={styles.input} value={formData.cycle_time || ""} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Cavity</label>
                  <input type="number" name="cavity" className={styles.input} value={formData.cavity || ""} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Part Weight (g)</label>
                  <input type="number" name="part_weight" step="0.1" className={styles.input} value={formData.part_weight || ""} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>R/N Weight (g)</label>
                  <input type="number" name="rn_weight" step="0.1" className={styles.input} value={formData.rn_weight || ""} onChange={handleChange} />
                </div>
              </div>

              <h3 style={{ fontSize: '1rem', fontWeight: 'bold', margin: '1.5rem 0 0.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.25rem' }}>ข้อมูล Material</h3>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>MAT'L 1</label>
                  <input type="text" name="matl1" className={styles.input} value={formData.matl1 || ""} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Grade 1</label>
                  <input type="text" name="grade1" className={styles.input} value={formData.grade1 || ""} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Color 1</label>
                  <input type="text" name="color1" className={styles.input} value={formData.color1 || ""} onChange={handleChange} />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>MAT'L 2</label>
                  <input type="text" name="matl2" className={styles.input} value={formData.matl2 || ""} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Grade 2</label>
                  <input type="text" name="grade2" className={styles.input} value={formData.grade2 || ""} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Color 2</label>
                  <input type="text" name="color2" className={styles.input} value={formData.color2 || ""} onChange={handleChange} />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>MAT'L 3</label>
                  <input type="text" name="matl3" className={styles.input} value={formData.matl3 || ""} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Grade 3</label>
                  <input type="text" name="grade3" className={styles.input} value={formData.grade3 || ""} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Color 3</label>
                  <input type="text" name="color3" className={styles.input} value={formData.color3 || ""} onChange={handleChange} />
                </div>
              </div>

              <button type="submit" className={styles.saveBtn}>บันทึกข้อมูล</button>
            </form>
          </div>
        </div>
      )}

      {/* Import Excel Modal */}
      {showImportModal && (
        <div className={styles.modalOverlay} onClick={() => setShowImportModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()} style={{ maxWidth: '900px' }}>
            <button className={styles.closeBtn} onClick={() => setShowImportModal(false)}>
              <X size={24} />
            </button>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileSpreadsheet size={24} color="#10b981" />
              นำเข้าข้อมูลชิ้นงานจาก Excel
            </h2>

            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
              กรุณาอัปโหลดไฟล์ Excel (.xlsx หรือ .xls) ระบบจะตรวจสอบคอลัมน์และข้อมูลโดยอัตโนมัติ 
              (หาก ID Code ซ้ำ ข้อมูลในระบบเดิมจะถูกแทนที่ด้วยข้อมูลใหม่)
            </p>

            <button className={styles.templateBtn} onClick={downloadTemplate}>
              <Download size={18} /> ดาวน์โหลดเทมเพลต Excel
            </button>

            <div className={styles.dropZone} onClick={() => fileInputRef.current?.click()}>
              <Upload size={36} color="#9ca3af" style={{ margin: '0 auto 0.5rem' }} />
              <p style={{ fontWeight: '500', color: '#374151' }}>
                {importFile ? `เลือกไฟล์แล้ว: ${importFile.name}` : "คลิกเพื่อเลือกไฟล์ Excel ที่ต้องการอัปโหลด"}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                รองรับไฟล์นามสกุล .xlsx และ .xls
              </p>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".xlsx, .xls" 
                style={{ display: 'none' }} 
              />
            </div>

            {importData.length > 0 && (
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>พรีวิวข้อมูลที่จะนำเข้า</h3>
                
                <div className={styles.validationSummary}>
                  <div>แถวทั้งหมด: <strong>{importData.length}</strong></div>
                  <div>พร้อมนำเข้า: <strong className={styles.statusSuccess}>{importData.filter(r => r.isValid).length}</strong></div>
                  {importData.some(r => !r.isValid) && (
                    <div>ข้อมูลไม่สมบูรณ์ (ไม่มี ID Code): <strong className={styles.statusError}>{importData.filter(r => !r.isValid).length}</strong></div>
                  )}
                </div>

                <div className={styles.previewTableWrapper}>
                  <table className={styles.previewTable}>
                    <thead>
                      <tr>
                        <th>สถานะ</th>
                        <th>ID Code</th>
                        <th>Part Code</th>
                        <th>Part Name</th>
                        <th>M/C Ton</th>
                        <th>Cycle Time</th>
                        <th>Cavity</th>
                        <th>Part Weight</th>
                        <th>MAT'L 1</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importData.map((row, index) => (
                        <tr key={index} style={!row.isValid ? { backgroundColor: '#fef2f2' } : {}}>
                          <td>
                            {row.isValid ? (
                              <span className={styles.statusSuccess} style={{ fontSize: '0.75rem' }}>OK</span>
                            ) : (
                              <span className={styles.statusError} style={{ fontSize: '0.75rem' }}>Error</span>
                            )}
                          </td>
                          <td style={{ fontWeight: 'bold' }}>{row.id_code || <span style={{ color: '#dc2626', fontSize: '0.75rem' }}>ไม่มี ID Code</span>}</td>
                          <td>{row.part_code || "-"}</td>
                          <td>{row.part_name || "-"}</td>
                          <td>{row.mc_ton || "-"}</td>
                          <td>{row.cycle_time || "-"}</td>
                          <td>{row.cavity || "-"}</td>
                          <td>{row.part_weight || "-"}</td>
                          <td>{row.matl1 || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setShowImportModal(false)}>
                ยกเลิก
              </button>
              <button 
                className={styles.confirmBtn} 
                onClick={handleConfirmImport} 
                disabled={isImportingInProgress || importData.length === 0}
                style={(isImportingInProgress || importData.length === 0) ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
              >
                {isImportingInProgress ? "กำลังบันทึก..." : `ยืนยันนำเข้าข้อมูล (${importData.filter(r => r.isValid).length})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
