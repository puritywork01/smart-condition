import React from 'react';
import { X } from 'lucide-react';
import styles from './Modal.module.css';

interface CoolingUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  onChange: (newData: any) => void;
}

export default function CoolingUnitModal({ isOpen, onClose, data, onChange }: CoolingUnitModalProps) {
  if (!isOpen) return null;

  const handleChange = (field: string, value: string) => {
    onChange({ ...data, [field]: value ? parseFloat(value) : null });
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal} style={{ maxWidth: '600px' }}>
        <div className={styles.header}>
          <h2 className={styles.title}>COOLING</h2>
          <button onClick={onClose} className={styles.closeBtn}><X size={24} /></button>
        </div>
        
        <div className={styles.content}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <tbody>
                <tr>
                  <td style={{textAlign: 'left', fontWeight: 'bold'}}>CAVITY SIDE</td>
                  <td>COLD WATER</td>
                  <td><input type="number" className={styles.input} value={data.cavity_cold_water || ''} onChange={(e) => handleChange('cavity_cold_water', e.target.value)} /></td>
                  <td style={{textAlign: 'left'}}>℃</td>
                </tr>
                <tr>
                  <td></td>
                  <td>HOT WATER</td>
                  <td><input type="number" className={styles.input} value={data.cavity_hot_water || ''} onChange={(e) => handleChange('cavity_hot_water', e.target.value)} /></td>
                  <td style={{textAlign: 'left'}}>℃</td>
                </tr>
                <tr><td colSpan={4}><hr style={{borderColor: 'var(--border)', margin: '0.5rem 0'}}/></td></tr>
                <tr>
                  <td style={{textAlign: 'left', fontWeight: 'bold'}}>CORE SIDE</td>
                  <td>COLD WATER</td>
                  <td><input type="number" className={styles.input} value={data.core_cold_water || ''} onChange={(e) => handleChange('core_cold_water', e.target.value)} /></td>
                  <td style={{textAlign: 'left'}}>℃</td>
                </tr>
                <tr>
                  <td></td>
                  <td>HOT WATER</td>
                  <td><input type="number" className={styles.input} value={data.core_hot_water || ''} onChange={(e) => handleChange('core_hot_water', e.target.value)} /></td>
                  <td style={{textAlign: 'left'}}>℃</td>
                </tr>
                <tr><td colSpan={4}><hr style={{borderColor: 'var(--border)', margin: '0.5rem 0'}}/></td></tr>
                <tr>
                  <td style={{textAlign: 'left', fontWeight: 'bold'}}>COOLING TIME</td>
                  <td></td>
                  <td><input type="number" className={styles.input} value={data.cooling_time || ''} onChange={(e) => handleChange('cooling_time', e.target.value)} /></td>
                  <td style={{textAlign: 'left'}}>sec.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.btnPrimary} onClick={onClose}>SAVE / CLOSE</button>
        </div>
      </div>
    </div>
  );
}
