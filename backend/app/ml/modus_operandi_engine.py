import re
from typing import Dict, List, Any

MODUS_OPERANDI_CATALOG = [
    {"name": "UPI Impersonation", "category": "Financial Fraud", "keywords": ["upi", "collect request", "qr code", "gpay", "phonepe", "paytm", "pin"], "channel": "Messaging", "payment": "UPI", "risk_index": 88.0},
    {"name": "Digital Arrest Scam", "category": "Extortion / Cyber Threat", "keywords": ["cbi", "cyber police", "digital arrest", "skype call", "video call", "money laundering"], "channel": "Video Call", "payment": "Bank Transfer", "risk_index": 95.0},
    {"name": "Phishing & Fake Banking", "category": "Credential Theft", "keywords": ["bank update", "kyc", "netbanking", "login", "password", "apk", "link"], "channel": "SMS / Web", "payment": "Bank Transfer", "risk_index": 82.0},
    {"name": "Investment & Crypto Scam", "category": "Financial Fraud", "keywords": ["telegram group", "stock market", "crypto investment", "10x return", "trading app"], "channel": "Telegram", "payment": "Crypto / UPI", "risk_index": 91.0},
    {"name": "Job & Part-Time Scam", "category": "Financial Fraud", "keywords": ["youtube review", "like video", "prepaid task", "work from home", "telegram manager"], "channel": "Messaging", "payment": "UPI", "risk_index": 78.0},
    {"name": "Fake Customer Support", "category": "Financial Fraud", "keywords": ["customer care", "toll free", "google map search", "refund", "refund link"], "channel": "Phone Call", "payment": "UPI / Remote App", "risk_index": 80.0},
    {"name": "Romance & Sextortion", "category": "Cyber Extortion", "keywords": ["video call", "facebook friend", "nude recording", "blackmail", "pay money"], "channel": "Social Media", "payment": "UPI", "risk_index": 85.0},
    {"name": "Courier & Customs Fraud", "category": "Extortion", "keywords": ["fedex", "customs clearance", "illegal parcel", "drugs found", "mumbai police"], "channel": "Phone Call", "payment": "Bank Transfer", "risk_index": 92.0},
    {"name": "Instant Loan App Fraud", "category": "Extortion", "keywords": ["loan app", "nbfc", "contacts access", "morph photos", "extortion call"], "channel": "Mobile App", "payment": "Bank Transfer", "risk_index": 86.0},
    {"name": "Account Takeover / SIM Swap", "category": "Identity Theft", "keywords": ["sim swap", "otp", "whatsapp hack", "facebook hack", "esim request"], "channel": "Telecom / SMS", "payment": "N/A", "risk_index": 84.0}
]

class ModusOperandiEngine:
    def extract_modus_operandi(self, narrative: str) -> Dict[str, Any]:
        """
        Classify cybercrime complaint text into structured Modus Operandi pattern.
        """
        text = narrative.lower()
        matched_mo = None
        highest_matches = 0

        for mo in MODUS_OPERANDI_CATALOG:
            matches = sum(1 for kw in mo['keywords'] if kw in text)
            if matches > highest_matches:
                highest_matches = matches
                matched_mo = mo

        if not matched_mo:
            matched_mo = MODUS_OPERANDI_CATALOG[0]  # Default fallback

        # Extract potential identifiers
        upis = re.findall(r'[\w\.\-]+@[\w\-]+', text)
        mobiles = re.findall(r'\b[6-9]\d{9}\b', text)
        urls = re.findall(r'https?://[^\s]+', text)

        return {
            "modus_operandi": matched_mo['name'],
            "category": matched_mo['category'],
            "risk_index": matched_mo['risk_index'],
            "channel": matched_mo['channel'],
            "payment_method": matched_mo['payment'],
            "detected_keywords": [kw for kw in matched_mo['keywords'] if kw in text],
            "extracted_entities": {
                "upis": upis,
                "mobiles": mobiles,
                "urls": urls
            }
        }

    def get_all_patterns(self) -> List[Dict[str, Any]]:
        return MODUS_OPERANDI_CATALOG

mo_engine = ModusOperandiEngine()
