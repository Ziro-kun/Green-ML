from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from fastapi.middleware.cors import CORSMiddleware
import models, schemas, database
from datetime import datetime

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Green-ML API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "online", "service": "Green-ML API"}

@app.post("/record", response_model=schemas.Session)
def create_record(record: schemas.SessionCreate, db: Session = Depends(database.get_db)):
    db_record = models.Session(**record.dict())
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

@app.get("/sessions", response_model=List[schemas.Session])
def read_records(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return db.query(models.Session).order_by(models.Session.id.desc()).offset(skip).limit(limit).all()

@app.get("/advisor")
def get_advisor_tips(session_id: int = None, db: Session = Depends(database.get_db)):
    if session_id:
        target_session = db.query(models.Session).filter(models.Session.id == session_id).first()
    else:
        target_session = db.query(models.Session).order_by(models.Session.id.desc()).first()
    
    if not target_session:
        return {"summary": "데이터가 없습니다.", "total_savings_kg": 0.0, "tips": []}

    tips = []
    total_savings = 0.0
    
    # 1. Early Stopping Recommendation
    if target_session.duration > 60:
        saving = round(target_session.emissions * 0.25, 6)
        tips.append({
            "id": 1, "icon": "stop-circle-outline", "color": "#E91E63", "bg": "#FCE4EC",
            "category": "최적화", "title": "조기 종료(Early Stopping) 도입",
            "desc": "긴 학습 시간이 감지되었습니다. 자동 중단 기준 설정을 고려해보세요.",
            "impact": "중간", "saving": f"{saving} kg CO₂",
            "detail": "검증 손실(validation loss)을 모니터링하여 불필요한 반복 학습을 줄이면 에너지의 최대 25%를 절감할 수 있습니다."
        })
        total_savings += saving

    # 2. Region Shifting Recommendation
    if target_session.emissions > 0.01:
        saving = round(target_session.emissions * 0.55, 6)
        tips.append({
            "id": 2, "icon": "earth-outline", "color": "#2196F3", "bg": "#E3F2FD",
            "category": "인프라", "title": "저탄소 지역으로 서버 이동",
            "desc": "현재 지역에서 높은 탄소 집약도가 감지되었습니다.",
            "impact": "높음", "saving": f"{saving} kg CO₂",
            "detail": "europe-west9와 같은 탄소 효율적인 지역으로 이전하면 배출량을 50% 이상 줄일 수 있습니다."
        })
        total_savings += saving

    # 3. Mixed Precision Recommendation
    if target_session.energy_consumed > 0.001:
        saving = round(target_session.emissions * 0.18, 6)
        tips.append({
            "id": 3, "icon": "flash-outline", "color": "#FF9800", "bg": "#FFF3E0",
            "category": "연산", "title": "혼합 정밀도 학습(FP16) 활용",
            "desc": "정밀도 최적화를 통해 메모리 및 전력 사용량을 줄일 수 있습니다.",
            "impact": "중간", "saving": f"{saving} kg CO₂",
            "detail": "torch.cuda.amp를 사용하면 학습 속도를 높이면서 에너지 소비를 크게 낮출 수 있습니다."
        })
        total_savings += saving

    # Summary Generation
    if target_session.emissions > 0.1:
        summary = f"[{target_session.project_name}] 세션에서 높은 배출량이 감지되었습니다. 즉각적인 최적화가 권장됩니다."
    elif target_session.emissions > 0.02:
        summary = f"[{target_session.project_name}] 세션의 배출량이 증가하고 있습니다. 아래 팁을 확인하세요."
    else:
        summary = "현재 세션의 배출량이 건강한 수준을 유지하고 있습니다."

    return {
        "summary": summary,
        "total_savings_kg": round(total_savings, 4),
        "tips": tips
    }
