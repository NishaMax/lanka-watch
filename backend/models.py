from sqlalchemy import Column, Integer, String, Float, DateTime
from database import Base
import datetime

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String)
    description = Column(String)
    status = Column(String, default="unverified")
    lat = Column(Float)
    lng = Column(Float)
    
    # NEW: Community tracking columns
    verifications = Column(Integer, default=0)
    flags = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)