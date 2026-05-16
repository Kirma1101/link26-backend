from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.database import init_db
from app.api.v1 import auth, chat, medicine, family, user


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 시작 시 DB 초기화
    await init_db()
    yield
    # 종료 시 정리 작업


app = FastAPI(
    title="Link26 API",
    description="건강관리 및 복약 안내 서비스 API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(auth.router, prefix="/api/v1/auth", tags=["인증"])
app.include_router(user.router, prefix="/api/v1/users", tags=["사용자"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["AI 채팅"])
app.include_router(medicine.router, prefix="/api/v1/medicine", tags=["약 정보"])
app.include_router(family.router, prefix="/api/v1/family", tags=["가족 관리"])


@app.get("/")
async def root():
    return {"message": "Link26 API Server", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=True
    )
