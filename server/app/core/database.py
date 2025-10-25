from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

# ✅ Create SQLAlchemy engine WITH CONNECTION POOLING
engine = create_engine(
    settings.database_url,
    pool_size=10,          # ✅ Allow 10 concurrent connections
    max_overflow=20,       # ✅ Allow 20 more if needed  
    pool_pre_ping=True,    # ✅ Verify connections are alive
    pool_recycle=3600,     # ✅ Recycle connections every hour
    echo=settings.debug,   # ✅ SQL logging in debug mode
    pool_timeout=30,       # ✅ Wait 30s for available connection
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class
Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()