from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# 사용자 스키마
class UserBase(BaseModel):
    email: EmailStr
    username: str
    phone: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    email: Optional[str] = None


# 채팅 스키마
class ChatMessageCreate(BaseModel):
    content: str
    message_type: Optional[str] = None


class ChatMessageResponse(BaseModel):
    id: int
    role: str
    content: str
    message_type: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


# 약 정보 스키마
class MedicineBase(BaseModel):
    name: str
    company: Optional[str] = None
    ingredients: Optional[str] = None
    efficacy: Optional[str] = None
    usage: Optional[str] = None
    precautions: Optional[str] = None


class MedicineResponse(MedicineBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# 가족 구성원 스키마
class FamilyMemberCreate(BaseModel):
    name: str
    relationship: Optional[str] = None
    birth_date: Optional[str] = None
    phone: Optional[str] = None


class FamilyMemberResponse(FamilyMemberCreate):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
