from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Report
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

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

# NEW: Verification Endpoint
@app.post("/reports/{report_id}/verify")
def verify_report(report_id: int, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        return {"error": "Report not found"}
    
    report.verifications += 1
    
    # If 3 people confirm, the report becomes "verified"
    if report.verifications >= 3:
        report.status = "verified"
        
    db.commit()
    return {"message": "Vote recorded", "status": report.status}

@app.delete("/reports/{report_id}")
def delete_report(report_id: int, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        return {"error": "Report not found"}
    db.delete(report)
    db.commit()
    return {"message": "Report deleted successfully"}