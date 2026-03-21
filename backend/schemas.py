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

class DonationCreate(DonationBase):
    pass

class DonationResponse(DonationBase):
    id: int
    status: str
    assigned_request_id: Optional[int] = None
    delivery_partner_id: Optional[int] = None
    class Config:
        from_attributes = True

class VolunteerBase(BaseModel):
    name: str
    volunteer_type: str
    contact: str
    vehicle_availability: bool
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class VolunteerCreate(VolunteerBase):
    pass

class VolunteerResponse(VolunteerBase):
    id: int
    class Config:
        from_attributes = True

class TaskAccept(BaseModel):
    donation_id: int
    volunteer_id: int
    contributed_meals: int # For partial fulfillment
    is_delivery_partner: bool # True if volunteer is handling delivery
