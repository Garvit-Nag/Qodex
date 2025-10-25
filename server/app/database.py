from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# ✅ Add connection pooling here too
engine = create_engine(
    DATABASE_URL,
    pool_size=10,          # ✅ Allow 10 concurrent connections
    max_overflow=20,       # ✅ Allow 20 more if needed
    pool_pre_ping=True,    # ✅ Verify connections are alive
    pool_recycle=3600,     # ✅ Recycle connections every hour
    pool_timeout=30,       # ✅ Wait 30s for available connection
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()