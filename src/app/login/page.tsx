"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { loginUser } from "@/lib/services/authService";
import { Lock } from "lucide-react";
import styles from "./page.module.css";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await loginUser(username, password);
    if (res.success && res.user) {
      login(res.user);
    } else {
      setError(res.error || "เข้าสู่ระบบไม่สำเร็จ (Login failed)");
    }
    
    setLoading(false);
  };

  return (
    <div className={`${styles.container} gradient-bg`}>
      <div className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div style={{ backgroundColor: 'var(--primary)', padding: '1rem', borderRadius: '50%' }}>
            <Lock size={32} color="white" />
          </div>
        </div>
        <h1 className={styles.title}>Smart Condition</h1>
        <p className={styles.subtitle}>เข้าสู่ระบบ (Sign in)</p>

        <form className={styles.form} onSubmit={handleLogin}>
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="username">รหัสพนักงาน / Username</label>
            <input
              type="text"
              id="username"
              className={styles.input}
              placeholder="รหัสพนักงานของคุณ"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="password">รหัสผ่าน / Password</label>
            <input
              type="password"
              id="password"
              className={styles.input}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className={styles.btnLogin} disabled={loading}>
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>

          {error && <div className={styles.error}>{error}</div>}
        </form>
      </div>
    </div>
  );
}
