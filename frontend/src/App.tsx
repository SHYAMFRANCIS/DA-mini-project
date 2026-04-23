import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Activity, Database, BarChart3, ScatterChart, HardDriveDownload } from 'lucide-react';
import Papa from 'papaparse';
import type { ParseResult } from 'papaparse';
import styles from './styles/App.module.css';

// --- Type Definitions ---
interface StudentData {
  Marks: string;
  Attendance: string;
  StudyHours: string;
  Cluster: string;
}

// --- Animation Variants ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  }
};

// --- Components ---

const MetricCard = ({ title, value, icon: Icon }: { title: string, value: string | number, icon: any }) => (
  <motion.div variants={itemVariants} className={`${styles.metricCard} glass-panel`}>
    <div className={styles.sectionTitle} style={{ marginBottom: 0 }}>
      <Icon size={18} color="var(--accent-primary)" />
      <span className={styles.metricLabel}>{title}</span>
    </div>
    <div className={styles.metricValue}>{value}</div>
  </motion.div>
);

const App: React.FC = () => {
  const [data, setData] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/clustered_student_performance.csv');
      const csvText = await response.text();
      
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results: ParseResult<unknown>) => {
          setData(results.data as StudentData[]);
          setLoading(false);
        }
      });
    } catch (error) {
      console.error("Error loading CSV:", error);
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${styles.header} glass-panel`}
      >
        <div className={styles.titleArea}>
          <h1>
            <Activity size={28} color="var(--accent-primary)" />
            Student Clustering Insights
          </h1>
          <p>Unsupervised ML Segmentation (K-Means + PCA)</p>
        </div>
        <div className={styles.badge}>Status: Pipeline Active</div>
      </motion.header>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className={styles.metricsGrid}>
          <MetricCard title="Total Records" value={data.length > 0 ? data.length : "---"} icon={Database} />
          <MetricCard title="Clusters (K)" value="8" icon={BarChart3} />
          <MetricCard title="Algorithm" value="K-Means" icon={Activity} />
          <MetricCard title="Dim Reduction" value="PCA (2 Components)" icon={Activity} />
        </div>

        <div className={styles.grid}>
          <motion.section variants={itemVariants} className={`${styles.chartContainer} glass-panel`}>
            <div className={styles.sectionTitle}>
              <ScatterChart size={20} color="var(--accent-secondary)" />
              Metric Interaction (Marks vs Attendance)
            </div>
            <img src="/cluster_scatter.png" alt="Scatter Plot" className={styles.chartImg} />
            <p className={styles.chartCaption}>Feature scaling ensures uniform impact avoiding Euclidean dominance.</p>
          </motion.section>

          <motion.section variants={itemVariants} className={`${styles.chartContainer} glass-panel`}>
            <div className={styles.sectionTitle}>
              <BarChart3 size={20} color="var(--accent-secondary)" />
              PCA Transformation
            </div>
            <img src="/pca_visualization.png" alt="PCA Plot" className={styles.chartImg} />
            <p className={styles.chartCaption}>2D Projection capturing maximum variance across all metrics.</p>
          </motion.section>

          <motion.section variants={itemVariants} className={`${styles.dataTableWrapper} glass-panel`}>
            <div className={styles.tableHeader}>
              <div className={styles.sectionTitle} style={{ marginBottom: 0 }}>
                <Database size={20} color="var(--accent-primary)" />
                Processed Cluster Data
              </div>
              <button 
                className={styles.btn} 
                onClick={loadData}
                disabled={loading || data.length > 0}
              >
                <HardDriveDownload size={16} />
                {loading ? 'Decrypting Stream...' : data.length > 0 ? 'Stream Loaded' : 'Load CSV Stream'}
              </button>
            </div>
            
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Marks (Scaled)</th>
                  <th>Attendance (Scaled)</th>
                  <th>Study Hours (Scaled)</th>
                  <th>Assigned Cluster</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', opacity: 0.5, padding: '3rem' }}>
                      Awaiting Data Hydration...
                    </td>
                  </tr>
                ) : (
                  data.slice(0, 10).map((row, idx) => (
                    <motion.tr 
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <td>STD_{String(idx + 1000).padStart(4, '0')}</td>
                      <td>{parseFloat(row.Marks).toFixed(4)}</td>
                      <td>{parseFloat(row.Attendance).toFixed(4)}</td>
                      <td>{parseFloat(row.StudyHours).toFixed(4)}</td>
                      <td>
                        <span className={styles.clusterBadge} style={{ color: `hsl(${parseInt(row.Cluster) * 45}, 80%, 60%)` }}>
                          Cluster {row.Cluster}
                        </span>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
            {data.length > 10 && (
              <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Showing 10 of {data.length} records
              </div>
            )}
          </motion.section>
        </div>
      </motion.div>
    </div>
  );
};

export default App;
