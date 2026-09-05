"""
====================================================================================================
SIH PROBLEM STATEMENT 26184: PREDICTIVE CYBERCRIME ANALYTICS & CASH-OUT FORECASTING ENGINE
MODULE 2: STANDALONE INFERENCE & CASHOUT FORECASTING ENGINE (predict_sih26184_model.py)
====================================================================================================
Usage in Python Backend (FastAPI / Flask / Django / Script):
------------------------------------------------------------
    from predict_sih26184_model import CybercrimeCashoutPredictor

    predictor = CybercrimeCashoutPredictor("sih26184_mule_cashout_model.pkl")
    result = predictor.predict({
        "complaint_id": "NCRP-2026-WB-883921",
        "amount": 185000.0,
        "format": "Wire",
        "from_bank": 27,
        "to_bank": 3,
        "latitude": 22.5726,
        "longitude": 88.3639,
        "bank_affinity": "State Bank of India",
        "hour": 16
    })

Usage from Command Line (CLI):
------------------------------
    python predict_sih26184_model.py --amount 150000 --bank "State Bank of India" --lat 22.5726 --lon 88.3639
====================================================================================================
"""

import os
import sys
import math
import time
import json
import hashlib
import argparse
import joblib
import numpy as np
import pandas as pd


def haversine(lat1, lon1, lat2, lon2):
    """Numerically stable great-circle distance calculation in km."""
    try:
        R = 6371.0
        dlat = math.radians(float(lat2) - float(lat1))
        dlon = math.radians(float(lon2) - float(lon1))
        a = (math.sin(dlat / 2.0)**2 + 
             math.cos(math.radians(float(lat1))) * math.cos(math.radians(float(lat2))) * math.sin(dlon / 2.0)**2)
        a_clamped = min(1.0, max(0.0, a))
        return R * 2.0 * math.atan2(math.sqrt(a_clamped), math.sqrt(max(0.0, 1.0 - a_clamped)))
    except Exception:
        return 9999.0


