# 🏙️ Maintenance Tracker

A full-stack web application that allows citizens to report city infrastructure issues and enables municipalities to manage and track them efficiently.

🌐 **Live Demo:** [maintenance-tracker-two.vercel.app](https://maintenance-tracker-two.vercel.app)  
---

## ✨ Features

### Citizen
- Report infrastructure issues (lighting, roads, water pipes, etc.)
- Upload images via Cloudinary
- Track the status of your own reports
- Edit or update submitted issues

### Admin
- View and manage all reported issues across all areas
- Filter by status, area, type, and search by keyword
- Update issue status (Pending → In Progress → Completed)
- Manage users and view issue counts per user

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | MongoDB + Mongoose |
| Auth | JWT |
| Validation | Zod |
| Styling | Tailwind CSS |
| Data Fetching | TanStack Query (React Query) |
| Image Upload | Cloudinary |
| Forms | React Hook Form |
| Deployment | Vercel + MongoDB Atlas |

---

## 📁 Project Structure

```
app/
├── api/
│   ├── auth/         → register, login, me
│   ├── issues/       → CRUD + status management
│   ├── users/        → admin user management
│   └── uploads/      → Cloudinary image upload
├── admin/            → admin dashboard pages
├── issues/           → citizen issue pages
├── my-issues/        → citizen issue list
├── components/       → reusable UI components
└── providers/        → auth context + API fetcher
models/               → Mongoose schemas (User, Issue)
utils/                → auth, validation, response helpers, logger
lib/                  → DB connection
```

---

## 👥 Roles & Permissions

| Action | Admin | Citizen |
|--------|-------|---------|
| View all issues | ✅ | ❌ |
| View own issues | ✅ | ✅ |
| Create issue | ✅ | ✅ |
| Edit own issue | ✅ | ✅ |
| Change issue status | ✅ | ❌ |
| Delete issue | ✅ | ❌ |
| Manage users | ✅ | ❌ |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Cloudinary account

### Installation

```bash
git clone https://github.com/Shatha-AbuShammala/maintenance-tracker.git
cd maintenance-tracker
npm install
cp .env.example .env.local
```

Fill in your `.env.local` with real values, then:

```bash
npm run dev
```

---

## ⚙️ Environment Variables

```env
MONGODB_URI=           # MongoDB Atlas connection string
JWT_SECRET=            # Strong random secret
CLOUDINARY_URL=        # Cloudinary connection URL
PAGE_LIMIT_DEFAULT=10  # Optional: default page size
```

---

## 🔒 Security

- Passwords hashed with bcrypt
- JWT authentication on all protected routes
- Input validation with Zod on every API route
- Role-based access control (Admin / Citizen)
- Image upload restricted to authenticated users only
