from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings


engine = create_engine(
    settings.database_url,
    pool_size=5,           
    max_overflow=10,       
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=False,            
    pool_timeout=30,
    connect_args={
        "sslmode": "require" 
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