class CybercrimeCashoutPredictor:
    """
    Self-contained, production-grade inference engine for SIH Problem Statement 26184.
    """
    def __init__(self, model_bundle_path="sih26184_mule_cashout_model.pkl"):
        self.model_bundle_path = model_bundle_path
        self.model = None
        self.feature_cols = []
        self.graph_meta = {}
        self.geo_nodes = []
        self._load_bundle()

    def _load_bundle(self):
        if not os.path.exists(self.model_bundle_path):
            raise FileNotFoundError(
                f"[Predictor Error] Master model bundle '{self.model_bundle_path}' not found. "
                f"Please run 'python train_sih26184_model.py' to generate the trained model."
            )

        bundle = joblib.load(self.model_bundle_path)
        self.model = bundle.get("mule_model", bundle.get("model"))
        self.feature_cols = bundle.get("mule_features", bundle.get("feature_cols", []))
        self.paysim_model = bundle.get("paysim_model")
        self.paysim_features = bundle.get("paysim_features", [])
        self.graph_meta = bundle.get("graph_metadata", {})
        self.geo_nodes = bundle.get("geo_nodes", [])
        print(f"[CybercrimePredictor] Loaded model ({len(self.feature_cols)} features, {len(self.geo_nodes):,} spatial nodes).")

    def predict(self, input_dict):
        """
        Executes end-to-end forecasting:
        1. Feature Transformation from Graph Metadata
        2. Mule / Laundering Probability Scoring
        3. Geospatial ATM Hotspot & Transit ETA Forecasting
        4. Explainable AI (XAI) Decision Breakdown
        5. Tamper-Evident SHA-256 Digital Forensic Hash
        """
        start_t = time.time()
        complaint_id = str(input_dict.get("complaint_id", f"NCRP-{int(time.time())}"))
        amount = float(input_dict.get("amount", 50000.0))
        lat = float(input_dict.get("latitude", 22.5726))
        lon = float(input_dict.get("longitude", 88.3639))
        bank_affinity = str(input_dict.get("bank_affinity", input_dict.get("mule_bank", "State Bank of India")))
        hour = int(input_dict.get("hour", time.localtime().tm_hour))

        from_acc = str(input_dict.get("victim_account", "ACC_ORIG"))
        to_acc = str(input_dict.get("mule_account", "ACC_DEST"))
        from_bank = float(input_dict.get("from_bank", 1))
        to_bank = float(input_dict.get("to_bank", 2))
        fmt = str(input_dict.get("format", "ACH"))

        # 1. Feature Engineering
        row = {col: 0.0 for col in self.feature_cols}
        row["Amount Paid"] = amount
        row["Amount Received"] = amount
        row["log_amount_paid"] = np.log1p(max(0.0, amount))
        row["log_amount_received"] = np.log1p(max(0.0, amount))
        row["amount_discrepancy"] = 0.0
        row["abs_amount_discrepancy"] = 0.0
        row["amount_ratio"] = 1.0

        row["From Bank"] = from_bank
        row["To Bank"] = to_bank
        row["is_cross_bank"] = 1.0 if from_bank != to_bank else 0.0

        # Graph degrees
        out_deg_map = self.graph_meta.get("account_out_degree", {})
        in_deg_map = self.graph_meta.get("account_in_degree", {})
        out_deg = float(out_deg_map.get(from_acc, 1.0))
        in_deg = float(in_deg_map.get(to_acc, 1.0))

        row["out_degree"] = out_deg
        row["in_degree"] = in_deg
        row["fan_in_ratio"] = in_deg / (out_deg + 1.0)
        row["fan_out_ratio"] = out_deg / (in_deg + 1.0)
        row["total_degree"] = out_deg + in_deg

        # Entity resolution
        acc_to_ent = self.graph_meta.get("acc_to_entity", {})
        ent_counts = self.graph_meta.get("entity_account_count", {})
        from_ent = acc_to_ent.get(from_acc, "UNKNOWN")
        to_ent = acc_to_ent.get(to_acc, "UNKNOWN")

        row["is_same_entity"] = 1.0 if (from_ent == to_ent and from_ent != "UNKNOWN") else 0.0
        row["from_entity_account_count"] = float(ent_counts.get(from_ent, 1.0))
        row["to_entity_account_count"] = float(ent_counts.get(to_ent, 1.0))

        # Temporal
        row["hour"] = float(hour)
        row["day"] = float(input_dict.get("day", 1))
        row["dayofweek"] = float(input_dict.get("dayofweek", 0))
        row["is_weekend"] = 1.0 if row["dayofweek"] in [5, 6] else 0.0
        row["is_night_transaction"] = 1.0 if hour in [22, 23, 0, 1, 2, 3, 4, 5] else 0.0

        # Channel
        fmt_col = f"format_{fmt.replace(' ', '_')}"
        if fmt_col in row:
            row[fmt_col] = 1.0

        row["is_high_risk_cashout_channel"] = 1.0 if fmt in ["Cash", "Wire"] else 0.0

        X_df = pd.DataFrame([row])[self.feature_cols].fillna(0.0).astype(float)

        # 2. ML Inference (Mule / Cash-Out Risk)
        raw_prob = float(self.model.predict_proba(X_df)[0][1])
        mule_prob = round(float(np.clip(raw_prob, 0.0001, 0.9999)), 4)

        if mule_prob >= 0.75:
            urgency = "CRITICAL (0-1 Hour Golden Window)"
        elif mule_prob >= 0.45:
            urgency = "HIGH (1-4 Hours Window)"
        else:
            urgency = "STANDARD MONITORING"

        # 3. Geospatial ATM Cash-Out Forecasting
        hotspots = self._forecast_atms(lat, lon, bank_affinity, hour, max_radius_km=15.0, top_k=5)

        # 4. Explainable AI (XAI) Decision Breakdown
        xai_breakdown = self._explain_decision(X_df)

        # 5. Tamper-Evident SHA-256 Digital Forensic Signature
        ts = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        hash_payload = f"{complaint_id}-{amount}-{mule_prob}-{lat}-{lon}-{ts}"
        evidence_hash = hashlib.sha256(hash_payload.encode()).hexdigest()

        latency_ms = round((time.time() - start_t) * 1000.0, 2)

        return {
            "complaint_id": complaint_id,
            "timestamp_utc": ts,
            "tamper_proof_evidence_hash": evidence_hash,
            "risk_assessment": {
                "mule_laundering_probability": mule_prob,
                "urgency_classification": urgency,
                "is_mule_layering_detected": bool(mule_prob >= 0.45),
                "beneficiary_bank": bank_affinity,
                "defrauded_amount": amount
            },
            "forecasted_cashout_hotspots": hotspots,
            "explainable_ai_rationale": xai_breakdown,
            "recommended_interventions": [
                f"Trigger immediate CFCFRMS freeze on beneficiary account across {bank_affinity} network.",
                f"Deploy Law Enforcement Quick Response Patrol to Top 1 predicted ATM within {hotspots[0]['estimated_arrival_eta_mins'] if hotspots else 10} minutes.",
                f"Place high-frequency transaction alerts on CCTV network for top 3 flagged ATMs."
            ],
            "inference_latency_ms": latency_ms
        }

    def _forecast_atms(self, origin_lat, origin_lon, bank_affinity, current_hour, max_radius_km=15.0, top_k=5):
        if not self.geo_nodes:
            return []

        all_cands = []
        hour_multiplier = 1.2 if (8 <= current_hour <= 22) else 0.85

        for node in self.geo_nodes:
            if node.get("fclass") != "atm":
                continue

            dist = haversine(origin_lat, origin_lon, node["latitude"], node["longitude"])
            spatial_kernel = 1.0 / (1.0 + (dist / 2.5)**1.5)
            affinity = 1.65 if (bank_affinity and bank_affinity.lower() in str(node["name"]).lower()) else 1.0

            raw_score = spatial_kernel * affinity * hour_multiplier * 0.82
            posterior_prob = round(float(np.clip(raw_score + 0.12, 0.05, 0.98)), 4)
            transit_eta = max(4, int(round((dist / 25.0) * 60)))
            priority = "CRITICAL" if posterior_prob >= 0.70 else ("HIGH" if posterior_prob >= 0.50 else "MEDIUM")

            cand = {
                "atm_id": node["osm_id"],
                "atm_name": node["name"],
                "latitude": round(node["latitude"], 6),
                "longitude": round(node["longitude"], 6),
                "distance_km": round(dist, 2),
                "estimated_arrival_eta_mins": transit_eta,
                "cashout_risk_score": posterior_prob,
                "action_priority": priority
            }
            all_cands.append((dist, cand))

        # Filter within radius
        in_radius = [c[1] for c in all_cands if c[0] <= max_radius_km]
        if not in_radius:
            all_cands.sort(key=lambda x: x[0])
            return [c[1] for c in all_cands[:top_k]]

        in_radius.sort(key=lambda x: x["cashout_risk_score"], reverse=True)
        return in_radius[:top_k]

    def _explain_decision(self, X_df):
        name_map = {
            "format_ACH": "High-Velocity ACH Transfer Channel",
            "format_Cash": "Immediate Cash-Out Withdrawal Channel",
            "format_Wire": "Cross-Border / Inter-Bank Wire Hop",
            "is_same_entity": "Same Entity Circular Layering Pattern",
            "is_cross_bank": "Inter-Bank Mule Hop",
            "fan_in_ratio": "Smurfing Fan-In Flow Concentration",
            "fan_out_ratio": "Rapid Scatter-Gather Fan-Out",
            "amount_discrepancy": "Inter-Hop Balance Discrepancy",
            "is_night_transaction": "Off-Hours Night Velocity Spike",
            "is_high_risk_cashout_channel": "Critical Cash-Out Indicator"
        }
        desc_map = {
            "format_ACH": "Matches automated laundering batch processing pattern.",
            "format_Cash": "Indicates physical cash drainage at terminal ATM point.",
            "format_Wire": "High value rapid fund movement across banking boundaries.",
            "is_same_entity": "Entity routes funds between controlled accounts to disguise origin.",
            "is_cross_bank": "Inter-bank transfers exploit cross-jurisdiction reporting delays.",
            "fan_in_ratio": "Multiple sender accounts funnelling into single aggregator mule."
        }

        if hasattr(self.model, "feature_importances_"):
            imps = self.model.feature_importances_
            top_indices = np.argsort(imps)[::-1][:4]
            results = []
            for idx in top_indices:
                col = self.feature_cols[idx]
                results.append({
                    "factor": name_map.get(col, col.replace("_", " ").title()),
                    "feature_weight": round(float(imps[idx]), 4),
                    "impact_direction": "INCREASES_RISK",
                    "description": desc_map.get(col, "High predictive factor identified by gradient boosted trees.")
                })
            return results

        return []


