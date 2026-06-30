import React, { useState } from 'react';
import { X } from 'lucide-react';
import styles from './Modal.module.css';

interface TemperatureUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  onChange: (newData: any) => void;
}

export default function TemperatureUnitModal({ isOpen, onClose, data, onChange }: TemperatureUnitModalProps) {
  const [activeTab, setActiveTab] = useState<'barel' | 'hotrunner'>('barel');

  if (!isOpen) return null;

  const handleChange = (field: string, value: string) => {
    onChange({ ...data, [field]: value ? parseFloat(value) : null });
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>TEMPERATURE</h2>
          <button onClick={onClose} className={styles.closeBtn}><X size={24} /></button>
        </div>
        
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${activeTab === 'barel' ? styles.activeTab : ''}`} onClick={() => setActiveTab('barel')}>BAREL</button>
          <button className={`${styles.tab} ${activeTab === 'hotrunner' ? styles.activeTab : ''}`} onClick={() => setActiveTab('hotrunner')}>HOT RUNNER</button>
        </div>

        <div className={styles.content}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th></th>
                  {activeTab === 'barel' && <th>NOZZLE</th>}
                  <th>Zone1</th>
                  <th>Zone2</th>
                  <th>Zone3</th>
                  <th>Zone4</th>
                  <th>Zone5</th>
                  <th>Zone6</th>
                  <th>Zone7</th>
                  <th>Zone8</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>TEMP (℃)</td>
                  {activeTab === 'barel' && <td><input type="number" className={styles.input} value={data.nozzle || ''} onChange={(e) => handleChange('nozzle', e.target.value)} /></td>}
                  <td><input type="number" className={styles.input} value={activeTab === 'barel' ? data.zone1 || '' : data.hr_zone1 || ''} onChange={(e) => handleChange(activeTab === 'barel' ? 'zone1' : 'hr_zone1', e.target.value)} /></td>
                  <td><input type="number" className={styles.input} value={activeTab === 'barel' ? data.zone2 || '' : data.hr_zone2 || ''} onChange={(e) => handleChange(activeTab === 'barel' ? 'zone2' : 'hr_zone2', e.target.value)} /></td>
                  <td><input type="number" className={styles.input} value={activeTab === 'barel' ? data.zone3 || '' : data.hr_zone3 || ''} onChange={(e) => handleChange(activeTab === 'barel' ? 'zone3' : 'hr_zone3', e.target.value)} /></td>
                  <td><input type="number" className={styles.input} value={activeTab === 'barel' ? data.zone4 || '' : data.hr_zone4 || ''} onChange={(e) => handleChange(activeTab === 'barel' ? 'zone4' : 'hr_zone4', e.target.value)} /></td>
                  <td><input type="number" className={styles.input} value={activeTab === 'barel' ? data.zone5 || '' : data.hr_zone5 || ''} onChange={(e) => handleChange(activeTab === 'barel' ? 'zone5' : 'hr_zone5', e.target.value)} /></td>
                  <td><input type="number" className={styles.input} value={activeTab === 'barel' ? data.zone6 || '' : data.hr_zone6 || ''} onChange={(e) => handleChange(activeTab === 'barel' ? 'zone6' : 'hr_zone6', e.target.value)} /></td>
                  <td><input type="number" className={styles.input} value={activeTab === 'barel' ? data.zone7 || '' : data.hr_zone7 || ''} onChange={(e) => handleChange(activeTab === 'barel' ? 'zone7' : 'hr_zone7', e.target.value)} /></td>
                  <td><input type="number" className={styles.input} value={activeTab === 'barel' ? data.zone8 || '' : data.hr_zone8 || ''} onChange={(e) => handleChange(activeTab === 'barel' ? 'zone8' : 'hr_zone8', e.target.value)} /></td>
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
