Demo Video Link: https://drive.google.com/file/d/1hIWKAxvRz-BBfEHNyJAXlEW6s6sErWWR/view?usp=sharing

#  LoanSphere — Loan Management System

A full-stack MERN + Next.js loan management platform with a borrower portal and operations dashboard.

---

##  Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Backend    | Node.js + Express.js + TypeScript   |
| Database   | MongoDB Atlas + Mongoose            |
| Auth       | JWT + bcrypt                        |
| File Upload| Multer (local disk, PDF/JPG/PNG)    |

---

##  Project Structure

```
lms/
├── backend/
│   ├── src/
│   │   ├── config/       # DB connection
│   │   ├── controllers/  # auth, borrower, ops
│   │   ├── middleware/   # JWT auth, RBAC, multer
│   │   ├── models/       # User, BorrowerProfile, Loan
│   │   ├── routes/       # auth, borrower, ops
│   │   ├── seed/         # seed.ts (pre-creates all roles)
│   │   ├── types/        # shared TypeScript types
│   │   ├── utils/        # bre.ts, jwt.ts, loanCalc.ts
│   │   └── index.ts      # Express app entry
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── (auth)/         # login, register (auth group layout)
    │   │   ├── borrower/       # dashboard, personal-details, upload, loan-config
    │   │   ├── ops/            # sales, sanction, disbursement, collection
    │   │   ├── layout.tsx      # root layout + AuthProvider + Toaster
    │   │   └── page.tsx        # smart redirect based on role
    │   ├── hooks/useAuth.tsx   # auth context
    │   ├── lib/api.ts          # axios instance with JWT interceptor
    │   ├── lib/loanCalc.ts     # SI calculation (shared with backend logic)
    │   └── types/index.ts      # TypeScript types
    ├── .env.example
    ├── package.json
    └── tailwind.config.js
```

---

##  Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd lms
```

### 2. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://cloud.mongodb.com) and create a free cluster
2. Create a database user with read/write access
3. Whitelist your IP (or allow all: `0.0.0.0/0` for dev)
4. Copy the connection string — looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<dbname>?retryWrites=true&w=majority
   ```

### 3. Backend Setup

```bash
cd backend
cp .env.example .env
# Fill in your MONGODB_URI and JWT_SECRET in .env
npm install
npm run seed      # Creates one user per role
npm run dev       # Starts backend on http://localhost:5000
```

### 4. Frontend Setup

```bash
cd frontend
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:5000/api (default, no change needed for local)
npm install
npm run dev       # Starts frontend on http://localhost:3000
```

---

##  Login Credentials (after seeding)

| Role         | Email                   | Password        |
|--------------|-------------------------|-----------------|
| Admin        | admin@lms.com           | Admin@123       |
| Sales        | sales@lms.com           | Sales@123       |
| Sanction     | sanction@lms.com        | Sanction@123    |
| Disbursement | disbursement@lms.com    | Disburse@123    |
| Collection   | collection@lms.com      | Collect@123     |
| Borrower     | borrower@lms.com        | Borrower@123    |

>  Credentials are also available as quick-fill buttons on the login page.

---

##  Loan Lifecycle

```
APPLIED → SANCTIONED → DISBURSED → CLOSED
           ↓
        REJECTED
```

| Transition         | Triggered By       | Module       |
|--------------------|--------------------|--------------|
| → applied          | Borrower (apply)   | Borrower Portal |
| applied → sanctioned | Sanction Officer | Sanction     |
| applied → rejected | Sanction Officer   | Sanction     |
| sanctioned → disbursed | Disbursal Officer | Disbursement |
| disbursed → closed | Auto (on full payment) | Collection |

---

##  Business Rule Engine (BRE)

BRE runs **server-side only** on personal details submission:

| Rule        | Condition                     |
|-------------|-------------------------------|
| Age         | Must be 23–50 years           |
| Salary      | Min ₹25,000/month             |
| PAN         | Must match `[A-Z]{5}[0-9]{4}[A-Z]` |
| Employment  | Cannot be Unemployed          |

All rules must pass to proceed. Clear error messages are shown per failed rule.

---

##  Loan Math

```
SI = (P × R × T) / (365 × 100)
Total Repayment = P + SI

Where:
  P = Principal (₹50,000 – ₹5,00,000)
  R = 12% p.a. (fixed)
  T = Tenure in days (30 – 365)
```

---

##  RBAC (Role-Based Access Control)

- **Enforced on both frontend AND backend**
- Each ops role sees only their module in the sidebar
- Backend middleware (`authorize(...roles)`) rejects unauthorized requests with **403 Forbidden**
- Borrowers cannot access any ops routes (403)
- Executives cannot access borrower routes (403)

---

##  API Reference

### Auth
| Method | Endpoint           | Access  |
|--------|--------------------|---------|
| POST   | /api/auth/register | Public  |
| POST   | /api/auth/login    | Public  |
| GET    | /api/auth/me       | Any authenticated |

### Borrower
| Method | Endpoint                          | Access   |
|--------|-----------------------------------|----------|
| GET    | /api/borrower/profile             | Borrower |
| POST   | /api/borrower/personal-details    | Borrower |
| POST   | /api/borrower/upload-salary-slip  | Borrower |
| POST   | /api/borrower/apply               | Borrower |
| GET    | /api/borrower/loans               | Borrower |

### Operations
| Method | Endpoint                                          | Access              |
|--------|---------------------------------------------------|---------------------|
| GET    | /api/ops/sales/leads                              | Admin, Sales        |
| GET    | /api/ops/sanction/loans                           | Admin, Sanction     |
| PATCH  | /api/ops/sanction/loans/:id/approve               | Admin, Sanction     |
| PATCH  | /api/ops/sanction/loans/:id/reject                | Admin, Sanction     |
| GET    | /api/ops/disbursement/loans                       | Admin, Disbursement |
| PATCH  | /api/ops/disbursement/loans/:id/disburse          | Admin, Disbursement |
| GET    | /api/ops/collection/loans                         | Admin, Collection   |
| POST   | /api/ops/collection/loans/:id/payments            | Admin, Collection   |
| GET    | /api/ops/loans                                    | Admin only          |

---

##  MongoDB Collections

| Collection       | Purpose                              |
|------------------|--------------------------------------|
| `users`          | All users across all roles           |
| `borrowerprofiles` | Personal details + salary slip + BRE status |
| `loans`          | Loan applications, status, payments  |

---
