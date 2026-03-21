from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey
from datetime import datetime
from database import Base

class FoodRequest(Base):
    __tablename__ = "food_requests"

    id = Column(Integer, primary_key=True, index=True)
    requester_type = Column(String) # NGO or Individual
    name = Column(String)
    contact = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    required_quantity = Column(Integer)
    fulfilled_quantity = Column(Integer, default=0)
    urgency_level = Column(String) # low, medium, high
    created_at = Column(DateTime, default=datetime.utcnow)
    is_completed = Column(Boolean, default=False)

class Donation(Base):
    __tablename__ = "donations"

    id = Column(Integer, primary_key=True, index=True)
    food_type = Column(String, index=True)
    quantity = Column(Integer)
    expiry_time = Column(Integer) # hours remaining
    latitude = Column(Float)
    longitude = Column(Float)
    status = Column(String, default="pending") # pending, accepted, delivered
    assigned_request_id = Column(Integer, ForeignKey("food_requests.id"), nullable=True)
    delivery_partner_id = Column(Integer, ForeignKey("volunteers.id"), nullable=True)

class Volunteer(Base):
    __tablename__ = "volunteers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    volunteer_type = Column(String) # Individual or NGO
    contact = Column(String)
    vehicle_availability = Column(Boolean, default=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
