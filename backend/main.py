from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models, schemas, crud
from database import SessionLocal, engine
from ai_engine import sort_donations_by_priority

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="RescueBite API")

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

@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    crud.init_dummy_heatmap_data(db)
    db.close()

@app.post("/donations", response_model=schemas.DonationResponse)
def create_donation(donation: schemas.DonationCreate, db: Session = Depends(get_db)):
    return crud.create_donation(db=db, donation=donation)

@app.get("/donations", response_model=list[schemas.DonationResponse])
def read_donations(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    donations = crud.get_donations(db, skip=skip, limit=limit)
    return donations

@app.get("/donations/nearby", response_model=list[schemas.DonationResponse])
def read_nearby_donations(db: Session = Depends(get_db)):
    donations = crud.get_donations_by_status(db, status="pending")
    heatmap_zones = crud.get_heatmap_data(db)
    
    # AI Logic to prioritize
    prioritized = sort_donations_by_priority(donations, heatmap_zones)
    return prioritized

@app.post("/accept-task")
def accept_task(task: schemas.TaskAccept, db: Session = Depends(get_db)):
    updated_donation = crud.update_donation_status(db, donation_id=task.donation_id, new_status="accepted")
    if not updated_donation:
        raise HTTPException(status_code=404, detail="Donation not found")
    return {"message": "Task accepted successfully", "donation": updated_donation}

@app.get("/heatmap-data", response_model=list[schemas.HeatmapResponse])
def read_heatmap_data(db: Session = Depends(get_db)):
    return crud.get_heatmap_data(db)
