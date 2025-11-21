from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database.session import get_db
from app.models.user import User
from app.models.project import Project, Section, Refinement
from app.schemas.project import (
    SectionUpdate,
    SectionResponse,
    RefinementCreate,
    RefinementFeedback,
    RefinementResponse
)
from app.core.security import get_current_user
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/sections", tags=["sections"])


@router.post("/{section_id}/generate", response_model=SectionResponse)
async def generate_section_content(
    section_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Generate content for a section using AI."""
    # Get section and verify ownership
    result = await db.execute(
        select(Section)
        .join(Project)
        .where(Section.id == section_id, Project.user_id == current_user.id)
    )
    section = result.scalar_one_or_none()
    
    if not section:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Section not found"
        )
    
    # Get project for context
    result = await db.execute(select(Project).where(Project.id == section.project_id))
    project = result.scalar_one()
    
    try:
        # Generate content
        content = await gemini_service.generate_section_content(
            topic=project.topic,
            section_title=section.title,
            document_type=project.document_type.value,
            project_context=f"Project: {project.title}. {project.description or ''}"
        )
        
        # Store previous content before updating
        previous_content = section.content
        section.content = content
        
        # Create a refinement record to track this generation (for feedback)
        refinement = Refinement(
            section_id=section.id,
            prompt="Initial content generation",
            previous_content=previous_content,
            refined_content=content
        )
        db.add(refinement)
        
        await db.commit()
        await db.refresh(section)
        
        return section
    except Exception as e:
        import traceback
        traceback.print_exc()
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate content: {str(e)}"
        )


@router.put("/{section_id}", response_model=SectionResponse)
async def update_section(
    section_id: int,
    section_data: SectionUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a section."""
    result = await db.execute(
        select(Section)
        .join(Project)
        .where(Section.id == section_id, Project.user_id == current_user.id)
    )
    section = result.scalar_one_or_none()
    
    if not section:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Section not found"
        )
    
    if section_data.title is not None:
        section.title = section_data.title
    if section_data.content is not None:
        section.content = section_data.content
    if section_data.order is not None:
        section.order = section_data.order
    
    await db.commit()
    await db.refresh(section)
    
    return section


@router.post("/{section_id}/refine", response_model=RefinementResponse)
async def refine_section_content(
    section_id: int,
    refinement_data: RefinementCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Refine section content using AI based on user prompt."""
    result = await db.execute(
        select(Section)
        .join(Project)
        .where(Section.id == section_id, Project.user_id == current_user.id)
    )
    section = result.scalar_one_or_none()
    
    if not section:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Section not found"
        )
    
    if not section.content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot refine section without content. Generate content first."
        )
    
    try:
        # Refine content
        refined_content = await gemini_service.refine_content(
            original_content=section.content,
            refinement_prompt=refinement_data.prompt,
            section_title=section.title
        )
        
        # Create refinement record
        refinement = Refinement(
            section_id=section.id,
            prompt=refinement_data.prompt,
            previous_content=section.content,
            refined_content=refined_content
        )
        db.add(refinement)
        
        # Update section content
        section.content = refined_content
        
        await db.commit()
        await db.refresh(refinement)
        
        return refinement
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to refine content: {str(e)}"
        )


@router.get("/{section_id}/refinements", response_model=list[RefinementResponse])
async def get_section_refinements(
    section_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all refinements for a section."""
    result = await db.execute(
        select(Section)
        .join(Project)
        .where(Section.id == section_id, Project.user_id == current_user.id)
    )
    section = result.scalar_one_or_none()
    
    if not section:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Section not found"
        )
    
    result = await db.execute(
        select(Refinement)
        .where(Refinement.section_id == section_id)
        .order_by(Refinement.created_at.desc())
    )
    refinements = result.scalars().all()
    
    return refinements


@router.patch("/refinements/{refinement_id}/feedback", response_model=RefinementResponse)
async def update_refinement_feedback(
    refinement_id: int,
    feedback_data: RefinementFeedback,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update feedback for a refinement (like/dislike/comment)."""
    # First check if refinement exists at all
    result = await db.execute(
        select(Refinement).where(Refinement.id == refinement_id)
    )
    refinement = result.scalar_one_or_none()
    
    if not refinement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Refinement {refinement_id} not found"
        )
    
    # Then check ownership
    result = await db.execute(
        select(Section)
        .join(Project)
        .where(Section.id == refinement.section_id, Project.user_id == current_user.id)
    )
    section = result.scalar_one_or_none()
    
    if not section:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this refinement"
        )
    
    if feedback_data.feedback is not None:
        if feedback_data.feedback not in ['like', 'dislike', '']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Feedback must be 'like' or 'dislike'"
            )
        refinement.feedback = feedback_data.feedback if feedback_data.feedback else None
    
    if feedback_data.comment is not None:
        refinement.comment = feedback_data.comment
    
    await db.commit()
    await db.refresh(refinement)
    
    return refinement
