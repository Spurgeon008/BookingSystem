# � TicketBook - Movie Ticket Booking Application

A full-stack movie ticket booking platform built with FastAPI (Python) and React, featuring a BookMyShow-style seat selection interface, admin panel, Redis-based seat locking, and Celery background tasks.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Python 3.10, FastAPI, Uvicorn |
| **Database** | PostgreSQL 15, SQLAlchemy 2.0, Alembic |
| **Cache & Queue** | Redis 7, Celery 5 |
| **Email** | Gmail SMTP (smtplib) |
| **Frontend** | React 19, Vite 7, Tailwind CSS 4 |
| **Auth** | JWT (python-jose), bcrypt |
| **Infrastructure** | Docker, Docker Compose |

## Features

### 🔐 Authentication
- JWT-based login/registration with role support
- Admin and regular user roles
- Protected routes on both frontend and backend

### 🎬 Movies
- Browse movies and search by name or theatre
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
- Event-wise report with venue breakdown
- Personal booking history

### 🔔 Notifications
- In-app notifications for booking confirmations
- Unread count badge in navbar
- Click-to-mark-as-read

### 📧 Email
- Celery-powered async email delivery via Gmail SMTP
- Booking confirmation emails to users

## Project Structure

```
Pinesphere/
├── docker-compose.yml        # Single command to run everything
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

### Run the Application

Everything (PostgreSQL, Redis, Backend, Celery Worker, Frontend) runs with a single command:

```bash
docker compose up --build
```

This will start:
- **PostgreSQL** on port `5432`
- **Redis** on port `6379`
- **Backend (FastAPI)** on `http://localhost:8000`
- **Celery Worker** for background email tasks
- **Frontend (React)** on `http://localhost:80`

To run in detached mode:
```bash
docker compose up --build -d
```

To stop all services:
```bash
docker compose down
```

To stop and remove all data (volumes):
```bash
docker compose down -v
```

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
