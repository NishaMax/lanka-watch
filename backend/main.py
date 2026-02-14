from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db, engine, Base
from models import Report, Vote
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

# Create all tables (reports + votes) on startup
Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_headers=["*"],
    allow_methods=["*"],
)

class ReportCreate(BaseModel):
    category: str
    description: str
    lat: float
    lng: float

class VerifyRequest(BaseModel):
    user_id: str

@app.get("/reports/")
def get_reports(db: Session = Depends(get_db)):
    return db.query(Report).all()

@app.post("/reports/")
def create_report(report: ReportCreate, db: Session = Depends(get_db)):
    new_report = Report(category=report.category, description=report.description, lat=report.lat, lng=report.lng)
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    return new_report

# NEW: Verification Endpoint (One Vote per User)
@app.post("/reports/{report_id}/verify")
def verify_report(report_id: int, body: VerifyRequest, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Check if this user already voted on this report
    existing_vote = db.query(Vote).filter(
        Vote.user_id == body.user_id,
        Vote.report_id == report_id
    ).first()
    
    if existing_vote:
        raise HTTPException(status_code=400, detail="You have already verified this report")
    
    # Record the vote
    new_vote = Vote(user_id=body.user_id, report_id=report_id)
    db.add(new_vote)
    
    report.verifications += 1
    
    # If 3 people confirm, the report becomes "verified"
    if report.verifications >= 3:
        report.status = "verified"
        
    db.commit()
    return {"message": "Vote recorded", "status": report.status, "verifications": report.verifications}

@app.delete("/reports/{report_id}")
def delete_report(report_id: int, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        return {"error": "Report not found"}
    db.delete(report)
    db.commit()
    return {"message": "Report deleted successfully"}