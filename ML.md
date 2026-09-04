# CYBERPREDICT X — Machine Learning & Analytics Architecture

CYBERPREDICT X incorporates statistical and machine learning engines for predictive cybercrime intelligence.

---

## 1. Anomaly Detection Engine
- **Algorithm**: Isolation Forest (`scikit-learn`) & Rolling Z-Score Baseline.
- **Features**: Daily complaint volume, financial loss velocity, regional concentration index.
- **Output**: Anomaly score (0.0 to 1.0), status (`DETECTED`), deviation ratio from baseline.

## 2. Threat Clustering Engine
- **Algorithm**: DBSCAN (`scikit-learn`) & Modus Operandi Pattern Matching.
- **Features**: Modus operandi text vectorization, payment method, geographic proximity, temporal window.
- **Output**: Signature threat cluster code (e.g. `TC-IN-2026-1042`), cluster growth rate, member complaint IDs.

## 3. Time-Series Forecasting Engine
- **Algorithm**: Exponential Smoothing & Statsmodels Holt-Winters / ARIMA.
- **Horizons**: 24 Hours, 7 Days, 30 Days.
- **Output**: Predicted volume, upper/lower confidence bounds, forecast trend indicator.

## 4. Risk Engine & Explainability (SHAP Factors)
- **Score Scale**: 0–25 (LOW), 26–50 (MODERATE), 51–75 (HIGH), 76–100 (CRITICAL).
- **Explainability**: SHAP factor breakdown identifying top drivers (+Abnormal Growth, +Regional Concentration, +Expanding Cluster, +Repeated Payment Indicator).
