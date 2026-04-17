# Student Performance Clustering: Algorithmic Insight

This project uses unsupervised machine learning to segment students based on academic and behavioral metrics.

## 1. Project Overview & Algorithmic Strategy

The goal is to identify distinct groups of students using **K-Means Clustering** on three primary features: `Marks`, `Attendance`, and `StudyHours`. 

### The Core ML Pipeline
*   **Algorithm:** K-Means Clustering was chosen for its efficiency in grouping data into spherical clusters based on spatial density.
*   **Optimal K Selection:** Instead of the subjective Elbow Method, this project uses **Silhouette Score analysis**. This metric evaluates both the cohesion within clusters and the separation between them, ensuring a mathematically rigorous choice for the number of segments.
*   **Dimensionality Reduction:** To visualize clusters derived from 3-dimensional data in a 2D space, we utilize **Principal Component Analysis (PCA)**.

## 2. Data Preparation & Preprocessing

The pipeline handles both synthetic and provided datasets with a focus on statistical integrity.

*   **Handling Missing Data:** Missing values are handled via **Median Imputation**, which maintains the central tendency of the data while being more robust to outliers than mean imputation.
*   **Feature Scaling:** We apply `StandardScaler` to ensure all features have a mean of 0 and a variance of 1.
    *   **Algorithmic Insight:** Feature scaling is **mandatory** for K-Means. Since the algorithm relies on Euclidean distance, features with larger magnitudes (like `Marks`, 0–100) would otherwise dominate features with smaller scales (like `StudyHours`, 0–10).

## 3. Optimal K Selection (The Silhouette Method)

The script identifies the best number of clusters by iterating $K$ from 2 to 10. For each $K$, we set `n_init=10` to run the algorithm with different centroid seeds, preventing the model from getting stuck in local minima.

**Result Interpretation:** The optimal $K$ is selected by maximizing the **Silhouette Coefficient**. A score closer to 1 indicates that the sample is far away from the neighboring clusters, confirming that our student segments are distinct and well-defined.

## 4. Final Model Training & Export

Once the optimal $K$ is determined, the final model is trained. The output is persisted in `clustered_student_performance.csv`, which includes the scaled features and the assigned `Cluster` labels for each student record.

## 5. Visualizing High-Dimensional Clusters

Since we cannot perceive data in 3 dimensions easily, we provide two views:

*   **Metric Interaction:** A scatter plot of `Marks` vs. `Attendance` (`cluster_scatter.png`) shows the relationship between a student's grade and their physical presence in class.
*   **PCA Transformation:** The PCA visualization (`pca_visualization.png`) projects the 3D feature set into two **Principal Components**. 
    *   **Algorithmic Insight:** `PC1` and `PC2` are linear combinations of the original features that capture the maximum possible variance in the data. This allows us to "see" how well-separated the student groups truly are across all combined metrics.

## 6. Execution Instructions

Run the full analysis pipeline using the following command:

```bash
uv run main.py
```
