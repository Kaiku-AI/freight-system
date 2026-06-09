import { afterEach, describe, expect, it, vi } from "vitest";

import { deleteJob, getJobs } from "@/lib/api";

// 用假 fetch 捕获请求 URL/方法，验证筛选参数拼装（DESIGN §5：空值不进 query）。
function mockFetch(status = 200, body: unknown = { items: [], total: 0, limit: 20, offset: 0 }) {
  const fetchMock = vi.fn(async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => vi.unstubAllGlobals());

describe("getJobs 筛选参数拼装", () => {
  it("无筛选时只请求基础路径", async () => {
    const f = mockFetch();
    await getJobs();
    expect(f).toHaveBeenCalledWith("/api/jobs", undefined);
  });

  it("空字符串/未定义的筛选项被忽略，非空项进 query", async () => {
    const f = mockFetch();
    await getJobs({ consignor: "上海", vessel: "", pol: undefined, limit: 20, offset: 40 });
    const url = f.mock.calls[0][0] as string;
    const params = new URLSearchParams(url.split("?")[1]);
    expect(params.get("consignor")).toBe("上海");
    expect(params.has("vessel")).toBe(false);
    expect(params.has("pol")).toBe(false);
    expect(params.get("limit")).toBe("20");
    expect(params.get("offset")).toBe("40");
  });
});

describe("deleteJob", () => {
  it("发 DELETE 且 204 无内容返回 undefined", async () => {
    const f = mockFetch(204, null);
    const res = await deleteJob(7);
    expect(f).toHaveBeenCalledWith("/api/jobs/7", { method: "DELETE" });
    expect(res).toBeUndefined();
  });

  it("非 2xx 抛出后端 detail", async () => {
    mockFetch(404, { detail: "作业不存在" });
    await expect(deleteJob(99)).rejects.toThrow("作业不存在");
  });
});
