import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from datetime import datetime
from app.db.session import SessionLocal, engine
from app.db.base import Base
from app.models.event import Event
from app.models.user import User
from app.models.booking import Booking
from app.models.booked_seat import BookedSeat
from app.models.notification import Notification
from app.core.security import hash_password

Base.metadata.create_all(bind=engine)

EVENTS = [
    {
        "title": "Avengers: Endgame",
        "description": "The Avengers assemble for one final stand against Thanos in an epic conclusion to the Infinity Saga.",
        "category": "movie",
        "venue": "PVR Cinemas - Screen 1",
        "price": 250.0,
        "rows": 8,
        "seats_per_row": 12,
        "event_date": datetime(2026, 3, 5, 18, 30),
    },
    {
        "title": "Inception",
        "description": "A skilled thief who infiltrates dreams is offered a chance to have his criminal record erased.",
        "category": "movie",
        "venue": "INOX - Gold Screen",
        "price": 300.0,
        "rows": 6,
        "seats_per_row": 10,
        "event_date": datetime(2026, 3, 8, 20, 0),
    },
    {
        "title": "Interstellar",
        "description": "A team of explorers travel through a wormhole in space to ensure humanity's survival.",
        "category": "movie",
        "venue": "Cinepolis - IMAX",
        "price": 450.0,
        "rows": 10,
        "seats_per_row": 14,
        "event_date": datetime(2026, 3, 10, 19, 0),
    },
    {
        "title": "The Dark Knight",
        "description": "Batman faces the Joker, a criminal mastermind who wants to plunge Gotham City into anarchy.",
        "category": "movie",
        "venue": "PVR Cinemas - Screen 3",
        "price": 200.0,
        "rows": 10,
        "seats_per_row": 12,
        "event_date": datetime(2026, 3, 3, 21, 0),
    },
    {
        "title": "Coldplay: Music of the Spheres",
        "description": "Coldplay live concert - Music of the Spheres World Tour.",
        "category": "concert",
        "venue": "DY Patil Stadium",
        "price": 1500.0,
        "rows": 15,
        "seats_per_row": 20,
        "event_date": datetime(2026, 3, 15, 18, 0),
    },
    {
        "title": "Mumbai Express",
        "description": "Premium AC bus service from Mumbai to Pune.",
        "category": "bus",
        "venue": "Mumbai Central Bus Stand",
        "price": 350.0,
        "rows": 10,
        "seats_per_row": 4,
        "event_date": datetime(2026, 3, 6, 7, 0),
    },
    {
        "title": "Stand-Up Comedy Night",
        "description": "An evening of laughter with top comedians performing live.",
        "category": "show",
        "venue": "Canvas Laugh Club",
        "price": 500.0,
        "rows": 5,
        "seats_per_row": 8,
        "event_date": datetime(2026, 3, 12, 20, 0),
    },
    {
        "title": "Oppenheimer",
        "description": "The story of J. Robert Oppenheimer and the creation of the atomic bomb.",
        "category": "movie",
        "venue": "INOX - Insignia",
        "price": 350.0,
        "rows": 8,
        "seats_per_row": 10,
        "event_date": datetime(2026, 3, 14, 19, 30),
    },
]


def seed():
    db = SessionLocal()
    try:
        # Create admin user
        admin = db.query(User).filter(User.email == "admin@ticketbooking.com").first()
        if not admin:
            admin = User(
                name="Admin",
                email="admin@ticketbooking.com",
                hashed_password=hash_password("admin123"),
                role="admin",
            )
            db.add(admin)
            print("Admin user created: admin@ticketbooking.com / admin123")
        else:
            print("Admin user already exists")

        # Create events
        inserted = 0
        for event_data in EVENTS:
            exists = db.query(Event).filter_by(title=event_data["title"]).first()
            if not exists:
                total = event_data["rows"] * event_data["seats_per_row"]
                event_data["total_seats"] = total
                event_data["available_seats"] = total
                db.add(Event(**event_data))
                inserted += 1

        db.commit()
        print(f"Inserted {inserted} new events. ({len(EVENTS) - inserted} already existed)")
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
