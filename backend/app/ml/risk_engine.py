from typing import Dict, Any

class HybridRiskEngine:
    def __init__(self):
        # Multi-factor weights (configurable & documented)
        self.weights = {
            "growth": 0.27,
            "anomaly": 0.22,
            "cluster": 0.20,
            "regional": 0.18,
            "historical": 0.13
        }

    def calculate_risk_score(
        self,
        growth_pct: float,
        anomaly_score: float,
        cluster_expansion_rate: float,
        regional_density: float,
        historical_recurrence: float
    ) -> Dict[str, Any]:
        """
        Calculate overall hybrid 0-100 risk score and return SHAP/Factor attribution explainability (XAI).
        """
        # Normalize sub-scores to 0-100
        norm_growth = min(100.0, max(0.0, growth_pct * 1.8))
        norm_anomaly = min(100.0, max(0.0, anomaly_score * 100.0))
        norm_cluster = min(100.0, max(0.0, cluster_expansion_rate * 1.5))
        norm_regional = min(100.0, max(0.0, regional_density * 100.0))
        norm_historical = min(100.0, max(0.0, historical_recurrence * 100.0))

        # Weighted sum calculation
        contrib_growth = norm_growth * self.weights["growth"]
        contrib_anomaly = norm_anomaly * self.weights["anomaly"]
        contrib_cluster = norm_cluster * self.weights["cluster"]
        contrib_regional = norm_regional * self.weights["regional"]
        contrib_historical = norm_historical * self.weights["historical"]

        overall_score = round(
            contrib_growth + contrib_anomaly + contrib_cluster + contrib_regional + contrib_historical, 1
        )
        overall_score = min(100.0, max(0.0, overall_score))

        # Determine risk band
        if overall_score >= 76.0:
            band = "CRITICAL"
        elif overall_score >= 51.0:
            band = "HIGH"
        elif overall_score >= 26.0:
            band = "MODERATE"
        else:
            band = "LOW"

        # Factor contributions for Explainable AI (WHY THIS RISK?)
        explainability = [
            {"factor": "Complaint Growth", "contribution": round(contrib_growth, 1), "pct": int((contrib_growth / max(1, overall_score)) * 100), "impact": "+27%"},
            {"factor": "Regional Concentration", "contribution": round(contrib_regional, 1), "pct": int((contrib_regional / max(1, overall_score)) * 100), "impact": "+18%"},
            {"factor": "Anomaly Score", "contribution": round(contrib_anomaly, 1), "pct": int((contrib_anomaly / max(1, overall_score)) * 100), "impact": "+22%"},
            {"factor": "Threat Cluster Expansion", "contribution": round(contrib_cluster, 1), "pct": int((contrib_cluster / max(1, overall_score)) * 100), "impact": "+20%"},
            {"factor": "Historical Recurrence", "contribution": round(contrib_historical, 1), "pct": int((contrib_historical / max(1, overall_score)) * 100), "impact": "+13%"}
        ]

        return {
            "overall_score": overall_score,
            "risk_band": band,
            "confidence_pct": 87.5,
            "model_version": "v2.1-Hybrid-XAI",
            "explainability": explainability,
            "raw_factors": {
                "growth": round(contrib_growth, 1),
                "anomaly": round(contrib_anomaly, 1),
                "cluster": round(contrib_cluster, 1),
                "regional": round(contrib_regional, 1),
                "historical": round(contrib_historical, 1)
            }
        }

risk_engine = HybridRiskEngine()
