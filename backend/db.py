"""数据库引擎与会话。

本期默认本地 SQLite（`DATABASE_URL` 未设时）；Phase 3 把 `DATABASE_URL`
切到 Supabase 连接池串（端口 6543）即可，无需改本文件。
"""

import os
from collections.abc import Generator

from dotenv import load_dotenv
from sqlmodel import Session, SQLModel, create_engine

load_dotenv()  # 读取 backend/.env（本地开发）；线上由平台注入环境变量

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./freight.db")

# SQLite 在多线程（FastAPI）下需放开线程检查；Postgres 不需要。
connect_args = (
    {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

engine = create_engine(DATABASE_URL, connect_args=connect_args)


def create_db_and_tables() -> None:
    """按 models 中的表定义建表（已存在则跳过）。"""
    import models  # noqa: F401 — 确保表注册到 SQLModel.metadata

    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """FastAPI 依赖：每请求一个会话。"""
    with Session(engine) as session:
        yield session
