from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert

from app.database import get_db
from app.dependencies import get_user_cookie
from app.models.project import Project
from app.models.user_note import UserNote
from app.schemas.user_content import NoteCreate, NoteOut

router = APIRouter(prefix="/api/v1/me/notes", tags=["notes"])


@router.put("/{slug}", response_model=NoteOut)
async def save_note(
    slug: str,
    body: NoteCreate,
    user_cookie: str = Depends(get_user_cookie),
    db: AsyncSession = Depends(get_db),
):
    project = await _get_project(slug, db)

    stmt = pg_insert(UserNote).values(
        project_id=project.id,
        user_cookie=user_cookie,
        note_text=body.note_text,
    )
    stmt = stmt.on_conflict_do_update(
        constraint="uq_note_project_user",
        set_={"note_text": body.note_text},
    )
    await db.execute(stmt)
    await db.commit()

    result = await db.execute(
        select(UserNote).where(
            UserNote.project_id == project.id,
            UserNote.user_cookie == user_cookie,
        )
    )
    note = result.scalar_one()
    return NoteOut(note_text=note.note_text, updated_at=note.updated_at, project_slug=slug)


@router.get("/{slug}", response_model=NoteOut | None)
async def get_note(
    slug: str,
    user_cookie: str = Depends(get_user_cookie),
    db: AsyncSession = Depends(get_db),
):
    project = await _get_project(slug, db)

    result = await db.execute(
        select(UserNote).where(
            UserNote.project_id == project.id,
            UserNote.user_cookie == user_cookie,
        )
    )
    note = result.scalar_one_or_none()
    if not note:
        return None
    return NoteOut(note_text=note.note_text, updated_at=note.updated_at, project_slug=slug)


@router.get("", response_model=list[NoteOut])
async def list_notes(
    user_cookie: str = Depends(get_user_cookie),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(UserNote, Project.slug)
        .join(Project, UserNote.project_id == Project.id)
        .where(UserNote.user_cookie == user_cookie)
        .order_by(UserNote.updated_at.desc())
    )
    rows = result.all()
    return [
        NoteOut(note_text=note.note_text, updated_at=note.updated_at, project_slug=slug)
        for note, slug in rows
    ]


async def _get_project(slug: str, db: AsyncSession) -> Project:
    result = await db.execute(select(Project).where(Project.slug == slug))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project
