import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException

from db import create_db_and_tables
from models import LoginRequest
from routers import jobs

TEST_USER = os.getenv("TEST_USER", "test")
TEST_PASSWORD = os.getenv("TEST_PASSWORD", "test123")


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(title="海运出口订舱系统 API", lifespan=lifespan)
app.include_router(jobs.router)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/login")
def login(payload: LoginRequest) -> dict[str, bool]:
    """极简登录：与环境变量固定账号比对，不发 token、不做会话（DESIGN §5）。"""
    if payload.username == TEST_USER and payload.password == TEST_PASSWORD:
        return {"ok": True}
    raise HTTPException(status_code=401, detail="用户名或密码错误")
