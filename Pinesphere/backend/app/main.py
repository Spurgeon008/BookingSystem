from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.session import engine
from app.db.base import Base

from app.models.user import User                  
from app.models.event import Event                
from app.models.booking import Booking            
from app.models.booked_seat import BookedSeat     
from app.models.notification import Notification  

from app.api.routes.auth import router as auth_router
from app.api.routes.events import router as events_router
from app.api.routes.bookings import router as bookings_router
from app.api.routes.admin import router as admin_router
from app.api.routes.reports import router as reports_router
from app.api.routes.notifications import router as notifications_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Ticket Booking API",
    description="A ticket booking system with JWT auth, Redis seat locking, Celery background tasks, and email notifications.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(events_router)
app.include_router(bookings_router)
app.include_router(admin_router)
app.include_router(reports_router)
app.include_router(notifications_router)
