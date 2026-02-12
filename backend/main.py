from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Report
from pydantic import BaseModel

app = FastAPI()

# Pydantic model for receiving data from frontend
class ReportCreate(BaseModel):
    category: str
    description: str
    lat: float
    lng: float

@app.post("/reports/")
def create_report(report: ReportCreate, db: Session = Depends(get_db)):
    # Convert lat/lng to a WKT (Well-Known Text) point for PostGIS
    point = f'POINT({report.lng} {report.lat})'
    
    new_report = Report(
        category=report.category,
        description=report.description,
        location=point
    )
    
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    return {"message": "Report saved successfully!", "id": new_report.id}