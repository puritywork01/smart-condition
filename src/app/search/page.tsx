"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { Search, ArrowLeft, ChevronRight, Trash2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./page.module.css";

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";
  
  const [formData, setFormData] = useState({
    idCode: "",
    date: "",
    mcNo: "",
  });

  const [results, setResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { hasPermission } = useAuth();
  const [idSuggestions, setIdSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const { data, error } = await supabase
          .from("condition_records")
          .select("id_code")
          .order("id_code", { ascending: true });
        
        if (data) {
          const uniqueCodes = Array.from(new Set(data.map(item => item.id_code).filter(Boolean)));
          setIdSuggestions(uniqueCodes);
        }
      } catch (err) {
        console.error("Error fetching suggestions:", err);
      }
    };
    fetchSuggestions();
  }, []);

  const handleDelete = async (id: string) => {
    if (!hasPermission("delete")) {
      alert("คุณไม่มีสิทธิ์ลบข้อมูล");
      return;
    }
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบ Condition นี้? การกระทำนี้ไม่สามารถย้อนกลับได้")) {
      try {
        const { error } = await supabase.from("condition_records").delete().eq("id", id);
        if (error) throw error;
        alert("ลบข้อมูลสำเร็จ");
        // Remove from local state
        setResults(results.filter(item => item.id !== id));
      } catch (err: any) {
        alert("ลบข้อมูลไม่สำเร็จ: " + err.message);
      }
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setHasSearched(true);
    
    try {
      let query = supabase.from("condition_records").select("id, id_code, date, mc_no, type, part_name");

      if (formData.idCode) query = query.ilike("id_code", `%${formData.idCode}%`);
      if (formData.date) query = query.eq("date", formData.date);
      if (formData.mcNo) query = query.ilike("mc_no", `%${formData.mcNo}%`);

      // Order by newest first
      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error("Search error:", error);
        alert("Error searching database: " + error.message);
      } else {
        setResults(data || []);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`${styles.container} gradient-bg`}>
      <div className={styles.card}>
        <h1 className={styles.title}>
          {isEditMode ? "ค้นหาเพื่อแก้ไข Condition" : "ค้นหา Condition"}
        </h1>
        
        <form onSubmit={handleSearch}>
          <div className={styles.searchGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="idCode">ค้นหา ID Code</label>
              <input
                type="text"
                id="idCode"
                list="idCodeSuggestions"
                className={styles.input}
                placeholder="e.g. ID-001"
                value={formData.idCode}
                onChange={(e) => setFormData({...formData, idCode: e.target.value})}
              />
              <datalist id="idCodeSuggestions">
                {idSuggestions.map((code) => (
                  <option key={code} value={code} />
                ))}
              </datalist>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="date">ค้นหา Date</label>
              <input
                type="date"
                id="date"
                className={styles.input}
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="mcNo">ค้นหา M/C No.</label>
              <input
                type="text"
                id="mcNo"
                className={styles.input}
                placeholder="e.g. MC-05"
                value={formData.mcNo}
                onChange={(e) => setFormData({...formData, mcNo: e.target.value})}
              />
            </div>
          </div>

          <div className={styles.actions}>
            <Link href="/" className={`${styles.btn} ${styles.btnSecondary}`}>
              <ArrowLeft size={18} />
              BACK
            </Link>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isLoading}>
              <Search size={18} />
              {isLoading ? "Searching..." : "ค้นหา"}
            </button>
          </div>
        </form>

        {hasSearched && (
          <div className={styles.resultsList}>
            {results.length > 0 ? (
              results.map((item) => (
                <div key={item.id} className={styles.resultItem} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Link 
                    href={`/condition/${item.id}${isEditMode ? "?mode=edit" : "?mode=view"}`} 
                    style={{ flex: 1, textDecoration: 'none', color: 'inherit', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <div>
                      <div className={styles.resultTitle}>ID: {item.id_code || "-"} <span className={item.type === 'Master' ? styles.badgeMaster : styles.badgeMass}>{item.type}</span></div>
                      <div className={styles.resultSub}>Date: {item.date} | M/C: {item.mc_no || "-"} | Part: {item.part_name || "-"}</div>
                    </div>
                    <ChevronRight size={20} className="text-[var(--secondary-hover)]" style={{ marginRight: hasPermission('delete') ? '1rem' : '0' }} />
                  </Link>
                  
                  {hasPermission('delete') && (
                    <button 
                      onClick={(e) => { e.preventDefault(); handleDelete(item.id); }}
                      style={{ padding: '0.5rem', backgroundColor: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="ลบข้อมูล"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className={styles.noResults}>
                ไม่พบข้อมูล Condition ที่ค้นหา
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading Search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
