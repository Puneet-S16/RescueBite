from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class FoodRequestBase(BaseModel):
    requester_type: str
    name: str
    contact: str
    latitude: float
    longitude: float
    required_quantity: int
    urgency_level: str

class FoodRequestCreate(FoodRequestBase):
    pass

class FoodRequestResponse(FoodRequestBase):
    id: int
    fulfilled_quantity: int
    created_at: datetime
    is_completed: bool
    short_story: Optional[str] = None
    class Config:
        from_attributes = True

class HeatmapResponse(FoodRequestResponse):
    heat_score: float

class DonationBase(BaseModel):
    food_type: str
    quantity: int
    expiry_time: int
    latitude: float
    longitude: float

class DonationResponse(DonationBase):
    id: int
    status: str
    user_id: Optional[int] = None
    assigned_request_id: Optional[int] = None
    delivery_partner_id: Optional[int] = None
    class Config:
        from_attributes = True

class TaskAccept(BaseModel):
    donation_id: int
    user_id: int
    contributed_meals: int
    is_delivery_partner: bool

class MoneyDonationCreate(BaseModel):
    amount_inr: int
    user_id: Optional[int] = None
    target_request_id: Optional[int] = None

class MoneyDonationResponse(BaseModel):
    id: int
    amount_inr: int
    meals_generated: int
    created_at: datetime
    class Config:
        from_attributes = True

class StoryRequest(BaseModel):
    name: str
    requester_type: str
    required_quantity: int
    urgency_level: str

class StatsResponse(BaseModel):
    total_meals_delivered: int
    active_requests: int
    people_helped: int
    total_money_donated: int

class QuickHelpRequest(BaseModel):
    amount_inr: int
    user_id: Optional[int] = None

# --- Auth Schemas ---
class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    user_type: str  # Donor, Volunteer, NGO
    contact: Optional[str] = None
    vehicle_availability: Optional[bool] = False

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    user_type: str
    contact: Optional[str] = None
    vehicle_availability: bool
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# --- Leaderboard ---
class TopDonorResponse(BaseModel):
    name: str
    user_type: str
    total_meals: int

# --- Donation with user ---
class DonationCreate(DonationBase):
    user_id: Optional[int] = None
