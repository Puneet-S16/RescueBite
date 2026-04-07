from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Optional
import models, schemas, crud
from database import SessionLocal, engine
from ai_engine import sort_donations_by_priority, calculate_heat_score
from auth import create_access_token, decode_token

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="RescueBite API v3")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split(" ")[1]
    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        user = crud.get_user_by_id(db, int(user_id))
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

# --- AUTH ---
@app.post("/auth/signup", response_model=schemas.Token)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.create_user(db, user)
    if not db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    token = create_access_token({"sub": str(db_user.id)})
    return {"access_token": token, "token_type": "bearer", "user": db_user}

@app.post("/auth/login", response_model=schemas.Token)
def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = crud.authenticate_user(db, credentials.email, credentials.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": user}

@app.get("/users/me", response_model=schemas.UserResponse)
def get_me(current_user=Depends(get_current_user)):
    return current_user

# --- Food Requests ---
@app.post("/requests", response_model=schemas.FoodRequestResponse)
def create_request(food_req: schemas.FoodRequestCreate, db: Session = Depends(get_db)):
    return crud.create_food_request(db, food_req)

@app.get("/requests", response_model=list[schemas.FoodRequestResponse])
def get_requests(db: Session = Depends(get_db)):
    return crud.get_active_food_requests(db)

# --- Physical Donations ---
@app.post("/donations", response_model=schemas.DonationResponse)
def create_donation(donation: schemas.DonationCreate, db: Session = Depends(get_db)):
    return crud.create_donation(db=db, donation=donation)

@app.get("/donations/nearby", response_model=list[schemas.DonationResponse])
def read_nearby_donations(db: Session = Depends(get_db)):
    donations = crud.get_donations_by_status(db, status="pending")
    prioritized = sort_donations_by_priority(donations)
    return prioritized

# --- Task Accept ---
@app.post("/accept-task")
def accept_task(task: schemas.TaskAccept, db: Session = Depends(get_db)):
    result = crud.accept_and_assign_task(db, task)
    if not result:
        raise HTTPException(status_code=404, detail="Donation not found")
    return {"message": "Task accepted successfully", "data": result}

@app.get("/match-request")
def match_request(latitude: float, longitude: float, db: Session = Depends(get_db)):
    active_requests = crud.get_active_food_requests(db)
    from ai_engine import auto_assign_ngo
    best_request = auto_assign_ngo(latitude, longitude, active_requests)
    if not best_request:
        return {"matched": False}
    return {
        "matched": True,
        "request": best_request,
        "remaining": best_request.required_quantity - best_request.fulfilled_quantity
    }

# --- Heatmap ---
@app.get("/heatmap-data", response_model=list[schemas.HeatmapResponse])
def get_heatmap_data(db: Session = Depends(get_db)):
    requests = crud.get_active_food_requests(db)
    heatmap_data = []
    for req in requests:
        score = calculate_heat_score(req.required_quantity, req.fulfilled_quantity, req.urgency_level, req.created_at)
        req_dict = {
            "id": req.id,
            "requester_type": req.requester_type,
            "name": req.name,
            "contact": req.contact,
            "latitude": req.latitude,
            "longitude": req.longitude,
            "required_quantity": req.required_quantity,
            "fulfilled_quantity": req.fulfilled_quantity,
            "urgency_level": req.urgency_level,
            "short_story": req.short_story,
            "created_at": req.created_at,
            "is_completed": req.is_completed,
            "heat_score": score
        }
        heatmap_data.append(req_dict)
    return heatmap_data

# --- Money Donation ---
@app.post("/donate-money", response_model=schemas.MoneyDonationResponse)
def donate_money(donation: schemas.MoneyDonationCreate, db: Session = Depends(get_db)):
    return crud.create_money_donation(db, donation)

# --- Stats ---
@app.get("/stats", response_model=schemas.StatsResponse)
def get_system_stats(db: Session = Depends(get_db)):
    return crud.get_stats(db)

# --- AI Story ---
@app.post("/generate-story")
def generate_story(req: schemas.StoryRequest):
    from ai_engine import generate_short_story
    story = generate_short_story(req.name, req.requester_type, req.required_quantity, req.urgency_level)
    return {"story": story}

# --- Quick Help ---
@app.post("/quick-help", response_model=schemas.MoneyDonationResponse)
def quick_help(req: schemas.QuickHelpRequest, db: Session = Depends(get_db)):
    donation = schemas.MoneyDonationCreate(amount_inr=req.amount_inr, user_id=req.user_id, target_request_id=None)
    return crud.create_money_donation(db, donation)

# --- Top Donors ---
@app.get("/top-donors", response_model=list[schemas.TopDonorResponse])
def top_donors(db: Session = Depends(get_db)):
    return crud.get_top_donors(db)

# --- Legacy Volunteer Signup (redirect to /auth/signup) ---
@app.post("/volunteers")
def create_volunteer_legacy():
    raise HTTPException(status_code=410, detail="Please use /auth/signup to create accounts.")

@app.delete("/wipe-requests")
def wipe_requests(db: Session = Depends(get_db)):
    db.query(models.FoodRequest).delete()
    db.query(models.MoneyDonation).delete()
    db.commit()
    return {"status": "wiped"}
