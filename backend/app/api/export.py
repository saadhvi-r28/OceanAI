from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database.session import get_db
from app.models.user import User
from app.models.project import Project
from app.core.security import get_current_user
from app.services.document_service import document_service

router = APIRouter(prefix="/export", tags=["export"])


@router.get("/{project_id}")
async def export_document(
    project_id: int,
    preview: bool = Query(False, description="If true, inline display for preview; if false, download"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Export project as a document (DOCX or PPTX)."""
    # Get project with sections
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
    
    try:
        if project.document_type.value == "docx":
            file_stream = document_service.create_docx(project, project.sections)
            media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            filename = f"{project.title.replace(' ', '_')}.docx"
        else:  # pptx
            file_stream = document_service.create_pptx(project, project.sections)
            media_type = "application/vnd.openxmlformats-officedocument.presentationml.presentation"
            filename = f"{project.title.replace(' ', '_')}.pptx"
        
        # Set Content-Disposition based on preview parameter
        disposition = "inline" if preview else "attachment"
        
        return StreamingResponse(
            file_stream,
            media_type=media_type,
            headers={
                "Content-Disposition": f"{disposition}; filename={filename}"
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export document: {str(e)}"
        )
