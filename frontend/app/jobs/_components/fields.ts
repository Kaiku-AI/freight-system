// 作业表单/明细的字段元数据——驱动新建表单、编辑表单、只读明细三处渲染，避免多处硬编码。
// 字段顺序与分块照 DESIGN §4；必填项对应后端 JobBase 中无默认值的字段。
import type { Job, JobBase, JobCreate } from "@/types/job";

export type FieldType = "text" | "date" | "datetime" | "number" | "select" | "textarea";

export type FieldDef = {
  name: keyof JobBase;
  label: string;
  type?: FieldType; // 默认 text
  required?: boolean; // 必填：表单黄底红星 + 提交校验
  options?: readonly { value: string; label: string }[]; // type=select 时用
  full?: boolean; // 占满整行（如 textarea）
};

export const PAYMENT_OPTIONS = [
  { value: "预付", label: "预付" },
  { value: "到付", label: "到付" },
] as const;

export const BL_TYPE_OPTIONS = [
  { value: "MBL", label: "MBL" },
  { value: "HBL", label: "HBL" },
] as const;

// 出运状态 draft/active/closed（DESIGN §4）。
export const STATUS_OPTIONS = [
  { value: "draft", label: "草稿" },
  { value: "active", label: "出运中" },
  { value: "closed", label: "已关闭" },
] as const;

export const statusLabel = (s?: string | null) =>
  STATUS_OPTIONS.find((o) => o.value === s)?.label ?? s ?? "-";

// 出运状态胶囊配色（取自 Penpot 列表状态色）：底色/文字静态类，供列表与明细共用。
const STATUS_STYLE: Record<string, string> = {
  draft: "bg-[#e9f2ff] text-[#2c6fd6]",
  active: "bg-[#e6f7f0] text-[#138a5b]",
  closed: "bg-[#f1ecfe] text-[#7a47d8]",
};

export const statusBadgeClass = (s?: string | null) =>
  STATUS_STYLE[s ?? ""] ?? "bg-field text-muted";

// 日期/时间在 JSON 里是 ISO 字符串，展示/表单里只取需要的前缀。
export const fmtDate = (s?: string | null) => (s ? s.slice(0, 10) : "-");
export const fmtDateTime = (s?: string | null) => (s ? s.slice(0, 16).replace("T", " ") : "-");

// A. 基本信息（DESIGN §4-A）。
export const BASIC_FIELDS: FieldDef[] = [
  { name: "operator", label: "操作员", required: true },
  { name: "consignor", label: "委托人/客户", required: true },
  { name: "customer_service", label: "客服", required: true },
  { name: "sales", label: "销售员", required: true },
  { name: "business_staff", label: "商务" },
  { name: "booking_date", label: "订舱日期", type: "date" },
  { name: "booking_agent", label: "订舱代理" },
  { name: "carrier", label: "船东/船公司" },
  { name: "contract_no", label: "约号" },
  { name: "vessel", label: "船名" },
  { name: "voyage", label: "航次" },
  { name: "route", label: "航线" },
  { name: "carrier_route", label: "船东航线" },
  { name: "so_no", label: "船东订舱号" },
  { name: "etd", label: "ETD（预计开船）", type: "date", required: true },
  { name: "eta", label: "ETA", type: "date" },
  { name: "atd", label: "ATD（实际开船）", type: "date" },
  { name: "port_in_date", label: "进港日期", type: "date" },
  { name: "cutoff_date", label: "截单日期", type: "date" },
  { name: "vgm_cutoff", label: "VGM 截止", type: "date" },
  { name: "loading_time", label: "装船时间", type: "datetime" },
  { name: "business_type", label: "业务性质", required: true },
  { name: "shipment_type", label: "出运类型" },
  { name: "service_type", label: "服务类型（装-卸）" },
  { name: "solicit_type", label: "揽货方式" },
  { name: "mbl_payment", label: "MB 付款方式", type: "select", required: true, options: PAYMENT_OPTIONS },
  { name: "hbl_payment", label: "HB 付款方式", type: "select", options: PAYMENT_OPTIONS },
  { name: "bl_type", label: "出单类型", type: "select", options: BL_TYPE_OPTIONS },
  { name: "bl_issue_type", label: "海运提单类型" },
  { name: "original_bl_count", label: "正本份数", type: "number" },
  { name: "copy_bl_count", label: "副本份数", type: "number" },
  { name: "mbl_no", label: "MB/L No." },
  { name: "hbl_no", label: "HB/L No." },
  { name: "contact", label: "联系人" },
  { name: "contact_phone", label: "电话" },
  { name: "contact_email", label: "邮件" },
  { name: "terminal", label: "码头" },
  { name: "customs_broker", label: "报关行" },
  { name: "hs_code", label: "HSCode" },
  { name: "schedule_ref", label: "船期表" },
  { name: "status", label: "出运状态", type: "select", options: STATUS_OPTIONS },
];

