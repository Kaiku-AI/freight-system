"""作业单 CRUD 接口（统一前缀 /api/jobs，无鉴权）。对应 DESIGN §5。"""

from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, col, func, select

from db import get_session
from models import Job, JobCreate, JobList, JobRead

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


def generate_job_no(session: Session) -> str:
    """生成作业号 EXP+日期+三位流水，按当天已有数量递增（DESIGN §11）。"""
    prefix = f"EXP{datetime.now():%Y%m%d}"
    last = session.exec(
        select(Job.job_no)
        .where(col(Job.job_no).like(f"{prefix}-%"))
        .order_by(col(Job.job_no).desc())
    ).first()
    seq = int(last.split("-")[1]) + 1 if last else 1
    return f"{prefix}-{seq:03d}"


@router.post("", response_model=JobRead, status_code=201)
def create_job(payload: JobCreate, session: Session = Depends(get_session)) -> Job:
    job = Job(**payload.model_dump(), job_no=generate_job_no(session))
    session.add(job)
    session.commit()
    session.refresh(job)
    return job


@router.get("", response_model=JobList)
def list_jobs(
    session: Session = Depends(get_session),
    job_no: str | None = None,
    consignor: str | None = None,
    vessel: str | None = None,
    voyage: str | None = None,
    mbl_no: str | None = None,
    pol: str | None = None,
    final_destination: str | None = None,
    status: str | None = None,
    booking_agent: str | None = None,
    etd_from: date | None = None,
    etd_to: date | None = None,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
) -> JobList:
    # 文本字段模糊匹配，status 精确，etd 区间——对齐 DESIGN §5 列表筛选
    fuzzy = {
        Job.job_no: job_no,
        Job.consignor: consignor,
        Job.vessel: vessel,
        Job.voyage: voyage,
        Job.mbl_no: mbl_no,
        Job.pol: pol,
        Job.final_destination: final_destination,
        Job.booking_agent: booking_agent,
    }
    conditions = [col(c).ilike(f"%{v}%") for c, v in fuzzy.items() if v]
    if status:
        conditions.append(col(Job.status) == status)
    if etd_from:
        conditions.append(col(Job.etd) >= etd_from)
    if etd_to:
        conditions.append(col(Job.etd) <= etd_to)

    total = session.exec(
        select(func.count()).select_from(Job).where(*conditions)
    ).one()
    items = session.exec(
        select(Job)
        .where(*conditions)
        .order_by(col(Job.created_at).desc())
        .offset(offset)
        .limit(limit)
    ).all()
    return JobList(items=list(items), total=total, limit=limit, offset=offset)


@router.get("/{job_id}", response_model=JobRead)
def get_job(job_id: int, session: Session = Depends(get_session)) -> Job:
    job = session.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="作业不存在")
    return job


@router.put("/{job_id}", response_model=JobRead)
def update_job(
    job_id: int, payload: JobCreate, session: Session = Depends(get_session)
) -> Job:
    job = session.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="作业不存在")
    # 整单覆盖业务字段，保留 id/job_no/created_at，刷新 updated_at
    for key, value in payload.model_dump().items():
        setattr(job, key, value)
    job.updated_at = datetime.now()
    session.add(job)
    session.commit()
    session.refresh(job)
    return job


@router.delete("/{job_id}", status_code=204)
def delete_job(job_id: int, session: Session = Depends(get_session)) -> None:
    job = session.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="作业不存在")
    session.delete(job)
    session.commit()
