from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List
from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.models import User, ChatMessage
from app.schemas.schemas import ChatMessageCreate, ChatMessageResponse

router = APIRouter()


@router.post("/messages", response_model=ChatMessageResponse)
async def create_chat_message(
    message: ChatMessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """채팅 메시지 생성 (사용자 메시지)"""
    # 사용자 메시지 저장
    user_message = ChatMessage(
        user_id=current_user.id,
        role="user",
        content=message.content,
        message_type=message.message_type
    )
    db.add(user_message)
    await db.commit()
    await db.refresh(user_message)
    
    # TODO: AI 응답 생성 (Gemini API 호출)
    # 여기서는 간단한 응답만 반환
    ai_response = f"'{message.content}'에 대한 AI 응답입니다. (Gemini API 연동 예정)"
    
    assistant_message = ChatMessage(
        user_id=current_user.id,
        role="assistant",
        content=ai_response,
        message_type=message.message_type
    )
    db.add(assistant_message)
    await db.commit()
    await db.refresh(assistant_message)
    
    return assistant_message


@router.get("/messages", response_model=List[ChatMessageResponse])
async def get_chat_history(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """채팅 기록 조회"""
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.user_id == current_user.id)
        .order_by(desc(ChatMessage.created_at))
        .limit(limit)
    )
    messages = result.scalars().all()
    return list(reversed(messages))


@router.delete("/messages")
async def clear_chat_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """채팅 기록 삭제"""
    await db.execute(
        select(ChatMessage).where(ChatMessage.user_id == current_user.id)
    )
    await db.commit()
    return {"message": "채팅 기록이 삭제되었습니다."}
