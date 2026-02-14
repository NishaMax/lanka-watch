from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, UniqueConstraint
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
    verifications = Column(Integer, default=0)
    flags = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Vote(Base):
    __tablename__ = "votes"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True) # Supabase User UUID
    report_id = Column(Integer, ForeignKey("reports.id"))

    # Prevents duplicate votes in Python/SQLAlchemy layer
    __table_args__ = (UniqueConstraint('user_id', 'report_id', name='_user_report_uc'),)