from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.paper import ResearchPaper
from app.models.project import Project, ProjectPaper
from app.schemas.project import ProjectCreate, ProjectOut, ProjectPaperAdd
from app.schemas.paper import PaperOut

router = APIRouter(prefix="/projects", tags=["Collaborative Projects"])


@router.post("", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
def create_project(
    payload: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = Project(
        title=payload.title,
        description=payload.description,
        owner_id=current_user.id,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return ProjectOut(
        id=project.id,
        title=project.title,
        description=project.description,
        owner_id=project.owner_id,
        created_at=project.created_at,
        updated_at=project.updated_at,
        papers=[],
    )


@router.get("", response_model=List[ProjectOut])
def list_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    projects = (
        db.query(Project)
        .filter(Project.owner_id == current_user.id)
        .order_by(Project.created_at.desc())
        .all()
    )
    out = []
    for prj in projects:
        papers = (
            db.query(ResearchPaper)
            .join(ProjectPaper, ProjectPaper.paper_id == ResearchPaper.id)
            .filter(ProjectPaper.project_id == prj.id)
            .all()
        )
        out.append(
            ProjectOut(
                id=prj.id,
                title=prj.title,
                description=prj.description,
                owner_id=prj.owner_id,
                created_at=prj.created_at,
                updated_at=prj.updated_at,
                papers=[PaperOut.model_validate(p) for p in papers],
            )
        )
    return out


@router.get("/{project_id}", response_model=ProjectOut)
def get_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    prj = db.query(Project).filter(Project.id == project_id, Project.owner_id == current_user.id).first()
    if not prj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project workspace not found.")

    papers = (
        db.query(ResearchPaper)
        .join(ProjectPaper, ProjectPaper.paper_id == ResearchPaper.id)
        .filter(ProjectPaper.project_id == prj.id)
        .all()
    )
    return ProjectOut(
        id=prj.id,
        title=prj.title,
        description=prj.description,
        owner_id=prj.owner_id,
        created_at=prj.created_at,
        updated_at=prj.updated_at,
        papers=[PaperOut.model_validate(p) for p in papers],
    )


@router.post("/{project_id}/papers", status_code=status.HTTP_201_CREATED)
def pin_paper_to_project(
    project_id: str,
    payload: ProjectPaperAdd,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    prj = db.query(Project).filter(Project.id == project_id, Project.owner_id == current_user.id).first()
    if not prj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")

    paper = db.query(ResearchPaper).filter(ResearchPaper.id == payload.paper_id).first()
    if not paper:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paper not found.")

    # Check if already pinned
    existing = (
        db.query(ProjectPaper)
        .filter(ProjectPaper.project_id == project_id, ProjectPaper.paper_id == payload.paper_id)
        .first()
    )
    if not existing:
        link = ProjectPaper(project_id=project_id, paper_id=payload.paper_id)
        db.add(link)
        db.commit()

    return {"message": "Paper pinned to project workspace successfully."}


@router.delete("/{project_id}/papers/{paper_id}", status_code=status.HTTP_204_NO_CONTENT)
def unpin_paper_from_project(
    project_id: str,
    paper_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    link = (
        db.query(ProjectPaper)
        .filter(ProjectPaper.project_id == project_id, ProjectPaper.paper_id == paper_id)
        .first()
    )
    if link:
        db.delete(link)
        db.commit()
    return None


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    prj = db.query(Project).filter(Project.id == project_id, Project.owner_id == current_user.id).first()
    if not prj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")
    db.delete(prj)
    db.commit()
    return None