// C. 托单信息（DESIGN §4-C）。
export const CONSIGNMENT_FIELDS: FieldDef[] = [
  { name: "packages", label: "件数", type: "number" },
  { name: "package_unit", label: "计费单位" },
  { name: "gross_weight", label: "毛重(KGS)", type: "number" },
  { name: "volume", label: "体积(CBM)", type: "number" },
  { name: "chargeable_weight", label: "计费重", type: "number" },
  { name: "inner_packages", label: "小件数", type: "number" },
  { name: "inner_package_type", label: "小包装" },
  { name: "packages_in_words", label: "大写数量" },
  { name: "cargo_type", label: "货物种类" },
  { name: "cargo_name", label: "品名" },
  { name: "marks", label: "唛头", type: "textarea", full: true },
  { name: "shipper", label: "发货人" },
  { name: "shipper_detail", label: "发货人明细", type: "textarea", full: true },
  { name: "ddc", label: "DDC" },
  { name: "baf", label: "BAF" },
  { name: "isps", label: "ISPS" },
  { name: "place_of_receipt_code", label: "收货地代码" },
  { name: "place_of_receipt", label: "收货地" },
  { name: "pre_carriage_pol", label: "前程起运港" },
  { name: "pol_code", label: "起运港代码" },
  { name: "pol", label: "起运港" },
  { name: "transit_port_code", label: "中转港代码" },
  { name: "pod_code", label: "卸货港代码" },
  { name: "pod", label: "卸货港" },
  { name: "place_of_delivery", label: "交货地" },
  { name: "final_destination", label: "目的地" },
  { name: "prepaid_at", label: "预付地点" },
  { name: "collect_at", label: "到付地点" },
  { name: "third_party_payment_at", label: "第三方付款地" },
  { name: "telex_release_no", label: "电放号" },
  { name: "container_summary", label: "箱型箱量" },
  { name: "remarks", label: "备注", type: "textarea", full: true },
];

// B. 服务/标志位（DESIGN §4-B，均为 bool，默认 false）。
export const SERVICE_FLAGS: { name: keyof JobBase; label: string }[] = [
  { name: "trucking", label: "拖车" },
  { name: "warehousing", label: "仓储" },
  { name: "customs_declare", label: "报关" },
  { name: "inspection", label: "商检" },
  { name: "ams", label: "AMS" },
  { name: "ens", label: "ENS" },
  { name: "rail", label: "火车" },
  { name: "barge", label: "驳船" },
  { name: "transit_customs", label: "转关" },
  { name: "need_container", label: "需用箱" },
  { name: "free_storage", label: "免堆存" },
  { name: "yard_loading", label: "堆场装箱" },
  { name: "insurance", label: "保险" },
  { name: "advance_duty", label: "代垫关税" },
  { name: "fumigation", label: "熏蒸" },
  { name: "ddu", label: "DDU" },
  { name: "ddp", label: "DDP" },
  { name: "dap", label: "DAP" },
];

// D. 作业确认状态（DESIGN §4-D，基本信息中的独立 checkbox）。
export const CONFIRMATION_FLAGS: { name: keyof JobBase; label: string }[] = [
  { name: "booking_confirmed", label: "订舱确认" },
  { name: "space_released", label: "放舱确认" },
  { name: "container_released", label: "放箱确认" },
  { name: "manifest_confirmed", label: "舱单确认" },
  { name: "customs_released", label: "海关放行" },
  { name: "sailing_confirmed", label: "开船确认" },
];

// ---- 表单纯函数（与 React 解耦，便于单测）----

// 所有「值字段」（非服务标志）——表单状态/payload 构建按它遍历。
export const VALUE_FIELDS: FieldDef[] = [...BASIC_FIELDS, ...CONSIGNMENT_FIELDS];

// 表单状态：值字段存字符串，服务/确认状态存布尔。
export type FormState = Record<string, string | boolean>;

const today = () => new Date().toISOString().slice(0, 10);

// 模拟向船公司发订舱 EDI 后收到的回执：仅含一个船东订舱号（SO+日期+4位流水）。
// 纯函数、无副作用，便于单测；落库与否由调用方决定（本期只回填表单、不自动保存）。
export type BookingReceipt = { so_no: string };

export function makeBookingReceipt(): BookingReceipt {
  const seq = String(Math.floor(1000 + Math.random() * 9000));
  return { so_no: `SO${today().replace(/-/g, "")}-${seq}` };
}

// 把作业（编辑）或默认值（新建）铺成表单初始状态。
export function initialFormState(job?: Job): FormState {
  const state: FormState = {};
  for (const f of VALUE_FIELDS) {
    const v = job?.[f.name];
    if (v == null) {
      state[f.name] = "";
    } else if (f.type === "datetime") {
      state[f.name] = String(v).slice(0, 16); // datetime-local 需 YYYY-MM-DDTHH:mm
    } else if (f.type === "date") {
      state[f.name] = String(v).slice(0, 10);
    } else {
      state[f.name] = String(v);
    }
  }
  for (const f of [...SERVICE_FLAGS, ...CONFIRMATION_FLAGS]) {
    state[f.name] = Boolean(job?.[f.name]);
  }
  // 新建时补后端默认值（DESIGN §4），让用户看到并可改。
  if (!job) {
    state.business_type = "整柜订舱";
    state.shipment_type = "整箱";
    state.status = "draft";
    state.booking_date = today();
  }
  return state;
}

// 返回未填写的必填字段（提交前校验，避免空串触发后端 422）。
export function missingRequired(state: FormState): FieldDef[] {
  return VALUE_FIELDS.filter(
    (f) => f.required && String(state[f.name] ?? "").trim() === "",
  );
}

// 表单状态 → JobCreate：空串转 null，数字字段转 number，标志位保留布尔。
export function buildJobPayload(state: FormState): JobCreate {
  const payload: Record<string, unknown> = {};
  for (const f of VALUE_FIELDS) {
    const raw = String(state[f.name] ?? "").trim();
    if (raw === "") {
      payload[f.name] = null;
    } else if (f.type === "number") {
      payload[f.name] = Number(raw);
    } else {
      payload[f.name] = raw;
    }
  }
  for (const f of [...SERVICE_FLAGS, ...CONFIRMATION_FLAGS]) {
    payload[f.name] = Boolean(state[f.name]);
  }
  return payload as JobCreate;
}
