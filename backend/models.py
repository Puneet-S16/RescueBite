from sqlalchemy import Column, Integer, String, Float
from database import Base

class Donation(Base):
    __tablename__ = "donations"

    id = Column(Integer, primary_key=True, index=True)
    food_type = Column(String, index=True)
    quantity = Column(Integer)
    expiry_time = Column(Integer) # hours remaining
    latitude = Column(Float)
    longitude = Column(Float)
    status = Column(String, default="pending") # pending, accepted, delivered

class Volunteer(Base):
    __tablename__ = "volunteers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)

class HeatmapZone(Base):
    __tablename__ = "heatmap_zones"

    area_id = Column(Integer, primary_key=True, index=True)
    latitude = Column(Float)
    longitude = Column(Float)
    hunger_level = Column(String) # low, medium, high
