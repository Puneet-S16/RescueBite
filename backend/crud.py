from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
import models, schemas
from ai_engine import auto_assign_ngo
from auth import hash_password, verify_password

# --- Users ---
def create_user(db: Session, user: schemas.UserCreate):
    existing = db.query(models.User).filter(models.User.email == user.email).first()
    if existing:
        return None  # Email already registered
    db_user = models.User(
        name=user.name,
        email=user.email,
        hashed_password=hash_password(user.password),
        user_type=user.user_type,
        contact=user.contact,
        vehicle_availability=user.vehicle_availability or False
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

def get_user_by_id(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

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
    data = donation.model_dump()
    # meals_contributed defaults to quantity (each unit = 1 meal)
    data['meals_contributed'] = data.get('quantity', 0)
    db_donation = models.Donation(**data)
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

# --- Workflow Core Logic ---
def accept_and_assign_task(db: Session, task: schemas.TaskAccept):
    db_donation = update_donation_status(db, donation_id=task.donation_id, new_status="accepted", partner_id=task.user_id)
    if not db_donation:
        return None

    active_requests = get_active_food_requests(db)
    best_request = auto_assign_ngo(db_donation.latitude, db_donation.longitude, active_requests)

    if best_request:
        db_donation.assigned_request_id = best_request.id
        contributed = task.contributed_meals
        best_request.fulfilled_quantity += contributed
        if best_request.fulfilled_quantity >= best_request.required_quantity:
            best_request.is_completed = True

    db.commit()
    db.refresh(db_donation)
    return {"donation": db_donation, "assigned_request": best_request, "self_delivery": task.is_delivery_partner}

# --- Money & General ---
def create_money_donation(db: Session, donation: schemas.MoneyDonationCreate):
    meals_generated = donation.amount_inr // 20  # ₹20 = 1 meal

    db_donation = models.MoneyDonation(
        user_id=donation.user_id,
        amount_inr=donation.amount_inr,
        meals_generated=meals_generated
    )
    db.add(db_donation)

    if donation.target_request_id:
        req = db.query(models.FoodRequest).filter(models.FoodRequest.id == donation.target_request_id).first()
        if req:
            req.fulfilled_quantity += meals_generated
            if req.fulfilled_quantity >= req.required_quantity:
                req.is_completed = True
    else:
        reqs = get_active_food_requests(db)
        if reqs:
            def sort_key(r):
                uw = 3 if r.urgency_level.lower() == 'high' else (2 if r.urgency_level.lower() == 'medium' else 1)
                return (uw, -1 * r.id)
            reqs.sort(key=sort_key, reverse=True)
            best_req = reqs[0]
            best_req.fulfilled_quantity += meals_generated
            if best_req.fulfilled_quantity >= best_req.required_quantity:
                best_req.is_completed = True

    db.commit()
    db.refresh(db_donation)
    return db_donation

def get_stats(db: Session):
    all_reqs = get_all_food_requests(db)
    total_meals_delivered = sum([r.fulfilled_quantity for r in all_reqs])
    active_requests = len([r for r in all_reqs if not r.is_completed])
    people_helped = total_meals_delivered
    money_donations = db.query(models.MoneyDonation).all()
    total_money = sum([m.amount_inr for m in money_donations])
    return {
        "total_meals_delivered": total_meals_delivered,
        "active_requests": active_requests,
        "people_helped": people_helped,
        "total_money_donated": total_money
    }

def get_top_donors(db: Session, limit: int = 10):
    # Money donations aggregated per user
    money = db.query(
        models.MoneyDonation.user_id,
        func.sum(models.MoneyDonation.meals_generated).label("meals")
    ).filter(models.MoneyDonation.user_id != None).group_by(models.MoneyDonation.user_id).all()

    # Physical food donations aggregated per user
    food = db.query(
        models.Donation.user_id,
        func.sum(models.Donation.meals_contributed).label("meals")
    ).filter(models.Donation.user_id != None).group_by(models.Donation.user_id).all()

    # Merge both into dict
    totals = {}
    for row in money:
        totals[row.user_id] = totals.get(row.user_id, 0) + (row.meals or 0)
    for row in food:
        totals[row.user_id] = totals.get(row.user_id, 0) + (row.meals or 0)

    if not totals:
        return []

    # Sort and fetch user details
    sorted_donors = sorted(totals.items(), key=lambda x: x[1], reverse=True)[:limit]
    result = []
    for uid, total_meals in sorted_donors:
        user = get_user_by_id(db, uid)
        if user:
            result.append({"name": user.name, "user_type": user.user_type, "total_meals": total_meals})
    return result
