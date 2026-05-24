# Scaler — Open Source Scheduling Platform

> A full-stack Cal.com-inspired scheduling platform built with **Next.js 15**, **Express.js**, **Prisma ORM**, and **SQLite**.

**Live Demo:** [scaler-iota.vercel.app](https://scaler-iota.vercel.app)


![Scaler Banner](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![Express](https://img.shields.io/badge/Express-4.x-green?style=for-the-badge&logo=express)
![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748?style=for-the-badge&logo=prisma)
![SQLite](https://img.shields.io/badge/SQLite-3-blue?style=for-the-badge&logo=sqlite)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

---

## ✨ Features

### 🧑‍💼 Admin Dashboard
- **Event Types** — Create, edit, delete, toggle active/inactive, copy booking link
- **Bookings** — View upcoming, past, and cancelled bookings with one-click cancel
- **Availability** — Set your weekly availability schedule (days + time ranges)

### 🌐 Public Booking Flow
- **User Profile Page** — Shows all active event types with durations
- **Event Booking Page** — Interactive calendar + time slot picker
- **Booking Form** — Name, email, notes with client-side validation
- **Confirmation Page** — Shows booking summary after successful booking

### 🎨 Design
- Premium dark sidebar layout with smooth animations
- Glassmorphism modal, skeleton loaders, toast notifications
- Fully responsive — works on mobile and desktop
- Inter font + custom CSS design system (no Tailwind)

---

## 🗂️ Project Structure

```
scaler-main/
├── backend/                  # Express.js REST API
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema (User, EventType, Booking, Availability)
│   │   └── seed.js           # Sample data seeder
│   ├── src/
│   │   ├── controllers/      # Business logic (user, eventType, booking, availability)
│   │   ├── middleware/        # Error handler
│   │   ├── routes/           # API routes
│   │   └── index.js          # Express server entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/                 # Next.js 15 App Router
    ├── src/
    │   ├── app/
    │   │   ├── (admin)/      # Admin pages (event-types, bookings, availability)
    │   │   ├── booking/      # Public booking flow ([username]/[slug])
    │   │   └── globals.css   # Full design system (~1700 lines)
    │   ├── components/       # Reusable UI components
    │   └── lib/
    │       └── api.js        # API client (all fetch calls)
    ├── .env.example
    └── package.json
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- **Node.js** v18+ 
- **npm** v9+

### 1. Clone the Repository

```bash
git clone https://github.com/itvi-1234/Scaler.git
cd Scaler
```

### 2. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Generate Prisma client & sync database schema
npx prisma generate
npx prisma db push

# Seed with sample data (1 user, 3 event types, 5 bookings)
node prisma/seed.js

# Start the backend server (port 5000)
npm run dev
```

### 3. Setup Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start the Next.js dev server (port 3000)
npm run dev
```

### 4. Open the App

| URL | Description |
|-----|-------------|
| `http://localhost:3000` | Admin Dashboard (redirects to Event Types) |
| `http://localhost:3000/event-types` | Manage your event types |
| `http://localhost:3000/bookings` | View all bookings |
| `http://localhost:3000/availability` | Set weekly availability |
| `http://localhost:3000/booking/john-doe` | Public profile (booking page) |
| `http://localhost:5000/api/health` | Backend health check |

---

## 🌐 API Reference

Base URL: `http://localhost:5000/api`

### Users (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/users/:username` | Get user profile + active event types |
| `GET` | `/users/:username/:slug` | Get specific event type |
| `GET` | `/users/:username/:slug/slots?date=YYYY-MM-DD` | Get available time slots |

### Event Types (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/event-types` | List all event types |
| `POST` | `/event-types` | Create a new event type |
| `PUT` | `/event-types/:id` | Update an event type |
| `DELETE` | `/event-types/:id` | Delete an event type |
| `PATCH` | `/event-types/:id/toggle` | Toggle active/inactive |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/bookings?status=upcoming\|past\|cancelled` | List bookings |
| `POST` | `/bookings` | Create a new booking |
| `PATCH` | `/bookings/:uid/cancel` | Cancel a booking |

### Availability
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/availability` | List all schedules |
| `GET` | `/availability/:id` | Get schedule by ID |
| `POST` | `/availability` | Create a schedule |
| `PUT` | `/availability/:id` | Update a schedule (replaces slots) |

---

## ☁️ Deployment

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project** → Import `itvi-1234/Scaler`
2. Set **Root Directory** to `frontend`
3. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL = https://your-backend.onrender.com/api
   ```
4. Click **Deploy** ✅

### Backend → Render

1. Go to [render.com](https://render.com) → **New Web Service** → Connect `itvi-1234/Scaler`
2. Set the following:
   | Setting | Value |
   |---------|-------|
   | Root Directory | `backend` |
   | Build Command | `npm install && npx prisma generate && npx prisma db push && node prisma/seed.js` |
   | Start Command | `npm start` |
   | Environment | `Node` |

3. Add environment variables:
   ```
   DATABASE_URL = file:./prisma/dev.db
   CORS_ORIGIN  = https://your-app.vercel.app
   PORT         = 5000
   ```
4. Click **Create Web Service** ✅

> **Note:** After deploying backend to Render, copy the service URL (e.g. `https://scaler-api.onrender.com`) and update `NEXT_PUBLIC_API_URL` in Vercel settings. Then redeploy the frontend.

---

## 🗃️ Database Schema

```prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  username  String   @unique
  timezone  String
  bio       String?
  eventTypes EventType[]
  schedules  AvailabilitySchedule[]
}

model EventType {
  id              Int      @id
  title           String
  slug            String   @unique
  durationMinutes Int
  location        String?
  color           String
  isActive        Boolean
  bookings        Booking[]
}

model Booking {
  id          Int      @id
  bookerName  String
  bookerEmail String
  startTime   DateTime
  endTime     DateTime
  status      String   // UPCOMING | COMPLETED | CANCELLED
  uid         String   @unique
}

model AvailabilitySchedule {
  id       Int    @id
  name     String
  timezone String
  isDefault Boolean
  slots    AvailabilitySlot[]
}
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), React 19 |
| Styling | Vanilla CSS (custom design system) |
| Icons | Lucide React |
| Backend | Express.js 4 |
| ORM | Prisma 6 |
| Database | SQLite (local) |
| Deployment | Vercel (frontend) + Render (backend) |

---

## 📸 Screenshots

| Admin Dashboard | Public Booking |
|-----------------|----------------|
| Event Types, Bookings, Availability management | Profile page → Calendar → Time slots → Form → Confirmation |

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

1. Fork the repo
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

---

<div align="center">
  Built with ❤️ by <a href="https://github.com/itvi-1234">itvi-1234</a>
</div>