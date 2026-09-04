# CYBERPREDICT X — Security & RBAC Model

CYBERPREDICT X implements defense-in-depth security across authentication, authorization, and data privacy layers.

---

## 1. Authentication & Tokens
- Password Hashing: `bcrypt` via Passlib.
- Session Management: Stateless HTTP Bearer JWT tokens signed with SHA-256.
- Token Expiration: Enforced via `ACCESS_TOKEN_EXPIRE_MINUTES`.

## 2. Role-Based Access Control (RBAC)
Supported system roles:
1. `SUPER_ADMIN`: Full administrative access to system settings, user roles, and audit trails.
2. `CYBER_COMMAND_OFFICER`: Senior command view, early warning escalation, and investigation assignment.
3. `INVESTIGATOR`: Case workspace access, complaint review, and evidence linking.
4. `ANALYST`: Predictive model analytics, forecasting, and cluster analysis.
5. `DISTRICT_OFFICER`: Regional jurisdiction risk monitoring and local complaint oversight.
6. `AUDITOR`: Read-only access to audit logs and security compliance reports.

## 3. Data Privacy & PII Masking
- All sensitive identifiers (account numbers, mobile numbers, UPI IDs, emails) are masked in UI representations (`XXXXXXXX7821`).
- Server-side error handling masks raw tracebacks to prevent information leakage (`global_exception_handler`).
