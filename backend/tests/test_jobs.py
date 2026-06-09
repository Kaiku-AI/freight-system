"""Phase 2 回归：登录 + 作业 CRUD + job_no 生成 + 列表过滤/分页。

用内存 SQLite 覆盖 get_session 依赖，隔离于本地 freight.db。
"""

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from db import get_session
from index import app


@pytest.fixture
def client():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)

    def override_get_session():
        with Session(engine) as session:
            yield session

    app.dependency_overrides[get_session] = override_get_session
    yield TestClient(app)
    app.dependency_overrides.clear()


def make_payload(**overrides):
    base = {
        "operator": "张三",
        "consignor": "宁波某贸易公司",
        "customer_service": "李四",
        "sales": "王五",
        "etd": "2026-06-20",
        "mbl_payment": "预付",
    }
    base.update(overrides)
    return base


# ---- 登录 ----
def test_login_ok(client):
    resp = client.post("/api/login", json={"username": "test", "password": "test123"})
    assert resp.status_code == 200
    assert resp.json() == {"ok": True}


def test_login_wrong_password(client):
    resp = client.post("/api/login", json={"username": "test", "password": "wrong"})
    assert resp.status_code == 401


# ---- 新建 ----
def test_create_job_ok(client):
    resp = client.post(
        "/api/jobs",
        json=make_payload(booking_confirmed=True, customs_released=True),
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["id"] is not None
    assert body["job_no"].startswith("EXP")
    assert body["job_no"].endswith("-001")
    assert body["operator"] == "张三"
    assert body["business_type"] == "整柜订舱"  # 默认值落库
    assert body["booking_confirmed"] is True
    assert body["space_released"] is False
    assert body["customs_released"] is True


def test_create_job_missing_required_422(client):
    payload = make_payload()
    del payload["operator"]  # 缺必填
    resp = client.post("/api/jobs", json=payload)
    assert resp.status_code == 422


def test_job_no_increments(client):
    first = client.post("/api/jobs", json=make_payload()).json()["job_no"]
    second = client.post("/api/jobs", json=make_payload()).json()["job_no"]
    assert first.endswith("-001")
    assert second.endswith("-002")


# ---- 列表 + 过滤 + 分页 ----
def test_list_filter_and_paginate(client):
    client.post("/api/jobs", json=make_payload(consignor="宁波甲", vessel="EVER GIVEN"))
    client.post("/api/jobs", json=make_payload(consignor="上海乙", vessel="COSCO"))

    all_resp = client.get("/api/jobs").json()
    assert all_resp["total"] == 2
    assert len(all_resp["items"]) == 2

    filtered = client.get("/api/jobs", params={"consignor": "宁波"}).json()
    assert filtered["total"] == 1
    assert filtered["items"][0]["vessel"] == "EVER GIVEN"

    paged = client.get("/api/jobs", params={"limit": 1}).json()
    assert paged["total"] == 2
    assert len(paged["items"]) == 1


# ---- 明细 ----
def test_get_job_ok(client):
    created = client.post("/api/jobs", json=make_payload()).json()
    resp = client.get(f"/api/jobs/{created['id']}")
    assert resp.status_code == 200
    assert resp.json()["job_no"] == created["job_no"]


def test_get_job_not_found_404(client):
    assert client.get("/api/jobs/9999").status_code == 404


# ---- 编辑 ----
def test_update_job_ok(client):
    created = client.post("/api/jobs", json=make_payload()).json()
    resp = client.put(
        f"/api/jobs/{created['id']}",
        json=make_payload(
            vessel="新船名",
            consignor="改后客户",
            booking_confirmed=True,
            container_released=True,
        ),
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["vessel"] == "新船名"
    assert body["consignor"] == "改后客户"
    assert body["booking_confirmed"] is True
    assert body["container_released"] is True
    assert body["job_no"] == created["job_no"]  # 编辑不改作业号


def test_update_job_not_found_404(client):
    assert client.put("/api/jobs/9999", json=make_payload()).status_code == 404


# ---- 删除 ----
def test_delete_job_ok(client):
    created = client.post("/api/jobs", json=make_payload()).json()
    assert client.delete(f"/api/jobs/{created['id']}").status_code == 204
    assert client.get(f"/api/jobs/{created['id']}").status_code == 404


def test_delete_job_not_found_404(client):
    assert client.delete("/api/jobs/9999").status_code == 404
