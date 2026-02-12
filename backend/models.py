from sqlalchemy import Column, Integer, String, Float, DateTime
from database import Base # Remove the dot here too
import datetime

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String)
    description = Column(String)
    status = Column(String, default="unverified")
    
    # ADD THESE TWO LINES:
    lat = Column(Float)
    lng = Column(Float)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)