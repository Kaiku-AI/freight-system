"""Supabase 连接冒烟脚本（Phase 3 验收 / 切库后复验用）。

在已激活 venv 的 backend 目录下运行：
    python scripts/smoke_supabase.py

读取 backend/.env 的 DATABASE_URL（连接池串，端口 6543），对真实库跑一遍
建表 + 登录 + 作业 CRUD 全链路，最后清理本次产生的测试数据，表恢复原状。
全绿即说明连接池串可用、表结构与接口端到端正常。
"""

import sys
import warnings

warnings.filterwarnings("ignore")

# 允许从 backend/ 直接 import（scripts/ 的上一级）
sys.path.insert(0, ".")

from fastapi.testclient import TestClient  # noqa: E402

from db import create_db_and_tables  # noqa: E402
from index import app  # noqa: E402

TEST_KW = "冒烟测试"  # consignor 关键字，便于事后清理


def main() -> int:
    create_db_and_tables()
    c = TestClient(app)
    results: list[bool] = []

    def chk(label: str, cond: bool) -> None:
        results.append(cond)
        print(f"{'✓' if cond else '✗'} {label}")

    chk("健康检查", c.get("/api/health").json() == {"status": "ok"})
    chk("登录正确", c.post("/api/login", json={"username": "test", "password": "test123"}).status_code == 200)
    chk("登录错密码 401", c.post("/api/login", json={"username": "test", "password": "x"}).status_code == 401)

    payload = {
        "operator": "张三", "consignor": f"{TEST_KW}客户", "customer_service": "李四",
        "sales": "王五", "etd": "2026-06-20", "mbl_payment": "预付",
    }
    r = c.post("/api/jobs", json=payload)
    chk("建单 201", r.status_code == 201)
    jid = r.json()["id"]
    print(f"   job_no={r.json()['job_no']}")

    chk("缺必填 422", c.post("/api/jobs", json={"operator": "x"}).status_code == 422)
    chk("列表过滤命中", any(j["id"] == jid for j in c.get("/api/jobs", params={"consignor": TEST_KW}).json()["items"]))
    chk("明细 200", c.get(f"/api/jobs/{jid}").status_code == 200)
    chk("查无 404", c.get("/api/jobs/999999").status_code == 404)
    chk("编辑保存", c.put(f"/api/jobs/{jid}", json={**payload, "consignor": f"{TEST_KW}改后"}).json()["consignor"] == f"{TEST_KW}改后")
    chk("删除 204", c.delete(f"/api/jobs/{jid}").status_code == 204)
    chk("删后 404", c.get(f"/api/jobs/{jid}").status_code == 404)

    # 清理本次残留（含改名后的行），保证可重复运行
    for j in c.get("/api/jobs", params={"consignor": TEST_KW, "limit": 100}).json()["items"]:
        c.delete(f"/api/jobs/{j['id']}")

    ok = all(results)
    print("\n" + ("🎉 Supabase 冒烟全部通过" if ok else "❌ 有步骤失败，见上"))
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
