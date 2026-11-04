from sqlalchemy import create_engine, Column, Integer, Float, String, Boolean, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime
from app.core.config import settings

def utc_now():
    return datetime.datetime.now(datetime.timezone.utc)

engine = create_engine(
    settings.DATABASE_URL, 
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class TelemetryRecord(Base):
    __tablename__ = "telemetry_records"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String, index=True)
    timestamp = Column(DateTime, default=utc_now, index=True)
    temperature = Column(Float)
    humidity = Column(Float)
    current = Column(Float)
    power = Column(Float, nullable=True)
    energy = Column(Float, nullable=True)
    occupied = Column(Boolean)
    fan_speed = Column(Integer)
    fan_state = Column(String)
    is_simulated = Column(Boolean, default=False)

class AlertRecord(Base):
    __tablename__ = "alerts"

    id = Column(String, primary_key=True, index=True)
    title = Column(String)
    category = Column(String)
    severity = Column(String)
    timestamp = Column(DateTime, default=utc_now)
    description = Column(String)
    sensor = Column(String)
    value = Column(String, nullable=True)
    recommended_action = Column(String)
    acknowledged = Column(Boolean, default=False)
    read = Column(Boolean, default=False)

def init_db():
    Base.metadata.create_all(bind=engine)
