from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models, schemas, database

# DB 테이블 생성
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Green-ML API")

@app.get("/")
def read_root():
    return {"message": "Welcome to Green-ML API"}

# 탄소배출기록 저장
@app.post("/record", response_model=schemas.EmissionRecord)
def create_record(record: schemas.EmissionRecordCreate, db: Session = Depends(database.get_db)):
    db_record = models.EmissionRecord(**record.dict())
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

# 탄소배출 세션 목록 조회
@app.get("/sessions", response_model=List[schemas.Session])
def read_records(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    records = db.query(models.EmissionRecord).offset(skip).limit(limit).all()
    return records
