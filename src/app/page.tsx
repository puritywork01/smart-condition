"use client";

import Link from "next/link";
import { ClipboardList, FileEdit, LineChart, FileText, LogOut, Shield, Database } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./page.module.css";

export default function Home() {
  const { user, logout, hasPermission } = useAuth();

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginBottom: '1rem' }}>
        {user?.role === "Admin" && (
          <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold' }}>
            <Shield size={18} /> Admin Dashboard
          </Link>
        )}
        <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: 'white', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          <LogOut size={18} /> ออกจากระบบ
        </button>
      </div>

      <div className={styles.header}>
        <h1 className={styles.title}>Smart Condition</h1>
        <p className={styles.subtitle}>
          Injection Molding Condition Management System
        </p>
        {user && (
          <p style={{ marginTop: '0.5rem', color: 'var(--secondary-foreground)' }}>
            เข้าสู่ระบบโดย: <strong>{user.username}</strong> ({user.role})
          </p>
        )}
      </div>

      <div className={styles.grid}>
        {/* Menu Cards */}
        {hasPermission("view_standard") && (
          <Link href="/search" className={`card ${styles.menuCard}`}>
            <div className={`${styles.iconWrapper} ${styles.standard}`}>
              <FileText size={32} />
            </div>
            <h2 className={styles.cardTitle}>CONDITION STANDARD</h2>
            <p className={styles.cardDesc}>View master standard conditions</p>
          </Link>
        )}

        {hasPermission("record_condition") && (
          <Link href="/condition/new" className={`card ${styles.menuCard}`}>
            <div className={`${styles.iconWrapper} ${styles.record}`}>
              <ClipboardList size={32} />
            </div>
            <h2 className={styles.cardTitle}>บันทึก CONDITION</h2>
            <p className={styles.cardDesc}>Record new mass production condition</p>
          </Link>
        )}

        {hasPermission("edit_condition") && (
          <Link href="/search?edit=true" className={`card ${styles.menuCard}`}>
            <div className={`${styles.iconWrapper} ${styles.edit}`}>
              <FileEdit size={32} />
            </div>
            <h2 className={styles.cardTitle}>แก้ไข CONDITION</h2>
            <p className={styles.cardDesc}>Edit existing conditions</p>
          </Link>
        )}

        {hasPermission("analysis") && (
          <Link href="/analysis" className={`card ${styles.menuCard}`}>
            <div className={`${styles.iconWrapper} ${styles.analyze}`}>
              <LineChart size={32} />
            </div>
            <h2 className={styles.cardTitle}>วิเคราะห์ Condition</h2>
            <p className={styles.cardDesc}>Analyze and compare with master</p>
          </Link>
        )}

        {(user?.role === "Admin" || user?.role === "Manager") && (
          <Link href="/parts" className={`card ${styles.menuCard}`}>
            <div className={`${styles.iconWrapper}`} style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }}>
              <Database size={32} />
            </div>
            <h2 className={styles.cardTitle}>ฐานข้อมูลชิ้นงาน</h2>
            <p className={styles.cardDesc}>Manage part master data</p>
          </Link>
        )}
      </div>

      <div className={styles.footer}>
        &copy; 2026 Smart Condition System
      </div>
    </div>
  );
}
