import React, { useState } from 'react';
import { X } from 'lucide-react';
import styles from './Modal.module.css';

interface InjectionUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  onChange: (newData: any) => void;
}

export default function InjectionUnitModal({ isOpen, onClose, data, onChange }: InjectionUnitModalProps) {
  const [activeTab, setActiveTab] = useState<'holding' | 'injection' | 'screw'>('holding');

  if (!isOpen) return null;

  const handleChange = (field: string, value: string) => {
    onChange({ ...data, [field]: value ? parseFloat(value) : null });
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>INJECTION UNIT</h2>
          <button onClick={onClose} className={styles.closeBtn}><X size={24} /></button>
        </div>
        
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${activeTab === 'holding' ? styles.activeTab : ''}`} onClick={() => setActiveTab('holding')}>HOLDING</button>
          <button className={`${styles.tab} ${activeTab === 'injection' ? styles.activeTab : ''}`} onClick={() => setActiveTab('injection')}>INJECTION</button>
          <button className={`${styles.tab} ${activeTab === 'screw' ? styles.activeTab : ''}`} onClick={() => setActiveTab('screw')}>SCREW CONDITION</button>
        </div>

        <div className={styles.content}>
          {activeTab === 'holding' && (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th></th>
                    <th>1st</th>
                    <th>2nd</th>
                    <th>3rd</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>PRESSURE(Bar)</td>
                    <td><input type="number" className={styles.input} value={data.hl_prs_1st || ''} onChange={(e) => handleChange('hl_prs_1st', e.target.value)} /></td>
                    <td><input type="number" className={styles.input} value={data.hl_prs_2nd || ''} onChange={(e) => handleChange('hl_prs_2nd', e.target.value)} /></td>
                    <td><input type="number" className={styles.input} value={data.hl_prs_3rd || ''} onChange={(e) => handleChange('hl_prs_3rd', e.target.value)} /></td>
                  </tr>
                  <tr>
                    <td>SPEED(%)</td>
                    <td><input type="number" className={styles.input} value={data.hl_spd_1st || ''} onChange={(e) => handleChange('hl_spd_1st', e.target.value)} /></td>
                    <td><input type="number" className={styles.input} value={data.hl_spd_2nd || ''} onChange={(e) => handleChange('hl_spd_2nd', e.target.value)} /></td>
                    <td><input type="number" className={styles.input} value={data.hl_spd_3rd || ''} onChange={(e) => handleChange('hl_spd_3rd', e.target.value)} /></td>
                  </tr>
                  <tr>
                    <td>TIME(Sec)</td>
                    <td><input type="number" className={styles.input} value={data.hl_time_1st || ''} onChange={(e) => handleChange('hl_time_1st', e.target.value)} /></td>
                    <td><input type="number" className={styles.input} value={data.hl_time_2nd || ''} onChange={(e) => handleChange('hl_time_2nd', e.target.value)} /></td>
                    <td><input type="number" className={styles.input} value={data.hl_time_3rd || ''} onChange={(e) => handleChange('hl_time_3rd', e.target.value)} /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'injection' && (
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
                    <td><input type="number" className={styles.input} value={data.ij_prs_1st || ''} onChange={(e) => handleChange('ij_prs_1st', e.target.value)} /></td>
                    <td><input type="number" className={styles.input} value={data.ij_prs_2nd || ''} onChange={(e) => handleChange('ij_prs_2nd', e.target.value)} /></td>
                    <td><input type="number" className={styles.input} value={data.ij_prs_3rd || ''} onChange={(e) => handleChange('ij_prs_3rd', e.target.value)} /></td>
                    <td><input type="number" className={styles.input} value={data.ij_prs_4th || ''} onChange={(e) => handleChange('ij_prs_4th', e.target.value)} /></td>
                    <td><input type="number" className={styles.input} value={data.ij_prs_5th || ''} onChange={(e) => handleChange('ij_prs_5th', e.target.value)} /></td>
                  </tr>
                  <tr>
                    <td>SPEED(%)</td>
                    <td><input type="number" className={styles.input} value={data.ij_spd_1st || ''} onChange={(e) => handleChange('ij_spd_1st', e.target.value)} /></td>
                    <td><input type="number" className={styles.input} value={data.ij_spd_2nd || ''} onChange={(e) => handleChange('ij_spd_2nd', e.target.value)} /></td>
                    <td><input type="number" className={styles.input} value={data.ij_spd_3rd || ''} onChange={(e) => handleChange('ij_spd_3rd', e.target.value)} /></td>
                    <td><input type="number" className={styles.input} value={data.ij_spd_4th || ''} onChange={(e) => handleChange('ij_spd_4th', e.target.value)} /></td>
                    <td><input type="number" className={styles.input} value={data.ij_spd_5th || ''} onChange={(e) => handleChange('ij_spd_5th', e.target.value)} /></td>
                  </tr>
                  <tr>
                    <td>POSITION(mm.)</td>
                    <td><input type="number" className={styles.input} value={data.ij_pos_1st || ''} onChange={(e) => handleChange('ij_pos_1st', e.target.value)} /></td>
                    <td><input type="number" className={styles.input} value={data.ij_pos_2nd || ''} onChange={(e) => handleChange('ij_pos_2nd', e.target.value)} /></td>
                    <td><input type="number" className={styles.input} value={data.ij_pos_3rd || ''} onChange={(e) => handleChange('ij_pos_3rd', e.target.value)} /></td>
                    <td><input type="number" className={styles.input} value={data.ij_pos_4th || ''} onChange={(e) => handleChange('ij_pos_4th', e.target.value)} /></td>
                    <td><input type="number" className={styles.input} value={data.ij_pos_5th || ''} onChange={(e) => handleChange('ij_pos_5th', e.target.value)} /></td>
                  </tr>
                  <tr>
                    <td>TIME(Sec)</td>
                    <td><input type="number" className={styles.input} value={data.ij_time_1st || ''} onChange={(e) => handleChange('ij_time_1st', e.target.value)} /></td>
                    <td><input type="number" className={styles.input} value={data.ij_time_2nd || ''} onChange={(e) => handleChange('ij_time_2nd', e.target.value)} /></td>
                    <td><input type="number" className={styles.input} value={data.ij_time_3rd || ''} onChange={(e) => handleChange('ij_time_3rd', e.target.value)} /></td>
                    <td><input type="number" className={styles.input} value={data.ij_time_4th || ''} onChange={(e) => handleChange('ij_time_4th', e.target.value)} /></td>
                    <td><input type="number" className={styles.input} value={data.ij_time_5th || ''} onChange={(e) => handleChange('ij_time_5th', e.target.value)} /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'screw' && (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <tbody>
                  <tr>
                    <td style={{textAlign: 'right', paddingRight: '1rem'}}>BACK PRESSURE</td>
                    <td><input type="number" className={styles.input} value={data.sc_back_pressure || ''} onChange={(e) => handleChange('sc_back_pressure', e.target.value)} /></td>
                    <td style={{textAlign: 'left', paddingLeft: '0.5rem'}}>Mpa</td>
                  </tr>
                  <tr>
                    <td style={{textAlign: 'right', paddingRight: '1rem'}}>SCREW SPEED</td>
                    <td><input type="number" className={styles.input} value={data.sc_screw_speed || ''} onChange={(e) => handleChange('sc_screw_speed', e.target.value)} /></td>
                    <td style={{textAlign: 'left', paddingLeft: '0.5rem'}}>rpm</td>
                  </tr>
                  <tr>
                    <td style={{textAlign: 'right', paddingRight: '1rem'}}>SUCK BACK</td>
                    <td><input type="number" className={styles.input} value={data.sc_suck_back || ''} onChange={(e) => handleChange('sc_suck_back', e.target.value)} /></td>
                    <td style={{textAlign: 'left', paddingLeft: '0.5rem'}}>mm</td>
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
