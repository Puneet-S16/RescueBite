from sqlalchemy.orm import Session
from datetime import datetime
import models, schemas
from ai_engine import auto_assign_ngo

# --- Food Requests (NGOs/Individuals) ---
def create_food_request(db: Session, request: schemas.FoodRequestCreate):
    db_req = models.FoodRequest(**request.model_dump())
    db.add(db_req)
    db.commit()
    db.refresh(db_req)
    return db_req

def get_active_food_requests(db: Session):
    return db.query(models.FoodRequest).filter(models.FoodRequest.is_completed == False).all()

def get_all_food_requests(db: Session):
    return db.query(models.FoodRequest).all()

# --- Donations (Surplus Food) ---
def create_donation(db: Session, donation: schemas.DonationCreate):
    db_donation = models.Donation(**donation.model_dump())
    db.add(db_donation)
    db.commit()
    db.refresh(db_donation)
    return db_donation

def get_donations_by_status(db: Session, status: str = "pending"):
    return db.query(models.Donation).filter(models.Donation.status == status).all()

def update_donation_status(db: Session, donation_id: int, new_status: str, partner_id: int):
    db_donation = db.query(models.Donation).filter(models.Donation.id == donation_id).first()
    if db_donation:
        db_donation.status = new_status
        db_donation.delivery_partner_id = partner_id
        db.commit()
        db.refresh(db_donation)
    return db_donation

# --- Volunteers ---
def create_volunteer(db: Session, volunteer: schemas.VolunteerCreate):
    db_vol = models.Volunteer(**volunteer.model_dump())
    db.add(db_vol)
    db.commit()
    db.refresh(db_vol)
    return db_vol

def get_volunteer(db: Session, volunteer_id: int):
    return db.query(models.Volunteer).filter(models.Volunteer.id == volunteer_id).first()

# --- Workflow Core Logic ---
def accept_and_assign_task(db: Session, task: schemas.TaskAccept):
    # 1. Update Donation Status & Assign Volunteer
    db_donation = update_donation_status(db, donation_id=task.donation_id, new_status="accepted", partner_id=task.volunteer_id)
    if not db_donation:
        return None
        
    # 2. Auto-Assign NGO / Food Request
    active_requests = get_active_food_requests(db)
    best_request = auto_assign_ngo(db_donation.latitude, db_donation.longitude, active_requests)
    
    if best_request:
        db_donation.assigned_request_id = best_request.id
        
        # 3. Handle Partial Fulfillment
        contributed = task.contributed_meals
        best_request.fulfilled_quantity += contributed
        
        # Mark as completed if fulfilled
        if best_request.fulfilled_quantity >= best_request.required_quantity:
            best_request.is_completed = True
            
    db.commit()
    db.refresh(db_donation)
    
    return {"donation": db_donation, "assigned_request": best_request, "self_delivery": task.is_delivery_partner}


