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
    short_story = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_completed = Column(Boolean, default=False)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    user_type = Column(String)  # NGO, Volunteer, Donor
    contact = Column(String, nullable=True)
    vehicle_availability = Column(Boolean, default=False)  # For Volunteers

class Donation(Base):
    __tablename__ = "donations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    food_type = Column(String, index=True)
    quantity = Column(Integer)
    meals_contributed = Column(Integer, default=0) # To track equivalent meals supplied
    expiry_time = Column(Integer) # hours remaining
    latitude = Column(Float)
    longitude = Column(Float)
    status = Column(String, default="pending") # pending, accepted, delivered
    assigned_request_id = Column(Integer, ForeignKey("food_requests.id"), nullable=True)
    delivery_partner_id = Column(Integer, ForeignKey("users.id"), nullable=True)

class MoneyDonation(Base):
    __tablename__ = "money_donations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    amount_inr = Column(Integer)
    meals_generated = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)


