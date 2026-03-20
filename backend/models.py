from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime, timedelta, timezone 
from database import Base

# 한국 시간(KST) 정의 (UTC+9)
KST = timezone(timedelta(hours=9))

def get_kst_now():
    return datetime.now(KST)

class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    project_name = Column(String, index=True)
    emissions = Column(Float) # 탄소배출량
    energy_consumed = Column(Float) #에너지 소비량
    duration = Column(Float) # 학습시간(초)
    timestamp = Column(DateTime, default=get_kst_now)
