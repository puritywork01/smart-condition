"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, LineChart, Save } from "lucide-react";
import styles from "./page.module.css";
import { fetchAnalysisData, saveNewMasterFromAnalysis } from "@/lib/services/analysisService";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export default function AnalysisPage() {
  const { user, hasPermission } = useAuth();
  const [searchParams, setSearchParams] = useState({
    masterId: "",
    startDate: "",
    endDate: "",
  });

  const [masterSuggestions, setMasterSuggestions] = useState<string[]>([]);
  const [showMasterSuggestions, setShowMasterSuggestions] = useState(false);

  useEffect(() => {
    const fetchMasterSuggestions = async () => {
      try {
        const { data, error } = await supabase
          .from("condition_records")
          .select("id_code")
          .eq("type", "Master")
          .order("id_code", { ascending: true });
        
        if (data) {
          const uniqueCodes = Array.from(new Set(data.map(item => item.id_code).filter(Boolean)));
          setMasterSuggestions(uniqueCodes);
        }
      } catch (err) {
        console.error("Error fetching master suggestions:", err);
      }
    };
    fetchMasterSuggestions();
  }, []);

  // Guard for permission
  if (user && !hasPermission("analysis")) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Access Denied. You do not have permission to view Analysis.</div>;
  }

  const [tolerance, setTolerance] = useState({
    pressure: 10,
    speed: 10,
    position: 10,
    time: 10,
    temperature: 10,
    weight: 10,
    backPressure: 10,
    screwSpeed: 10
  });

  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [masterRecordRaw, setMasterRecordRaw] = useState<any>(null);
  const [analysisSummary, setAnalysisSummary] = useState<any>(null);

  const [results, setResults] = useState([
    { param: "MOLD CLOSE 1st Pressure", avg: 85, master: 80 },
    { param: "MOLD CLOSE 2nd Pressure", avg: 62, master: 60 },
    { param: "INJECTION 1st Speed", avg: 45, master: 45 },
    { param: "COOLING TIME", avg: 16.5, master: 15 },
  ]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await fetchAnalysisData(searchParams.masterId, searchParams.startDate, searchParams.endDate, tolerance);
      if (res.success && res.results) {
        setResults(res.results);
        setMasterRecordRaw(res.masterRecord);
        setAnalysisSummary(res.summary);
        setIsAnalyzed(true);
      } else {
        alert("Error fetching data: " + res.error);
        // Fallback to mock data to show UI
        setIsAnalyzed(true);
      }
    } catch (err) {
      console.error(err);
      setIsAnalyzed(true); // show mock data anyway for demo
    } finally {
      setIsLoading(false);
    }
  };

  const handleMasterChange = (index: number, newValue: string) => {
    const newResults = [...results];
    newResults[index].master = Number(newValue);
    setResults(newResults);
  };

  const handleSaveNewMaster = async () => {
    if (!masterRecordRaw) {
      alert("No base master record found. (Demo mode)");
      return;
    }
    
    setIsLoading(true);
    const res = await saveNewMasterFromAnalysis(masterRecordRaw, results);
    setIsLoading(false);
    
    if (res.success) {
      alert("New Master Condition created successfully!");
    } else {
      alert("Error saving: " + res.error);
    }
  };

  return (
    <div className={`${styles.container} gradient-bg`}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <LineChart size={28} className="text-[var(--primary)]" />
          วิเคราะห์ Condition
        </h1>
      </div>

      <div className={styles.card}>
        <form className={styles.searchGrid} onSubmit={handleAnalyze}>
          <div className={styles.formGroup} style={{ position: 'relative' }}>
            <label className={styles.label}>ค้นหา Master (ID)</label>
            <input 
              type="text" 
              autoComplete="off"
              className={styles.input} 
              placeholder="e.g. MAS-001"
              value={searchParams.masterId}
              onChange={e => {
                setSearchParams({...searchParams, masterId: e.target.value});
                setShowMasterSuggestions(true);
              }}
              onFocus={() => setShowMasterSuggestions(true)}
              onBlur={() => setTimeout(() => setShowMasterSuggestions(false), 200)}
              required
            />
            {showMasterSuggestions && masterSuggestions.filter(code => code.toLowerCase().includes(searchParams.masterId.toLowerCase())).length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                marginTop: '4px',
                maxHeight: '200px',
                overflowY: 'auto',
                zIndex: 50,
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
              }}>
                {masterSuggestions
                  .filter(code => code.toLowerCase().includes(searchParams.masterId.toLowerCase()))
                  .map((code) => (
                    <div 
                      key={code}
                      style={{ 
                        padding: '10px 12px', 
                        cursor: 'pointer', 
                        borderBottom: '1px solid #f1f5f9',
                        color: '#334155',
                        fontSize: '14px',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseDown={(e) => {
                         e.preventDefault();
                         setSearchParams({...searchParams, masterId: code});
                         setShowMasterSuggestions(false);
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                      {code}
                    </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>ระยะเวลา Mass Production</label>
            <div className={styles.dateRange}>
              <input 
                type="date" 
                className={styles.input} 
                value={searchParams.startDate}
                onChange={e => setSearchParams({...searchParams, startDate: e.target.value})}
                required
              />
              <span>-</span>
              <input 
                type="date" 
                className={styles.input} 
                value={searchParams.endDate}
                onChange={e => setSearchParams({...searchParams, endDate: e.target.value})}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
            <label className={styles.label} style={{borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem'}}>
              พิกัดความเผื่อ (Tolerance) - ใช้คัดกรองข้อมูลก่อนวิเคราะห์
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{fontSize: '0.8rem', color: 'var(--secondary-foreground)'}}>Pressure (± Bar)</label>
                <input type="number" className={styles.input} style={{width: '100%', padding: '0.5rem'}} value={tolerance.pressure} onChange={e => setTolerance({...tolerance, pressure: Number(e.target.value)})} />
              </div>
              <div>
                <label style={{fontSize: '0.8rem', color: 'var(--secondary-foreground)'}}>Speed (± %)</label>
                <input type="number" className={styles.input} style={{width: '100%', padding: '0.5rem'}} value={tolerance.speed} onChange={e => setTolerance({...tolerance, speed: Number(e.target.value)})} />
              </div>
              <div>
                <label style={{fontSize: '0.8rem', color: 'var(--secondary-foreground)'}}>Position (± mm)</label>
                <input type="number" className={styles.input} style={{width: '100%', padding: '0.5rem'}} value={tolerance.position} onChange={e => setTolerance({...tolerance, position: Number(e.target.value)})} />
              </div>
              <div>
                <label style={{fontSize: '0.8rem', color: 'var(--secondary-foreground)'}}>Time (± sec)</label>
                <input type="number" className={styles.input} style={{width: '100%', padding: '0.5rem'}} value={tolerance.time} onChange={e => setTolerance({...tolerance, time: Number(e.target.value)})} />
              </div>
              <div>
                <label style={{fontSize: '0.8rem', color: 'var(--secondary-foreground)'}}>Temperature (± ℃)</label>
                <input type="number" className={styles.input} style={{width: '100%', padding: '0.5rem'}} value={tolerance.temperature} onChange={e => setTolerance({...tolerance, temperature: Number(e.target.value)})} />
              </div>
              <div>
                <label style={{fontSize: '0.8rem', color: 'var(--secondary-foreground)'}}>Weight (± g)</label>
                <input type="number" className={styles.input} style={{width: '100%', padding: '0.5rem'}} value={tolerance.weight} onChange={e => setTolerance({...tolerance, weight: Number(e.target.value)})} />
              </div>
              <div>
                <label style={{fontSize: '0.8rem', color: 'var(--secondary-foreground)'}}>Back Pressure (± MPa)</label>
                <input type="number" className={styles.input} style={{width: '100%', padding: '0.5rem'}} value={tolerance.backPressure} onChange={e => setTolerance({...tolerance, backPressure: Number(e.target.value)})} />
              </div>
              <div>
                <label style={{fontSize: '0.8rem', color: 'var(--secondary-foreground)'}}>Screw Speed (± rpm)</label>
                <input type="number" className={styles.input} style={{width: '100%', padding: '0.5rem'}} value={tolerance.screwSpeed} onChange={e => setTolerance({...tolerance, screwSpeed: Number(e.target.value)})} />
              </div>
            </div>
          </div>

          <button type="submit" className={styles.btnAnalyze} disabled={isLoading}>
            {isLoading ? "Analyzing..." : "วิเคราะห์"}
          </button>
        </form>
      </div>

      {isAnalyzed && (
        <div className={styles.resultsArea}>
          {analysisSummary && (
            <div style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ display: 'inline-block', width: '4px', height: '16px', backgroundColor: 'var(--primary)', borderRadius: '2px' }}></span>
                ข้อมูลสรุปการวิเคราะห์ (Analysis Summary)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>อ้างอิง Master ID</div>
                  <div style={{ fontWeight: '600', color: '#1e293b' }}>{analysisSummary.masterId} <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: '#64748b' }}>(อัปเดต: {analysisSummary.masterDate})</span></div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>ช่วงเวลาที่นำมาวิเคราะห์</div>
                  <div style={{ fontWeight: '600', color: '#1e293b' }}>{analysisSummary.startDate} <span style={{fontWeight: 'normal', margin: '0 4px', color: '#64748b'}}>ถึง</span> {analysisSummary.endDate}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>จำนวนข้อมูล Production ที่พบ</div>
                  <div style={{ fontWeight: '600', color: '#0ea5e9' }}>{analysisSummary.productionCount} Records <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: '#64748b' }}>(จากทั้งหมด {analysisSummary.daysFound} วัน)</span></div>
                </div>
              </div>
            </div>
          )}

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Mass Production Average</th>
                  <th>Master Condition (Editable)</th>
                </tr>
              </thead>
              <tbody>
                {results.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.param}</td>
                    <td className={styles.avgValue}>{row.avg.toFixed(2)}</td>
                    <td>
                      <input 
                        type="number" 
                        className={styles.masterInput} 
                        value={row.master}
                        onChange={(e) => handleMasterChange(idx, e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.actions}>
            <Link href="/" className={styles.btnBack}>
              <ArrowLeft size={18} /> BACK
            </Link>
            <button className={styles.btnSaveMaster} onClick={handleSaveNewMaster} disabled={isLoading}>
              <Save size={18} /> สร้างเป็น Master ฉบับใหม่
            </button>
          </div>
        </div>
      )}
      
      {!isAnalyzed && (
        <div className={styles.actions} style={{ width: '100%', maxWidth: '1200px' }}>
           <Link href="/" className={styles.btnBack}>
              <ArrowLeft size={18} /> BACK TO HOMEPAGE
            </Link>
        </div>
      )}
    </div>
  );
}