def cli_main():
    parser = argparse.ArgumentParser(description="SIH PS-26184 Cybercrime Cash-Out Forecaster")
    parser.add_argument("--amount", type=float, default=150000.0, help="Defrauded amount in INR")
    parser.add_argument("--bank", type=str, default="State Bank of India", help="Target beneficiary bank")
    parser.add_argument("--lat", type=float, default=22.5726, help="Incident latitude")
    parser.add_argument("--lon", type=float, default=88.3639, help="Incident longitude")
    parser.add_argument("--format", type=str, default="ACH", help="Transaction channel (ACH/Wire/Cash)")
    parser.add_argument("--model", type=str, default="sih26184_mule_cashout_model.pkl", help="Model bundle path")
    args = parser.parse_args()

    predictor = CybercrimeCashoutPredictor(args.model)
    res = predictor.predict({
        "amount": args.amount,
        "bank_affinity": args.bank,
        "latitude": args.lat,
        "longitude": args.lon,
        "format": args.format
    })
    print("\n" + "=" * 80)
    print(" [SIH PS-26184] PROACTIVE CYBERCRIME INTELLIGENCE & CASHOUT FORECAST")
    print("=" * 80)
    print(json.dumps(res, indent=2))
    print("=" * 80)


if __name__ == "__main__":
    cli_main()
