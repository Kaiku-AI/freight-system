import { describe, expect, it } from "vitest";

import {
  buildJobPayload,
  initialFormState,
  missingRequired,
} from "@/app/jobs/_components/fields";
import type { Job } from "@/types/job";

describe("initialFormState", () => {
  it("新建：补默认值、字符串字段空串、标志位 false", () => {
    const s = initialFormState();
    expect(s.business_type).toBe("整柜订舱");
    expect(s.shipment_type).toBe("整箱");
    expect(s.status).toBe("draft");
    expect(s.booking_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(s.operator).toBe(""); // 必填但新建为空
    expect(s.trucking).toBe(false);
  });

  it("编辑：date/datetime 截断到输入控件所需格式、标志位转布尔", () => {
    const job = {
      operator: "张三",
      etd: "2026-06-09",
      loading_time: "2026-06-09T08:30:00",
      gross_weight: 1200.5,
      trucking: true,
      customs_declare: false,
    } as unknown as Job;
    const s = initialFormState(job);
    expect(s.operator).toBe("张三");
    expect(s.etd).toBe("2026-06-09");
    expect(s.loading_time).toBe("2026-06-09T08:30"); // datetime-local
    expect(s.gross_weight).toBe("1200.5");
    expect(s.trucking).toBe(true);
    expect(s.customs_declare).toBe(false);
  });
});

describe("missingRequired", () => {
  it("缺必填项时全部列出", () => {
    const s = initialFormState(); // operator/consignor/... 均空，etd/mbl_payment 空
    const names = missingRequired(s).map((f) => f.name);
    expect(names).toContain("operator");
    expect(names).toContain("consignor");
    expect(names).toContain("customer_service");
    expect(names).toContain("sales");
    expect(names).toContain("etd");
    expect(names).toContain("mbl_payment");
    expect(names).not.toContain("business_type"); // 有默认值，不缺
  });

  it("必填项填齐后无缺项", () => {
    const s = initialFormState();
    Object.assign(s, {
      operator: "李四",
      consignor: "上海某公司",
      customer_service: "王五",
      sales: "赵六",
      etd: "2026-07-01",
      mbl_payment: "预付",
    });
    expect(missingRequired(s)).toHaveLength(0);
  });
});

describe("buildJobPayload", () => {
  it("空串转 null、数字字段转 number、标志位保留布尔", () => {
    const s = initialFormState();
    Object.assign(s, {
      operator: "李四",
      packages: "100",
      gross_weight: "1200.5",
      remarks: "  ", // 仅空白 → null
      trucking: true,
    });
    const p = buildJobPayload(s);
    expect(p.operator).toBe("李四");
    expect(p.packages).toBe(100);
    expect(p.gross_weight).toBe(1200.5);
    expect(p.business_staff).toBeNull(); // 未填
    expect(p.remarks).toBeNull(); // 空白被 trim 后视为空
    expect(p.trucking).toBe(true);
    expect(p.warehousing).toBe(false);
  });
});
