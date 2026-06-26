# Task Management System - Security & Architecture Notes

This document outlines the security architecture and defensive measures implemented in the Task Management System (TMS) to protect user data, ensure secure session handling, and mitigate vulnerabilities described in the **OWASP Top 10**.

---

## 1. Core Security Features

###  Rate Limiting (`rateLimiter.js`)
* **Mechanism:** Implemented using the `express-rate-limit` package.
* **Configuration:** Restricts each unique IP address to a maximum defined by `RATE_LIMIT_MAX` (defaults to **2000 requests per 15 minutes** in production, fully configurable via environment variables).
* **Impact:** Prevents Distributed Denial of Service (DDoS) attempts, brute-force login attacks, and API resource exhaustion. Exceeding this limit returns an HTTP `429 Too Many Requests` status.

###  Input Sanitization & XSS Mitigation (`sanitize.js`)
* **Mechanism:** Custom input middleware leveraging helper regexes and `express-validator` utilities.
* **Configuration:** Strips HTML/XML markup tags (`<script>`, `<iframe>`, etc.) from all string parameters inside the incoming request body (`req.body`) before the controller layer parses them.
* **Impact:** Neutralizes Cross-Site Scripting (XSS) injection vectors, preventing malicious scripts from being persisted in task titles, descriptions, or comment text blocks and executing in other users' browsers.

### Content Security Policy (CSP) & HTTP Security Headers
* **Mechanism:** Programmatically enforced via custom Express middleware on the backend and declared globally inside [staticwebapp.config.json](file:///c:/Users/Uni.ASUS/Documents/WEB%20NEW/Task-Management-System/frontend/staticwebapp.config.json) for the frontend static client.
* **Configuration:** 
  * API endpoints enforce a strict policy: `default-src 'none'; frame-ancestors 'none'; sandbox;`.
  * Swagger UI paths (`/api/docs`) permit UI assets: `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com; img-src 'self' data:;`.
  * Protects pages with standard security headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`, and `Referrer-Policy: strict-origin-when-cross-origin`.
* **Impact:** Safeguards the application against Cross-Site Scripting (XSS), stops UI redressing and clickjacking, blocks content sniffer actions, and passes standard automated security compliance audits.

###  Bcrypt Password Hashing
* **Mechanism:** Employs the industrial-standard `bcryptjs` library.
* **Configuration:** Uses a work factor of **12 salt rounds** to hash all passwords before database storage.
* **Impact:** Protects against offline cracking and rainbow table database attacks. Plain-text passwords are never stored in the database or transmitted in internal application logs.

###  JWT-Based Session Management
* **Mechanism:** JSON Web Tokens (JWT) signed with a cryptographically strong secret key (`JWT_SECRET`) using the `jsonwebtoken` library.
* **Configuration:** Tokens are generated upon successful login, carrying user identifiers (role, ID, email) and a `7-day` expiration window. 
* **Impact:** Clients attach the token to the HTTP `Authorization: Bearer <token>` header for stateless, secure session verification on every private API route.

###  SQL Injection Prevention
* **Mechanism:** All database transactions communicate with PostgreSQL tables via the Supabase Client SDK (`@supabase/supabase-js`).
* **Impact:** Raw SQL queries are avoided. Supabase uses parameterized Remote Procedure Calls (RPC) and parameter binding internally, ensuring user inputs are treated as literal values rather than executable code queries.

###  CORS Configuration
* **Mechanism:** Express uses the `cors` middleware module.
* **Configuration:** Strict resource constraints configured to allow requests **only** from the registered `CLIENT_URL` (typically `http://localhost:5173` in local development and the static web app domain in production).
* **Impact:** Blocks unauthorized cross-origin requests from external malicious web applications.

---

## 2. OWASP Top 10 Mitigation Mapping

| OWASP Category | Threat Description | TMS Implementation & Defenses |
| :--- | :--- | :--- |
| **A01:2021 - Broken Access Control** | Users accessing resources or features outside their permission boundaries. | Enforces strict backend route gates via `rbac.middleware.js` checking decoded JWT roles. Collaborators are blocked from user management, project modification, and updating tasks not assigned to them (API throws `403 Forbidden`). |
| **A02:2021 - Cryptographic Failures** | Data transit exposure or weak password hashing. | All traffic runs over secure HTTPS/TLS. User passwords are encrypted with `bcrypt` (12 rounds) and JWT signatures verify authenticity. |
| **A03:2021 - Injection** | Malicious inputs executed as SQL, OS commands, or HTML scripts. | Supabase client parameterizes all relational queries, eliminating SQL injection. HTML tag-stripping middleware (`sanitize.js`) filters script elements to prevent XSS injection. |
| **A04:2021 - Insecure Design** | Architectural workflow flaws. | Users created by admins receive a temporary password and are locked under a `must_reset_password` flag, forcing a mandatory password update before accessing system boards. |
| **A05:2021 - Security Misconfiguration** | Unsecured debug endpoints or loose CORS policies. | Swagger API documentation (`/api/docs`) is restricted. Strict CORS limits specify allowed domains, and error payloads are stripped of raw stack traces. |
| **A06:2021 - Vulnerable Components** | Relying on outdated dependencies. | Dependencies are tracked via standard lockfiles (`package-lock.json`) and validated during deployment pipelines. |
| **A07:2021 - Identification & Auth** | Weak passwords or session hijacking. | Enforces strict password complexity checks (uppercase, lowercase, digits, and symbols required) during reset/creation. JWT tokens expire automatically after 7 days. |
| **A08:2021 - Software/Data Integrity** | Processing untrusted data formats. | Standard file uploads for comments are stored in public Supabase buckets with storage policy restrictions. Payload shapes are validated at the Express router layer. |
| **A09:2021 - Security Logging Failure** | Critical administrative events go unlogged. | Administrative audits (e.g. user creations, deactivations, password resets) generate persistent records in the `Audit_Logs` table, viewable dynamically by system administrators. |
| **A10:2021 - Server-Side Request Forgery** | Server executing requests to arbitrary URLs. | Backend endpoints do not accept client-controlled redirect URLs or fetch arbitrary third-party endpoints. |
