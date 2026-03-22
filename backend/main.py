from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models, schemas, crud
from database import SessionLocal, engine
from ai_engine import sort_donations_by_priority, calculate_heat_score

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="RescueBite API v2")

# Setup CORS
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


@app.post("/requests", response_model=schemas.FoodRequestResponse)
def create_request(food_req: schemas.FoodRequestCreate, db: Session = Depends(get_db)):
    return crud.create_food_request(db, food_req)

@app.get("/requests", response_model=list[schemas.FoodRequestResponse])
def get_requests(db: Session = Depends(get_db)):
    return crud.get_active_food_requests(db)

@app.post("/donations", response_model=schemas.DonationResponse)
def create_donation(donation: schemas.DonationCreate, db: Session = Depends(get_db)):
    return crud.create_donation(db=db, donation=donation)

@app.get("/donations/nearby", response_model=list[schemas.DonationResponse])
def read_nearby_donations(db: Session = Depends(get_db)):
    donations = crud.get_donations_by_status(db, status="pending")
    prioritized = sort_donations_by_priority(donations)
    return prioritized

@app.post("/volunteers", response_model=schemas.VolunteerResponse)
def create_volunteer(volunteer: schemas.VolunteerCreate, db: Session = Depends(get_db)):
    return crud.create_volunteer(db, volunteer)

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

@app.get("/heatmap-data", response_model=list[schemas.HeatmapResponse])
def get_heatmap_data(db: Session = Depends(get_db)):
    requests = crud.get_active_food_requests(db)
    heatmap_data = []
    
    for req in requests:
        score = calculate_heat_score(req.required_quantity, req.fulfilled_quantity, req.urgency_level, req.created_at)
        
        # Convert SQLAlchemy object to dictionary, then add heat_score to match schema
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
            "created_at": req.created_at,
            "is_completed": req.is_completed,
            "heat_score": score
        }
        heatmap_data.append(req_dict)
        
    return heatmap_data

@app.delete("/wipe-requests")
def wipe_requests(db: Session = Depends(get_db)):
    db.query(models.FoodRequest).delete()
    db.commit()
    return {"status": "wiped"}
