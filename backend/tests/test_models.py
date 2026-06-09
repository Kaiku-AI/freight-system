"""Phase 1 回归：job 表能建、能写、能读。

用独立 in-memory SQLite，不碰本地 freight.db，保证测试隔离。
"""

from datetime import date

import pytest
from sqlmodel import Session, SQLModel, create_engine, select
from sqlmodel.pool import StaticPool

from models import Job


@pytest.fixture
def session():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as s:
        yield s


def test_insert_and_select_job(session):
    job = Job(
        job_no="EXP20260609-001",
        operator="张三",
        consignor="宁波某贸易公司",
        customer_service="李四",
        sales="王五",
        etd=date(2026, 6, 20),
        mbl_payment="预付",
        trucking=True,
        gross_weight=12000.5,
    )
    session.add(job)
    session.commit()

    got = session.exec(select(Job).where(Job.job_no == "EXP20260609-001")).one()

    assert got.id is not None
    assert got.operator == "张三"
    assert got.etd == date(2026, 6, 20)
    assert got.trucking is True
    assert got.gross_weight == 12000.5
    # 默认值落库
    assert got.business_type == "整柜订舱"
    assert got.shipment_type == "整箱"
    assert got.status == "draft"
    assert got.customs_declare is False
    assert got.booking_date == date.today()
    assert got.created_at is not None
