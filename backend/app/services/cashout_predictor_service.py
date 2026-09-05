import os
import sys
from typing import Dict, Any, Optional

# Ensure workspace root is in sys.path so we can import predict_sih26184_model
workspace_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
if workspace_root not in sys.path:
    sys.path.insert(0, workspace_root)

# Also check current backend root
backend_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

try:
    from predict_sih26184_model import CybercrimeCashoutPredictor
except ImportError:
    CybercrimeCashoutPredictor = None

class CashoutPredictorService:
    _instance: Optional[CybercrimeCashoutPredictor] = None

    @classmethod
    def get_predictor(cls) -> Optional[CybercrimeCashoutPredictor]:
        if cls._instance is not None:
            return cls._instance

        # Candidate paths for the trained 193MB model bundle
        possible_paths = [
            os.path.join(workspace_root, "sih26184_mule_cashout_model.pkl"),
            os.path.join(backend_root, "sih26184_mule_cashout_model.pkl"),
            "sih26184_mule_cashout_model.pkl",
            "../sih26184_mule_cashout_model.pkl"
        ]

        bundle_path = None
        for path in possible_paths:
            if os.path.exists(path):
                bundle_path = path
                break

        if not bundle_path:
            print(f"[CashoutPredictorService] Model bundle 'sih26184_mule_cashout_model.pkl' not found in {possible_paths}")
            return None

        if CybercrimeCashoutPredictor is None:
            print("[CashoutPredictorService] CybercrimeCashoutPredictor class could not be imported.")
            return None

        try:
            print(f"[CashoutPredictorService] Initializing ML bundle from {bundle_path}...")
            cls._instance = CybercrimeCashoutPredictor(bundle_path)
            print("[CashoutPredictorService] ML predictor ready.")
        except Exception as e:
            print(f"[CashoutPredictorService] Error loading ML bundle: {e}")
            cls._instance = None

        return cls._instance

    @classmethod
    def predict(cls, input_dict: Dict[str, Any]) -> Dict[str, Any]:
        predictor = cls.get_predictor()
        if predictor is None:
            # Fallback in case bundle is not loaded
            amount = float(input_dict.get("amount", 50000.0))
            bank = str(input_dict.get("bank_affinity", "State Bank of India"))
            mule_prob = 0.65 if amount > 100000 else 0.35
            return {
                "complaint_id": str(input_dict.get("complaint_id", "NCRP-FALLBACK")),
                "risk_assessment": {
                    "mule_laundering_probability": mule_prob,
                    "urgency_classification": "HIGH (1-4 Hours Window)" if mule_prob >= 0.45 else "STANDARD MONITORING",
                    "is_mule_layering_detected": mule_prob >= 0.45,
                    "beneficiary_bank": bank,
                    "defrauded_amount": amount
                },
                "forecasted_cashout_hotspots": [],
                "explainable_ai_rationale": [],
                "recommended_interventions": [
                    f"Freeze target account at {bank}.",
                    "Notify local cybercrime rapid response cell."
                ],
                "inference_latency_ms": 1.0
            }

        return predictor.predict(input_dict)

cashout_service = CashoutPredictorService
