from pydantic import BaseModel
from typing import Optional

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
    class Config:
        from_attributes = True

class VolunteerBase(BaseModel):
    name: str
    latitude: float
    longitude: float

class VolunteerCreate(VolunteerBase):
    pass

class HeatmapBase(BaseModel):
    latitude: float
    longitude: float
    hunger_level: str

class HeatmapResponse(HeatmapBase):
    area_id: int
    class Config:
        from_attributes = True

class TaskAccept(BaseModel):
    donation_id: int
    volunteer_id: int
