from sqlalchemy import Column, Integer, String, DateTime
from geoalchemy2 import Geometry # For handling location data
from database import Base
import datetime

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String)
    description = Column(String)
    status = Column(String, default="unverified")
    # This stores the lat/lng as a geometry point
    location = Column(Geometry('POINT', srid=4326)) 
    created_at = Column(DateTime, default=datetime.datetime.utcnow)