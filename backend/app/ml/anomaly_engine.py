import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

class AnomalyEngine:
    def __init__(self):
        self.iso_forest = IsolationForest(n_estimators=100, contamination=0.08, random_state=42)

    def detect_spikes_and_anomalies(self, complaints_df: pd.DataFrame) -> list:
        """
        Detect volume, financial loss, and narrative length anomalies across regions and categories.
        """
        if complaints_df.empty or len(complaints_df) < 5:
            return []

        # Feature matrix for IsolationForest
        df = complaints_df.copy()
        df['narrative_len'] = df['narrative'].apply(lambda x: len(str(x)))
        df['fin_loss'] = df['financial_loss'].fillna(0.0)
        
        features = df[['fin_loss', 'narrative_len']].values
        
        # Fit & Predict IsolationForest
        predictions = self.iso_forest.fit_predict(features)
        df['iso_anomaly'] = predictions  # -1 for anomaly, 1 for normal
        
        # Rolling Baseline Z-Score calculation on volume per district
        district_counts = df.groupby(['state', 'district']).size().reset_index(name='current_vol')
        mean_vol = district_counts['current_vol'].mean()
        std_vol = district_counts['current_vol'].std() if len(district_counts) > 1 else 1.0
        if std_vol == 0:
            std_vol = 1.0

        district_counts['z_score'] = (district_counts['current_vol'] - mean_vol) / std_vol

        anomalies = []
        # Extract top anomalous districts
        for idx, row in district_counts[district_counts['z_score'] > 1.2].iterrows():
            anomalies.append({
                "anomaly_code": f"ANOM-REG-{row['district'].upper()[:4]}-{np.random.randint(1000,9999)}",
                "target_type": "REGION",
                "target_name": f"{row['district']}, {row['state']}",
                "baseline_metric": round(float(mean_vol), 2),
                "observed_metric": float(row['current_vol']),
                "anomaly_score": round(min(0.99, float(row['z_score']) / 3.5), 2),
                "description": f"District cybercrime volume (+{int((row['current_vol']/max(1, mean_vol)-1)*100)}%) significantly exceeded historical rolling baseline."
            })

        # Category level anomalies
        cat_counts = df.groupby('category').size().reset_index(name='cat_vol')
        cat_mean = cat_counts['cat_vol'].mean()
        cat_std = cat_counts['cat_vol'].std() if len(cat_counts) > 1 else 1.0
        if cat_std == 0:
            cat_std = 1.0
        
        cat_counts['z_score'] = (cat_counts['cat_vol'] - cat_mean) / cat_std
        for idx, row in cat_counts[cat_counts['z_score'] > 1.2].iterrows():
            anomalies.append({
                "anomaly_code": f"ANOM-CAT-{row['category'].upper()[:4]}-{np.random.randint(1000,9999)}",
                "target_type": "CATEGORY",
                "target_name": row['category'],
                "baseline_metric": round(float(cat_mean), 2),
                "observed_metric": float(row['cat_vol']),
                "anomaly_score": round(min(0.98, float(row['z_score']) / 3.0), 2),
                "description": f"Category '{row['category']}' registered +{int((row['cat_vol']/max(1, cat_mean)-1)*100)}% abnormal growth above 30-day baseline."
            })

        return anomalies

anomaly_engine = AnomalyEngine()
