from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from typing import List
from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.models import User, Medicine
from app.schemas.schemas import MedicineResponse

router = APIRouter()


@router.get("/search", response_model=List[MedicineResponse])
async def search_medicines(
    q: str = Query(..., min_length=1, description="검색어"),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """약 검색"""
    result = await db.execute(
        select(Medicine)
        .where(
            or_(
                Medicine.name.contains(q),
                Medicine.ingredients.contains(q)
            )
        )
        .limit(limit)
    )
    medicines = result.scalars().all()
    return medicines


@router.get("/{medicine_id}", response_model=MedicineResponse)
async def get_medicine_detail(
    medicine_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """약 상세 정보"""
    result = await db.execute(
        select(Medicine).where(Medicine.id == medicine_id)
    )
    medicine = result.scalar_one_or_none()
    
    if not medicine:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="약 정보를 찾을 수 없습니다."
        )
    
    return medicine
