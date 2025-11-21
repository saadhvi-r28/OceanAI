from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List

from app.database.session import get_db
from app.models.user import User
from app.models.project import Project, Section
from app.schemas.project import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    GenerateOutlineRequest
)
from app.core.security import get_current_user
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/projects", tags=["projects"])


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_data: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new project with sections."""
    # Create project
    new_project = Project(
        user_id=current_user.id,
        title=project_data.title,
        description=project_data.description,
        document_type=project_data.document_type,
        topic=project_data.topic
    )
    db.add(new_project)
    await db.flush()
    
    # Create sections
    for section_data in project_data.sections:
        section = Section(
            project_id=new_project.id,
            title=section_data.title,
            order=section_data.order
        )
        db.add(section)
    
    await db.commit()
    await db.refresh(new_project)
    
    # Load sections
    result = await db.execute(
        select(Project)
        .options(selectinload(Project.sections))
        .where(Project.id == new_project.id)
    )
    project = result.scalar_one()
    
    return project


@router.get("", response_model=List[ProjectResponse])
async def get_projects(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all projects for current user."""
    result = await db.execute(
        select(Project)
        .options(selectinload(Project.sections))
        .where(Project.user_id == current_user.id)
        .order_by(Project.updated_at.desc())
    )
    projects = result.scalars().all()
    return projects


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific project."""
    result = await db.execute(
        select(Project)
        .options(selectinload(Project.sections))
        .where(Project.id == project_id, Project.user_id == current_user.id)
    )
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    return project


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: int,
    project_data: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a project."""
    result = await db.execute(
        select(Project)
        .where(Project.id == project_id, Project.user_id == current_user.id)
    )
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Update fields
    if project_data.title is not None:
        project.title = project_data.title
    if project_data.description is not None:
        project.description = project_data.description
    if project_data.topic is not None:
        project.topic = project_data.topic
    if project_data.color_theme is not None:
        project.color_theme = project_data.color_theme
    
    await db.commit()
    await db.refresh(project)
    
    # Load sections
    result = await db.execute(
        select(Project)
        .options(selectinload(Project.sections))
        .where(Project.id == project.id)
    )
    project = result.scalar_one()
    
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a project."""
    result = await db.execute(
        select(Project)
        .where(Project.id == project_id, Project.user_id == current_user.id)
    )
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    await db.delete(project)
    await db.commit()


@router.post("/generate-outline")
async def generate_outline(
    request: GenerateOutlineRequest,
    current_user: User = Depends(get_current_user)
):
    """Generate document outline using AI."""
    try:
        sections = await gemini_service.generate_outline(
            topic=request.topic,
            document_type=request.document_type,
            num_sections=request.num_sections or 5
        )
        return {"sections": sections}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate outline: {str(e)}"
        )
