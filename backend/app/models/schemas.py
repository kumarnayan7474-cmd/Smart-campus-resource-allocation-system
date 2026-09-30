# Pydantic schemas for FastAPI requests and responses
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class NodeModel(BaseModel):
    id: str
    name: str

class EdgeModel(BaseModel):
    u: str
    v: str
    weight: float

class ResourceModel(BaseModel):
    id: str
    name: str
    type: str # classroom, lab, seminar_hall, equipment
    capacity: int
    building: str

class RequestCreateModel(BaseModel):
    requester: str
    type: str # exam, regular_class, faculty_meeting, event, club_activity
    required_capacity: int
    resource_type: str
    location: str
    day: str
    start_slot: int
    end_slot: int

class ConfigModel(BaseModel):
    WEIGHT_WASTED_CAPACITY: float
    WEIGHT_WALKING_DISTANCE: float
