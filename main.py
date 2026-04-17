import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from sklearn.decomposition import PCA

def load_or_generate_data():
    filename = 'Student_Performance.csv'
    if os.path.exists(filename):
        print(f"Loading data from {filename}")
        return pd.read_csv(filename)
    
    print("CSV not found. Generating synthetic dataset...")
    np.random.seed(42)
    n_samples = 150
    data = {
        'Marks': np.random.randint(0, 101, n_samples),
        'Attendance': np.random.randint(40, 101, n_samples),
        'StudyHours': np.random.uniform(0, 10, n_samples)
    }
    df = pd.DataFrame(data)
    
    # Randomly introduce missing values (approx 5%)
    for col in df.columns:
        mask = np.random.random(n_samples) < 0.05
        df.loc[mask, col] = np.nan
        
    return df

# 1. Load Data
df = load_or_generate_data()

# 2. Preprocessing
print("Handling missing values using median imputation...")
df_processed = df.copy()
for col in df_processed.columns:
    df_processed[col] = df_processed[col].fillna(df_processed[col].median())

print("Scaling features using StandardScaler...")
scaler = StandardScaler()
features = ['Marks', 'Attendance', 'StudyHours']
scaled_values = scaler.fit_transform(df_processed[features])
df_scaled = pd.DataFrame(scaled_values, columns=features)

# 3. Find Optimal K
print("\nIterating K=2 to 10 to find optimal silhouette score...")
scores = []
k_range = range(2, 11)
for k in k_range:
    km = KMeans(n_clusters=k, random_state=42, n_init=10)
    labels = km.fit_predict(df_scaled)
    score = silhouette_score(df_scaled, labels)
    scores.append(score)
    print(f"K={k}, Silhouette Score: {score:.4f}")

best_k = k_range[np.argmax(scores)]
print(f"\nOptimal K identified: {best_k}")

# 4. Model Training
kmeans = KMeans(n_clusters=best_k, random_state=42, n_init=10)
df_scaled['Cluster'] = kmeans.fit_predict(df_scaled)

# 5. Output
print("\nDataset Head (Scaled + Clusters):")
print(df_scaled.head())
print("\nCluster Centers (Scaled):")
print(pd.DataFrame(kmeans.cluster_centers_, columns=features))

# 6. Visualization
print("\nGenerating cluster scatter plot...")
plt.figure(figsize=(10, 6))
sns.scatterplot(data=df_processed, x='Marks', y='Attendance', hue=df_scaled['Cluster'], palette='viridis')
plt.title(f'Student Performance Clusters (K={best_k}): Marks vs Attendance')
plt.grid(True, alpha=0.3)
plt.savefig('cluster_scatter.png')
print("Saved cluster_scatter.png")

# 7. Bonus: PCA
print("Performing PCA for 2D visualization...")
pca = PCA(n_components=2)
pca_data = pca.fit_transform(df_scaled[features])
df_pca = pd.DataFrame(pca_data, columns=['PC1', 'PC2'])
df_pca['Cluster'] = df_scaled['Cluster']

plt.figure(figsize=(10, 6))
sns.scatterplot(data=df_pca, x='PC1', y='PC2', hue='Cluster', palette='Set1')
plt.title('2D PCA Visualization of Student Clusters')
plt.grid(True, alpha=0.3)
plt.savefig('pca_visualization.png')
print("Saved pca_visualization.png")

# 8. Save Output
df_scaled.to_csv('clustered_student_performance.csv', index=False)
print("\nResults saved to 'clustered_student_performance.csv'")
