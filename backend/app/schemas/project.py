from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.models.project import DocumentType


class SectionCreate(BaseModel):
    title: str
    order: int


class SectionUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    order: Optional[int] = None


class SectionResponse(BaseModel):
    id: int
    title: str
    content: Optional[str]
    order: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProjectCreate(BaseModel):
    title: str
    description: Optional[str] = None
    document_type: DocumentType
    topic: str
    color_theme: Optional[str] = "blue_purple"
    sections: List[SectionCreate]


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    color_theme: Optional[str] = None
    topic: Optional[str] = None


class ProjectResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    document_type: DocumentType
    topic: str
    color_theme: Optional[str] = "blue_purple"
    created_at: datetime
    updated_at: datetime
    sections: List[SectionResponse] = []

    class Config:
        from_attributes = True


class RefinementCreate(BaseModel):
    prompt: str


class RefinementFeedback(BaseModel):
    feedback: Optional[str] = None  # 'like' or 'dislike'
    comment: Optional[str] = None


class RefinementResponse(BaseModel):
    id: int
    section_id: int
    prompt: str
    previous_content: Optional[str]
    refined_content: str
    feedback: Optional[str]
    comment: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class GenerateOutlineRequest(BaseModel):
    topic: str
    document_type: DocumentType
    num_sections: Optional[int] = 5
