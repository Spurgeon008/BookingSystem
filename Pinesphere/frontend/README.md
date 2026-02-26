# TicketBook — Frontend

React + Vite frontend for the TicketBook event ticket booking application.

## Tech Stack
- **React 19** with React Router v7
- **Tailwind CSS 4** for styling
- **Axios** for API communication
- **react-hot-toast** for notifications
- **react-icons** for icons

## Pages
| Route | Description | Access |
|-------|-------------|--------|
| `/login` | Sign in | Public |
| `/register` | Create account | Public |
| `/` | Browse events | User |
| `/events/:id` | Seat map + booking | User |
| `/my-bookings` | Booking history | User |
| `/notifications` | In-app notifications | User |
| `/reports` | Booking reports | User |
| `/admin` | Admin dashboard | Admin only |
| `/admin/create-event` | Create / edit event | Admin only |

## Development

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # Production build
```

The frontend expects the backend API running at `http://localhost:8000`.  
See the root [README.md](../README.md) for full setup instructions.
