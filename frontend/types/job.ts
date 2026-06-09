// 作业（整箱）字段类型——与后端 SQLModel(`backend/models.py` JobBase) / DESIGN §4 一一对应。
// 改字段一处改：先改后端 models.py 与 DESIGN §4，再同步此文件。
// 日期/时间在 JSON 中是字符串（后端序列化 date/datetime → ISO 字符串）。

// 业务字段（建单可填、明细可读），对应后端 JobBase。
export type JobBase = {
  // ---- A. 基本信息 ----
  operator: string; // 必填 操作员
  consignor: string; // 必填 委托人/客户
  customer_service: string; // 必填 客服
  sales: string; // 必填 销售员
  business_staff?: string | null; // 商务
  booking_date?: string | null; // 订舱日期
  booking_agent?: string | null;
  carrier?: string | null; // 船东/船公司
  contract_no?: string | null; // 约号
  vessel?: string | null; // 船名
  voyage?: string | null; // 航次
  route?: string | null; // 航线
  carrier_route?: string | null; // 船东航线
  so_no?: string | null; // 船东参考编号/订舱号
  etd: string; // 必填 预计开船
  eta?: string | null;
  atd?: string | null; // 实际开船
  port_in_date?: string | null; // 进港日期
  cutoff_date?: string | null; // 截单日期
  vgm_cutoff?: string | null; // VGM 截止
  loading_time?: string | null; // 装船时间
  business_type: string; // 必填，本期固定「整柜订舱」
  shipment_type?: string | null; // 固定「整箱」
  service_type?: string | null; // 装→卸，如 CY-CY
  solicit_type?: string | null; // 揽货方式
  mbl_payment: string; // 必填 MB 付款方式 预付/到付
  hbl_payment?: string | null; // HB 付款方式
  bl_type?: string | null; // 出单类型 MBL/HBL
  bl_issue_type?: string | null; // 正本/电放/Seaway
  original_bl_count?: number | null; // 正本份数
  copy_bl_count?: number | null; // 副本份数
  mbl_no?: string | null; // MB/L No.
  hbl_no?: string | null; // HB/L No.
  contact?: string | null; // 联系人
  contact_phone?: string | null;
  contact_email?: string | null;
  terminal?: string | null; // 码头
  customs_broker?: string | null; // 报关行
  hs_code?: string | null;
  schedule_ref?: string | null; // 船期表
  status?: string | null; // 出运状态 draft/active/closed

  // ---- B. 服务/标志位（默认 false）----
  trucking: boolean; // 拖车
  warehousing: boolean; // 仓储
  customs_declare: boolean; // 报关
  inspection: boolean; // 商检
  ams: boolean;
  ens: boolean;
  rail: boolean; // 火车
  barge: boolean; // 驳船
  transit_customs: boolean; // 转关
  need_container: boolean; // 需用箱
  free_storage: boolean; // 免堆存
  yard_loading: boolean; // 堆场装箱
  insurance: boolean; // 保险
  advance_duty: boolean; // 代垫关税
  fumigation: boolean; // 熏蒸
  ddu: boolean;
  ddp: boolean;
  dap: boolean;

  // ---- C. 托单信息 ----
  packages?: number | null; // 件数
  package_unit?: string | null; // 计费单位
  gross_weight?: number | null; // 毛重 KGS
  volume?: number | null; // 体积 CBM
  chargeable_weight?: number | null; // 计费重
  inner_packages?: number | null; // 小件数
  inner_package_type?: string | null; // 小包装
  packages_in_words?: string | null; // 大写数量
  cargo_type?: string | null; // 货物种类
  cargo_name?: string | null; // 品名
  marks?: string | null; // 唛头
  shipper?: string | null; // 发货人
  shipper_detail?: string | null; // 发货人明细
  ddc?: string | null; // 附加费标志
  baf?: string | null;
  isps?: string | null;
  place_of_receipt_code?: string | null; // 收货地代码
  place_of_receipt?: string | null; // 收货地
  pre_carriage_pol?: string | null; // 前程起运港
  pol_code?: string | null; // 起运港代码
  pol?: string | null; // 起运港
  transit_port_code?: string | null; // 中转港代码
  pod_code?: string | null; // 卸货港代码
  pod?: string | null; // 卸货港
  place_of_delivery?: string | null; // 交货地
  final_destination?: string | null; // 目的地（列表筛选用）
  prepaid_at?: string | null; // 预付地点
  collect_at?: string | null; // 到付地点
  third_party_payment_at?: string | null; // 第三方付款地
  telex_release_no?: string | null; // 电放号
  container_summary?: string | null; // 箱型箱量，如 1x40HQ
  remarks?: string | null; // 备注

  // ---- D. 作业确认状态（基本信息勾选项，互相无顺序依赖）----
  booking_confirmed: boolean; // 订舱确认
  space_released: boolean; // 放舱确认
  container_released: boolean; // 放箱确认
  manifest_confirmed: boolean; // 舱单确认
  customs_released: boolean; // 海关放行
  sailing_confirmed: boolean; // 开船确认
};

// 建单/编辑入参（job_no 由后端生成，不在入参）——对应后端 JobCreate。
export type JobCreate = JobBase;

// 作业明细/列表项输出——对应后端 JobRead。
export type Job = JobBase & {
  id: number;
  job_no: string;
  created_at: string;
  updated_at: string;
};

// 列表查询返回——对应后端 JobList。
export type JobList = {
  items: Job[];
  total: number;
  limit: number;
  offset: number;
};
