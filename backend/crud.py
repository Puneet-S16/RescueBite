from sqlalchemy.orm import Session
import models, schemas

def get_donations(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Donation).offset(skip).limit(limit).all()

def get_donations_by_status(db: Session, status: str = "pending"):
    return db.query(models.Donation).filter(models.Donation.status == status).all()

def create_donation(db: Session, donation: schemas.DonationCreate):
    db_donation = models.Donation(**donation.model_dump())
    db.add(db_donation)
    db.commit()
    db.refresh(db_donation)
    return db_donation

def update_donation_status(db: Session, donation_id: int, new_status: str):
    db_donation = db.query(models.Donation).filter(models.Donation.id == donation_id).first()
    if db_donation:
        db_donation.status = new_status
        db.commit()
        db.refresh(db_donation)
    return db_donation

def get_heatmap_data(db: Session):
    return db.query(models.HeatmapZone).all()

def init_dummy_heatmap_data(db: Session):
    existing = db.query(models.HeatmapZone).count()
    if existing == 0:
        dummy_data = [
            {"latitude": 40.7128, "longitude": -74.0060, "hunger_level": "high"},
            {"latitude": 40.7300, "longitude": -73.9900, "hunger_level": "medium"},
            {"latitude": 40.7500, "longitude": -73.9800, "hunger_level": "low"},
        ]
        for data in dummy_data:
            db_zone = models.HeatmapZone(**data)
            db.add(db_zone)
        db.commit()
