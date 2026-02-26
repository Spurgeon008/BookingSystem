# 🎫 TicketBook - Event Booking Application

A full-stack ticket booking platform built with FastAPI (Python) and React, featuring a BookMyShow-style seat selection interface, admin panel, Redis-based seat locking, and Celery background tasks.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Python 3.10, FastAPI, Uvicorn |
| **Database** | PostgreSQL 15, SQLAlchemy 2.0, Alembic |
| **Cache & Queue** | Redis 7, Celery 5 |
| **Email** | Mailtrap SDK |
| **Frontend** | React 19, Vite 7, Tailwind CSS 4 |
| **Auth** | JWT (python-jose), bcrypt |
| **Infrastructure** | Docker, Docker Compose |

## Features

### 🔐 Authentication
- JWT-based login/registration with role support
- Admin and regular user roles
- Protected routes on both frontend and backend

### 🎬 Events
- Browse events by category (Movie, Concert, Show, Bus)
- Search events by name or venue
- View seat availability in real-time

### 🪑 BookMyShow-style Seat Selection
- Visual seat map with row labels (A–Z) and numbered seats
- Color-coded seat states: Available, Selected, Booked, Locked
- Real-time seat locking via Redis (5-min TTL) to prevent double booking

### 📋 Admin Panel (Django-admin style)
- Create, update, delete events
- View all bookings system-wide
- Dashboard with stats: total events, bookings, revenue, seats sold

### 📊 Reports
- Booking summary with total revenue
- Event-wise report with category/venue breakdown
- Personal booking history

### 🔔 Notifications
- In-app notifications for booking confirmations
- Unread count badge in navbar
- Click-to-mark-as-read

### 📧 Email
- Celery-powered async email delivery via Mailtrap
- Booking confirmation emails to users

## Project Structure

```
Pinesphere/
├── backend/
│   ├── app/
│   │   ├── api/routes/       # auth, events, bookings, admin, reports, notifications
│   │   ├── core/             # config, security (JWT, admin guard)
│   │   ├── db/               # session, base
│   │   ├── models/           # user, event, booking, booked_seat, notification
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # redis_client, booking_service, email_service
│   │   ├── workers/          # celery_worker, tasks
│   │   └── main.py
│   ├── alembic/              # DB migrations
│   ├── scripts/              # Seed data
│   ├── docker-compose.yml
│   ├── Dockerfile
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── api/              # Axios instance with auth interceptor
    │   ├── components/       # Navbar, SeatMap, EventCard
    │   ├── context/          # AuthContext
    │   ├── pages/            # All page components
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
```

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ and npm
- Python 3.10+ (if running outside Docker)

### 1. Start Infrastructure (PostgreSQL + Redis)

```bash
cd backend
sudo docker compose up -d db redis
```

### 2. Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file in `backend/`:
```env
DATABASE_URL=postgresql://Manager:Spurgeon1414@localhost:5432/ticket_db
SECRET_KEY=your-secret-key
REDIS_HOST=localhost
REDIS_PORT=6379
MAILTRAP_TOKEN=your-mailtrap-token
```

Run the server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Seed Database

```bash
cd backend
python -m scripts.insert_dummy_events
```

This creates:
- **Admin user**: `admin@ticketbooking.com` / `admin123`
- **8 sample events** across movies, concerts, shows, and bus categories

### 4. Start Celery Worker

```bash
cd backend
celery -A app.workers.celery_worker worker --loglevel=info
```

### 5. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login (returns JWT + user) |
| GET | `/auth/me` | Get current user profile |

### Events
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/events/` | List all events |
| GET | `/events/{id}` | Get event details |
| GET | `/events/{id}/seats` | Get seat map (booked + locked) |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/bookings/` | Book seats |
| GET | `/bookings/my` | Get user's bookings |

### Admin (requires admin role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/admin/events` | Create event |
| PUT | `/admin/events/{id}` | Update event |
| DELETE | `/admin/events/{id}` | Delete event |
| GET | `/admin/bookings` | All bookings |
| GET | `/admin/stats` | Dashboard stats |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reports/summary` | Booking summary |
| GET | `/reports/event-wise` | Event-wise report |
| GET | `/reports/my-history` | User booking history |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications/` | Get user's notifications |
| PUT | `/notifications/{id}/read` | Mark as read |

## Architecture

```
┌──────────┐     ┌──────────┐     ┌─────────────┐
│  React   │────▶│  FastAPI  │────▶│ PostgreSQL  │
│ Frontend │     │  Backend  │     │  Database   │
└──────────┘     └─────┬────┘     └─────────────┘
                       │
                 ┌─────┴────┐
                 │  Redis   │── Seat locking (5min TTL)
                 └─────┬────┘
                       │
                 ┌─────┴────┐
                 │  Celery  │── Email notifications
                 └──────────┘
```

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ticketbooking.com | admin123 |

---

Built for **Pinesphere** placement assessment.
