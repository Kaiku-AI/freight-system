"""SQLModel 表定义与 API schema。字段一一对照 DESIGN.md §4，改字段只改这里。

本期只有一张表 `job`（整箱作业）。带「必填」注释的对应 DESIGN 中的 `*`。
其余子模块（集装箱/进仓/提单/费用…）本期不建表，见 DESIGN §8。

分层（SQLModel 标准）：
- `JobBase`   业务字段（建单可填、明细可读），是唯一的字段真源。
- `Job`       数据库表 = JobBase + 系统字段（id / job_no / 审计时间）。
- `JobCreate` 建单/编辑入参 = JobBase（job_no 由后端生成，不在入参）。
- `JobRead`   输出 = JobBase + id / job_no / 审计时间。
"""

from datetime import date, datetime

from sqlmodel import Field, SQLModel


class JobBase(SQLModel):
    # ---- A. 基本信息 ----
    operator: str  # 必填 操作员
    consignor: str  # 必填 委托人/客户
    customer_service: str  # 必填 客服
    sales: str  # 必填 销售员
    business_staff: str | None = None  # 商务
    booking_date: date | None = Field(default_factory=date.today)  # 订舱日期，默认当天
    booking_agent: str | None = None
    carrier: str | None = None  # 船东/船公司
    contract_no: str | None = None  # 约号
    vessel: str | None = None  # 船名
    voyage: str | None = None  # 航次
    route: str | None = None  # 航线
    carrier_route: str | None = None  # 船东航线
    so_no: str | None = None  # 船东参考编号/订舱号
    etd: date  # 必填 预计开船
    eta: date | None = None
    atd: date | None = None  # 实际开船
    port_in_date: date | None = None  # 进港日期
    cutoff_date: date | None = None  # 截单日期
    vgm_cutoff: date | None = None  # VGM 截止
    loading_time: datetime | None = None  # 装船时间
    business_type: str = "整柜订舱"  # 必填，本期固定
    shipment_type: str | None = "整箱"  # 固定 FCL
    service_type: str | None = None  # 装→卸，如 CY-CY
    solicit_type: str | None = None  # 揽货方式
    mbl_payment: str  # 必填 MB 付款方式 预付/到付
    hbl_payment: str | None = None  # HB 付款方式
    bl_type: str | None = None  # 出单类型 MBL/HBL
    bl_issue_type: str | None = None  # 正本/电放/Seaway
    original_bl_count: int | None = None  # 正本份数
    copy_bl_count: int | None = None  # 副本份数
    mbl_no: str | None = None  # MB/L No.（提单子模块暂不做，仅存字段）
    hbl_no: str | None = None  # HB/L No.
    contact: str | None = None  # 联系人
    contact_phone: str | None = None
    contact_email: str | None = None
    terminal: str | None = None  # 码头
    customs_broker: str | None = None  # 报关行
    hs_code: str | None = None
    schedule_ref: str | None = None  # 船期表
    status: str | None = "draft"  # 出运状态 draft/active/closed

    # ---- B. 服务/标志位（默认 false）----
    trucking: bool = False  # 拖车
    warehousing: bool = False  # 仓储
    customs_declare: bool = False  # 报关
    inspection: bool = False  # 商检
    ams: bool = False
    ens: bool = False
    rail: bool = False  # 火车
    barge: bool = False  # 驳船
    transit_customs: bool = False  # 转关
    need_container: bool = False  # 需用箱
    free_storage: bool = False  # 免堆存
    yard_loading: bool = False  # 堆场装箱
    insurance: bool = False  # 保险
    advance_duty: bool = False  # 代垫关税
    fumigation: bool = False  # 熏蒸
    ddu: bool = False
    ddp: bool = False
    dap: bool = False

    # ---- C. 托单信息 ----
    packages: int | None = None  # 件数
    package_unit: str | None = None  # 计费单位，如 CARTONS
    gross_weight: float | None = None  # 毛重 KGS
    volume: float | None = None  # 体积 CBM
    chargeable_weight: float | None = None  # 计费重
    inner_packages: int | None = None  # 小件数
    inner_package_type: str | None = None  # 小包装
    packages_in_words: str | None = None  # 大写数量
    cargo_type: str | None = None  # 货物种类
    cargo_name: str | None = None  # 品名
    marks: str | None = None  # 唛头
    shipper: str | None = None  # 发货人
    shipper_detail: str | None = None  # 发货人明细
    ddc: str | None = None  # 附加费标志
    baf: str | None = None
    isps: str | None = None
    place_of_receipt_code: str | None = None  # 收货地代码
    place_of_receipt: str | None = None  # 收货地
    pre_carriage_pol: str | None = None  # 前程起运港
    pol_code: str | None = None  # 起运港代码
    pol: str | None = None  # 起运港
    transit_port_code: str | None = None  # 中转港代码
    pod_code: str | None = None  # 卸货港代码
    pod: str | None = None  # 卸货港
    place_of_delivery: str | None = None  # 交货地
    final_destination: str | None = None  # 目的地（列表筛选用）
    prepaid_at: str | None = None  # 预付地点
    collect_at: str | None = None  # 到付地点
    third_party_payment_at: str | None = None  # 第三方付款地
    telex_release_no: str | None = None  # 电放号
    container_summary: str | None = None  # 箱型箱量，如 1x40HQ
    remarks: str | None = None  # 备注

    # ---- D. 作业确认状态（基本信息勾选项，互相无顺序依赖）----
    booking_confirmed: bool = False  # 订舱确认
    space_released: bool = False  # 放舱确认
    container_released: bool = False  # 放箱确认
    manifest_confirmed: bool = False  # 舱单确认
    customs_released: bool = False  # 海关放行
    sailing_confirmed: bool = False  # 开船确认


class Job(JobBase, table=True):
    __tablename__ = "job"

    id: int | None = Field(default=None, primary_key=True)
    job_no: str = Field(unique=True, index=True)  # 系统生成 EXP+日期+流水
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class JobCreate(JobBase):
    """建单 / 编辑入参（job_no 由后端生成，不在入参）。"""


class JobRead(JobBase):
    """作业明细 / 列表项输出。"""

    id: int
    job_no: str
    created_at: datetime
    updated_at: datetime


class JobList(SQLModel):
    """列表查询返回：当前页数据 + 总数（前端分页用）。"""

    items: list[JobRead]
    total: int
    limit: int
    offset: int


class LoginRequest(SQLModel):
    username: str
    password: str
