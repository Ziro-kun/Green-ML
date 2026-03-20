from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class EmissionRecordBase(BaseModel):
    project_name: str
    emissions: float
    energy_consumed: float
    duration: float

class EmissionRecordCreate(EmissionRecordBase):
    pass

class EmissionRecord(EmissionRecordBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True
