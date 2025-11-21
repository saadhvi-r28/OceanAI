from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.database.session import Base


class DocumentType(str, enum.Enum):
    DOCX = "docx"
    PPTX = "pptx"


class ColorTheme(str, enum.Enum):
    BLUE_PURPLE = "blue_purple"
    GREEN_TEAL = "green_teal"
    ORANGE_RED = "orange_red"
    NAVY_GOLD = "navy_gold"
    PINK_PURPLE = "pink_purple"
    FOREST_SAGE = "forest_sage"
    SUNSET = "sunset"
    OCEAN = "ocean"
    SLATE = "slate"


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    document_type = Column(SQLEnum(DocumentType), nullable=False)
    topic = Column(Text, nullable=False)
    color_theme = Column(String, default="blue_purple", nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    owner = relationship("User", back_populates="projects")
    sections = relationship("Section", back_populates="project", cascade="all, delete-orphan")


class Section(Base):
    __tablename__ = "sections"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=True)
    order = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    project = relationship("Project", back_populates="sections")
    refinements = relationship("Refinement", back_populates="section", cascade="all, delete-orphan")


class Refinement(Base):
    __tablename__ = "refinements"

    id = Column(Integer, primary_key=True, index=True)
    section_id = Column(Integer, ForeignKey("sections.id"), nullable=False)
    prompt = Column(Text, nullable=False)
    previous_content = Column(Text, nullable=True)
    refined_content = Column(Text, nullable=False)
    feedback = Column(String, nullable=True)  # 'like', 'dislike', or None
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    section = relationship("Section", back_populates="refinements")
