from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

# ✅ Production-ready engine configuration
engine = create_engine(
    settings.database_url,
    pool_size=5,           # Reduced for Neon free tier
    max_overflow=10,       # Reduced for free tier
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=False,            # Disable SQL logging in production
    pool_timeout=30,
    connect_args={
        "sslmode": "require"  # Required for Neon
    } if settings.database_url.startswith("postgresql") else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()