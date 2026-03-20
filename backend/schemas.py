from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class SessionBase(BaseModel):
    project_name: str
    emissions: float
    energy_consumed: float
    duration: float

class SessionCreate(SessionBase):
    pass

class Session(SessionBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True