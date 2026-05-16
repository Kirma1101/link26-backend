from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.models import User, FamilyMember
from app.schemas.schemas import FamilyMemberCreate, FamilyMemberResponse

router = APIRouter()


@router.post("/members", response_model=FamilyMemberResponse, status_code=status.HTTP_201_CREATED)
async def add_family_member(
    member_data: FamilyMemberCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """가족 구성원 추가"""
    new_member = FamilyMember(
        user_id=current_user.id,
        name=member_data.name,
        relationship=member_data.relationship,
        birth_date=member_data.birth_date,
        phone=member_data.phone
    )
    
    db.add(new_member)
    await db.commit()
    await db.refresh(new_member)
    
    return new_member


@router.get("/members", response_model=List[FamilyMemberResponse])
async def get_family_members(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """가족 구성원 목록 조회"""
    result = await db.execute(
        select(FamilyMember).where(FamilyMember.user_id == current_user.id)
    )
    members = result.scalars().all()
    return members


@router.delete("/members/{member_id}")
async def delete_family_member(
    member_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """가족 구성원 삭제"""
    result = await db.execute(
        select(FamilyMember).where(
            FamilyMember.id == member_id,
            FamilyMember.user_id == current_user.id
        )
    )
    member = result.scalar_one_or_none()
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="가족 구성원을 찾을 수 없습니다."
        )
    
    await db.delete(member)
    await db.commit()
    
    return {"message": "가족 구성원이 삭제되었습니다."}
