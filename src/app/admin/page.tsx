"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchUsers, updateUserPermissions, createUser, updateUserPassword, updateUserRole } from "@/lib/services/authService";
import { Users, Shield, Plus, ArrowLeft, Settings, X, Key, UserCog } from "lucide-react";
import Link from "next/link";
import styles from "./page.module.css";

const AVAILABLE_PERMISSIONS = [
  { id: "view_standard", label: "ดูข้อมูล (View Standard)" },
  { id: "record_condition", label: "เข้าหน้าบันทึก (Record)" },
  { id: "edit_condition", label: "เข้าหน้าแก้ไข (Edit)" },
  { id: "analysis", label: "เข้าหน้าวิเคราะห์ (Analysis)" },
  { id: "create_master", label: "เซฟข้อมูล Master" },
  { id: "download_pdf", label: "พิมพ์/ดาวน์โหลด PDF" },
  { id: "delete", label: "ลบข้อมูล (Delete)" }
];

export default function AdminPage() {
  const { user } = useAuth();
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New user form state
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("Technician");

  // Modal State
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [editingPassword, setEditingPassword] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    const res = await fetchUsers();
    if (res.success && res.users) {
      setUsersList(res.users);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user?.role === "Admin") {
      loadUsers();
    }
  }, [user]);

  const handleTogglePermission = async (userId: string, permId: string, currentPerms: string[]) => {
    const newPerms = currentPerms.includes(permId)
      ? currentPerms.filter(p => p !== permId)
      : [...currentPerms, permId];
    
    // Optimistic update UI
    setUsersList(usersList.map(u => u.id === userId ? { ...u, permissions: newPerms } : u));

    // Save to DB
    const res = await updateUserPermissions(userId, newPerms);
    if (!res.success) {
      alert("Failed to update permission: " + res.error);
      loadUsers(); // revert
    } else {
      // Update modal state too
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({ ...selectedUser, permissions: newPerms });
      }
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    // Update local state
    setUsersList(usersList.map(u => u.id === userId ? { ...u, role: newRole } : u));
    if (selectedUser && selectedUser.id === userId) {
      setSelectedUser({ ...selectedUser, role: newRole });
    }

    // Save to DB
    const res = await updateUserRole(userId, newRole);
    if (!res.success) {
      alert("Failed to update role: " + res.error);
      loadUsers(); // revert
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !editingPassword) return;

    const res = await updateUserPassword(selectedUser.id, editingPassword);
    if (res.success) {
      alert("เปลี่ยนรหัสผ่านสำเร็จ!");
      // Update local state so current password indicator reflects the change immediately
      setUsersList(usersList.map(u => u.id === selectedUser.id ? { ...u, password: editingPassword } : u));
      setSelectedUser({ ...selectedUser, password: editingPassword });
      setEditingPassword("");
    } else {
      alert("เกิดข้อผิดพลาด: " + res.error);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) return;

    // Default give all permissions if Admin, otherwise empty
    const defaultPerms = newRole === "Admin" ? AVAILABLE_PERMISSIONS.map(p => p.id) : [];

    const res = await createUser(newUsername, newPassword, newRole, defaultPerms);
    if (res.success) {
      alert("สร้างบัญชีผู้ใช้ใหม่สำเร็จ!");
      setNewUsername("");
      setNewPassword("");
      loadUsers();
    } else {
      alert("เกิดข้อผิดพลาด: " + res.error);
    }
  };

  if (!user || user.role !== "Admin") {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Access Denied. Only Admins can view this page.</div>;
  }

  return (
    <div className={`${styles.container} gradient-bg`} style={{ minHeight: '100vh', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Shield size={32} color="var(--primary)" />
            จัดการสิทธิ์ผู้ใช้งาน (Admin Dashboard)
          </h1>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--primary)', fontWeight: 'bold' }}>
            <ArrowLeft size={20} /> กลับหน้าหลัก
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '2rem' }}>
          {/* Add User Form */}
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', height: 'fit-content' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={20} /> สร้างบัญชีใหม่
            </h2>
            <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>รหัสพนักงาน (Username)</label>
                <input type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)} required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>รหัสผ่าน (Password)</label>
                <input type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)} required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>ระดับสิทธิ์ (Role)</label>
                <select value={newRole} onChange={e => setNewRole(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}>
                  <option value="Technician">ช่างใช้งาน (Technician)</option>
                  <option value="Manager">ผู้จัดการ (Manager)</option>
                  <option value="Admin">แอดมิน (Admin)</option>
                </select>
              </div>
              <button type="submit" style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0.75rem', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem' }}>
                สร้างบัญชี
              </button>
            </form>
          </div>

          {/* User List and Permissions */}
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={20} /> รายชื่อผู้ใช้งานและสิทธิ์
            </h2>
            
            {loading ? (
              <div>Loading...</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem', width: '30%' }}>Username</th>
                    <th style={{ padding: '0.75rem', width: '30%' }}>Role</th>
                    <th style={{ padding: '0.75rem', width: '40%' }}>จัดการ (Manage)</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #eee', transition: 'background-color 0.2s' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{u.username}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{ 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '12px', 
                          fontSize: '0.75rem',
                          backgroundColor: u.role === 'Admin' ? '#fee2e2' : u.role === 'Manager' ? '#dbeafe' : '#f3f4f6',
                          color: u.role === 'Admin' ? '#ef4444' : u.role === 'Manager' ? '#3b82f6' : '#4b5563'
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <button 
                          onClick={() => setSelectedUser(u)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.5rem 1rem', backgroundColor: '#f3f4f6', 
                            border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer',
                            fontSize: '0.875rem', fontWeight: '500'
                          }}
                        >
                          <Settings size={16} /> กำหนดสิทธิ์ / แก้ไข
                        </button>
                      </td>
                    </tr>
                  ))}
                  {usersList.length === 0 && (
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>ไม่พบข้อมูลผู้ใช้</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* User Management Modal */}
      {selectedUser && (
        <div className={styles.modalOverlay} onClick={() => setSelectedUser(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setSelectedUser(null)}>
              <X size={24} />
            </button>
            
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              จัดการบัญชี: {selectedUser.username}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>ระดับสิทธิ์ปัจจุบัน:</span>
              <select 
                value={selectedUser.role}
                onChange={(e) => handleRoleChange(selectedUser.id, e.target.value)}
                style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '0.875rem', fontWeight: 'bold', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
              >
                <option value="Technician">ช่างใช้งาน (Technician)</option>
                <option value="Manager">ผู้จัดการ (Manager)</option>
                <option value="Admin">แอดมิน (Admin)</option>
              </select>
              <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: '500', marginLeft: '0.5rem' }}>✓ บันทึกอัตโนมัติเมื่อเลือก</span>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>กำหนดสิทธิ์การใช้งาน (Permissions)</span>
                <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 'normal' }}>✓ บันทึกอัตโนมัติเมื่อคลิก</span>
              </h3>
              {selectedUser.role === "Admin" ? (
                <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '6px', color: '#4b5563', fontSize: '0.875rem', textAlign: 'center' }}>
                  แอดมินมีสิทธิ์การใช้งานทั้งหมดในระบบ
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {AVAILABLE_PERMISSIONS.map(perm => {
                    const hasPerm = selectedUser.permissions.includes(perm.id);
                    return (
                      <div key={perm.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <label className={styles.switch}>
                          <input 
                            type="checkbox" 
                            checked={hasPerm}
                            onChange={() => handleTogglePermission(selectedUser.id, perm.id, selectedUser.permissions)}
                          />
                          <span className={styles.slider}></span>
                        </label>
                        <span style={{ fontSize: '0.875rem', cursor: 'default' }}>{perm.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Key size={18} /> รหัสผ่าน (Password)
              </h3>
              <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                <span style={{ color: '#6b7280', fontSize: '0.875rem', marginRight: '0.5rem' }}>รหัสผ่านปัจจุบัน:</span>
                <strong style={{ fontFamily: 'monospace', fontSize: '1rem' }}>{selectedUser.password}</strong>
              </div>
              <form onSubmit={handleChangePassword} style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  value={editingPassword}
                  onChange={e => setEditingPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่านใหม่..."
                  required
                  style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <button type="submit" style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                  เปลี่ยนรหัสผ่าน
                </button>
              </form>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
              <button 
                type="button" 
                onClick={() => setSelectedUser(null)}
                style={{ backgroundColor: '#10b981', color: 'white', padding: '0.6rem 2.5rem', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: 'background-color 0.2s' }}
              >
                เสร็จสิ้น
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
