"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchParts, savePart, deletePart } from "@/lib/services/partService";
import { Database, Plus, ArrowLeft, Search, Edit2, Trash2, X } from "lucide-react";
import Link from "next/link";
import styles from "./page.module.css";

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
          <button className={styles.addBtn} onClick={handleOpenAdd}>
            <Plus size={20} /> เพิ่มชิ้นงานใหม่
          </button>
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
    </div>
  );
}
