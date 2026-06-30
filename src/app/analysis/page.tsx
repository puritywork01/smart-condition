"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, LineChart, Save } from "lucide-react";
import styles from "./page.module.css";
import { fetchAnalysisData, saveNewMasterFromAnalysis } from "@/lib/services/analysisService";
import { useAuth } from "@/contexts/AuthContext";

export default function AnalysisPage() {
  const { user, hasPermission } = useAuth();
  const [searchParams, setSearchParams] = useState({
    masterId: "",
    startDate: "",
    endDate: "",
  });

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
    weight: 5,
    backPressure: 2,
    screwSpeed: 5
  });

  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [masterRecordRaw, setMasterRecordRaw] = useState<any>(null);

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
          <div className={styles.formGroup}>
            <label className={styles.label}>ค้นหา Master (ID)</label>
            <input 
              type="text" 
              className={styles.input} 
              placeholder="e.g. MAS-001"
              value={searchParams.masterId}
              onChange={e => setSearchParams({...searchParams, masterId: e.target.value})}
              required
            />
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
