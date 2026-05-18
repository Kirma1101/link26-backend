from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List
import httpx
import json
from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.core.config import settings
from app.models.models import User, ChatMessage
from app.schemas.schemas import ChatMessageCreate, ChatMessageResponse

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

async def call_gemini(message: str) -> str:
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        return "Gemini API 키가 설정되지 않았습니다."
    url = f"{GEMINI_API_URL}?key={api_key}"
    payload = {
        "contents": [{"parts": [{"text": f"당신은 link26 AI 건강 도우미입니다. 약 복용, 건강 관리 관련 질문에 한국어로 친절하게 답변하세요.\n\n사용자: {message}"}]}],
        "generationConfig": {"temperature": 0.7, "maxOutputTokens": 1024}
    }
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            return data["candidates"][0]["content"]["parts"][0]["text"]
    except Exception as e:
        return f"AI 응답 생성 중 오류가 발생했습니다: {str(e)}"

router = APIRouter()


@router.post("/messages", response_model=ChatMessageResponse)
async def create_chat_message(
    message: ChatMessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_message = ChatMessage(
        user_id=current_user.id,
        role="user",
        content=message.content,
        message_type=message.message_type
    )
    db.add(user_message)
    await db.commit()
    await db.refresh(user_message)

    ai_response = await call_gemini(message.content)

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
    await db.execute(
        select(ChatMessage).where(ChatMessage.user_id == current_user.id)
    )
    await db.commit()
    return {"message": "채팅 기록이 삭제되었습니다."}