import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# REPLACE with your actual Supabase string
DATABASE_URL = "postgresql://postgres.wafhklflhrkmwfjfgqkj:[LankaWatch$122333]@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependency to get a DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()