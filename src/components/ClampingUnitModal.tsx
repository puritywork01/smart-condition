import React, { useState } from 'react';
import { X } from 'lucide-react';
import styles from './Modal.module.css';

interface ClampingUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  onChange: (newData: any) => void;
}

export default function ClampingUnitModal({ isOpen, onClose, data, onChange }: ClampingUnitModalProps) {
  const [activeTab, setActiveTab] = useState<'close' | 'open' | 'ejector'>('close');

  if (!isOpen) return null;

  const handleChange = (field: string, value: string) => {
    onChange({ ...data, [field]: value ? parseFloat(value) : null });
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>CLAMPING UNIT</h2>
          <button onClick={onClose} className={styles.closeBtn}><X size={24} /></button>
        </div>
        
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${activeTab === 'close' ? styles.activeTab : ''}`} onClick={() => setActiveTab('close')}>MOLD CLOSE</button>
          <button className={`${styles.tab} ${activeTab === 'open' ? styles.activeTab : ''}`} onClick={() => setActiveTab('open')}>MOLD OPEN</button>
          <button className={`${styles.tab} ${activeTab === 'ejector' ? styles.activeTab : ''}`} onClick={() => setActiveTab('ejector')}>EJECTOR</button>
        </div>

        <div className={styles.content}>
          {activeTab === 'close' && (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th></th>
                    <th>1st</th>
                    <th>2nd</th>
                    <th>3rd</th>
                    <th>Low Prs.</th>
                    <th>Hi Prs.</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>PRESSURE(Bar)</td>
                    <td><input type="number" className={styles.input} value={data.mc_prs_1st || ''} onChange={(e) => handleChange('mc_prs_1st', e.target.value)} /></td>
                    <td><input type="number" className={styles.input} value={data.mc_prs_2nd || ''} onChange={(e) => handleChange('mc_prs_2nd', e.target.value)} /></td>
                    <td><input type="number" className={styles.input} value={data.mc_prs_3rd || ''} onChange={(e) => handleChange('mc_prs_3rd', e.target.value)} /></td>
                    <td><input type="number" className={styles.input} value={data.mc_prs_low || ''} onChange={(e) => handleChange('mc_prs_low', e.target.value)} /></td>
                    <td><input type="number" className={styles.input} value={data.mc_prs_hi || ''} onChange={(e) => handleChange('mc_prs_hi', e.target.value)} /></td>
                  </tr>
                  <tr>
                    <td>SPEED(%)</td>
                    <td><input type="number" className={styles.input} value={data.mc_spd_1st || ''} onChange={(e) => handleChange('mc_spd_1st', e.target.value)} /></td>
                    <td><input type="number" className={styles.input} value={data.mc_spd_2nd || ''} onChange={(e) => handleChange('mc_spd_2nd', e.target.value)} /></td>
                    <td><input type="number" className={styles.input} value={data.mc_spd_3rd || ''} onChange={(e) => handleChange('mc_spd_3rd', e.target.value)} /></td>
                    <td><input type="number" className={styles.input} value={data.mc_spd_low || ''} onChange={(e) => handleChange('mc_spd_low', e.target.value)} /></td>
                    <td><input type="number" className={styles.input} value={data.mc_spd_hi || ''} onChange={(e) => handleChange('mc_spd_hi', e.target.value)} /></td>
                  </tr>
                  <tr>
                    <td>POSITION(mm.)</td>
                    <td><input type="number" className={styles.input} value={data.mc_pos_1st || ''} onChange={(e) => handleChange('mc_pos_1st', e.target.value)} /></td>
                    <td><input type="number" className={styles.input} value={data.mc_pos_2nd || ''} onChange={(e) => handleChange('mc_pos_2nd', e.target.value)} /></td>
                    <td><input type="number" className={styles.input} value={data.mc_pos_3rd || ''} onChange={(e) => handleChange('mc_pos_3rd', e.target.value)} /></td>
                    <td><input type="number" className={styles.input} value={data.mc_pos_low || ''} onChange={(e) => handleChange('mc_pos_low', e.target.value)} /></td>
                    <td><input type="number" className={styles.input} value={data.mc_pos_hi || ''} onChange={(e) => handleChange('mc_pos_hi', e.target.value)} /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'open' && (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th></th>
                    <th>1st</th>
                    <th>2nd</th>
                    <th>3rd</th>
                    <th>4th</th>
                    <th>5th</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>PRESSURE(Bar)</td>
                    <td><input type="number" className={styles.input} value={data.mo_prs_1st || ''} onChange={(e) => handleChange('mo_prs_1st', e.target.value)} /></td>
                    <td><input type="number" className={styles.input} value={data.mo_prs_2nd || ''} onChange={(e) => handleChange('mo_prs_2nd', e.target.value)} /></td>
                    <td><input type="number" className={styles.input} value={data.mo_prs_3rd || ''} onChange={(e) => handleChange('mo_prs_3rd', e.target.value)} /></td>
                    <td><input type="number" className={styles.input} value={data.mo_prs_4th || ''} onChange={(e) => handleChange('mo_prs_4th', e.target.value)} /></td>
                    <td><input type="number" className={styles.input} value={data.mo_prs_5th || ''} onChange={(e) => handleChange('mo_prs_5th', e.target.value)} /></td>
                  </tr>
                  <tr>
                    <td>SPEED(%)</td>
                    <td><input type="number" className={styles.input} value={data.mo_spd_1st || ''} onChange={(e) => handleChange('mo_spd_1st', e.target.value)} /></td>
                    <td><input type="number" className={styles.input} value={data.mo_spd_2nd || ''} onChange={(e) => handleChange('mo_spd_2nd', e.target.value)} /></td>
                    <td><input type="number" className={styles.input} value={data.mo_spd_3rd || ''} onChange={(e) => handleChange('mo_spd_3rd', e.target.value)} /></td>
                    <td><input type="number" className={styles.input} value={data.mo_spd_4th || ''} onChange={(e) => handleChange('mo_spd_4th', e.target.value)} /></td>
                    <td><input type="number" className={styles.input} value={data.mo_spd_5th || ''} onChange={(e) => handleChange('mo_spd_5th', e.target.value)} /></td>
                  </tr>
                  <tr>
                    <td>POSITION(mm.)</td>
                    <td><input type="number" className={styles.input} value={data.mo_pos_1st || ''} onChange={(e) => handleChange('mo_pos_1st', e.target.value)} /></td>
                    <td><input type="number" className={styles.input} value={data.mo_pos_2nd || ''} onChange={(e) => handleChange('mo_pos_2nd', e.target.value)} /></td>
                    <td><input type="number" className={styles.input} value={data.mo_pos_3rd || ''} onChange={(e) => handleChange('mo_pos_3rd', e.target.value)} /></td>
                    <td><input type="number" className={styles.input} value={data.mo_pos_4th || ''} onChange={(e) => handleChange('mo_pos_4th', e.target.value)} /></td>
                    <td><input type="number" className={styles.input} value={data.mo_pos_5th || ''} onChange={(e) => handleChange('mo_pos_5th', e.target.value)} /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'ejector' && (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th></th>
                    <th>1st</th>
                    <th>2nd</th>
                    <th>3rd</th>
                    <th>4th</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>PRESSURE(Bar)</td>
                    <td><input type="number" className={styles.input} value={data.ej_prs_1st || ''} onChange={(e) => handleChange('ej_prs_1st', e.target.value)} /></td>
                    <td><input type="number" className={styles.input} value={data.ej_prs_2nd || ''} onChange={(e) => handleChange('ej_prs_2nd', e.target.value)} /></td>
                    <td><input type="number" className={styles.input} value={data.ej_prs_3rd || ''} onChange={(e) => handleChange('ej_prs_3rd', e.target.value)} /></td>
                    <td><input type="number" className={styles.input} value={data.ej_prs_4th || ''} onChange={(e) => handleChange('ej_prs_4th', e.target.value)} /></td>
                  </tr>
                  <tr>
                    <td>SPEED(%)</td>
                    <td><input type="number" className={styles.input} value={data.ej_spd_1st || ''} onChange={(e) => handleChange('ej_spd_1st', e.target.value)} /></td>
                    <td><input type="number" className={styles.input} value={data.ej_spd_2nd || ''} onChange={(e) => handleChange('ej_spd_2nd', e.target.value)} /></td>
                    <td><input type="number" className={styles.input} value={data.ej_spd_3rd || ''} onChange={(e) => handleChange('ej_spd_3rd', e.target.value)} /></td>
                    <td><input type="number" className={styles.input} value={data.ej_spd_4th || ''} onChange={(e) => handleChange('ej_spd_4th', e.target.value)} /></td>
                  </tr>
                  <tr>
                    <td>POSITION(mm.)</td>
                    <td><input type="number" className={styles.input} value={data.ej_pos_1st || ''} onChange={(e) => handleChange('ej_pos_1st', e.target.value)} /></td>
                    <td><input type="number" className={styles.input} value={data.ej_pos_2nd || ''} onChange={(e) => handleChange('ej_pos_2nd', e.target.value)} /></td>
                    <td><input type="number" className={styles.input} value={data.ej_pos_3rd || ''} onChange={(e) => handleChange('ej_pos_3rd', e.target.value)} /></td>
                    <td><input type="number" className={styles.input} value={data.ej_pos_4th || ''} onChange={(e) => handleChange('ej_pos_4th', e.target.value)} /></td>
                  </tr>
                  <tr>
                    <td>DELAY TIME(sec)</td>
                    <td colSpan={4}><input type="number" className={styles.input} style={{width: '100px'}} value={data.ej_delay_time || ''} onChange={(e) => handleChange('ej_delay_time', e.target.value)} /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button className={styles.btnPrimary} onClick={onClose}>SAVE / CLOSE</button>
        </div>
      </div>
    </div>
  );
}
