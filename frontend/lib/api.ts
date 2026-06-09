// 服务端数据访问层（DESIGN §7.3）：作业列表/明细/写入/删除统一走原生 fetch，不用 SWR。
// 客户端 UI 状态（登录标记）不在这里，走 Zustand（lib/store.ts）。
import type { Job, JobCreate, JobList } from "@/types/job";

// 列表筛选参数——对齐后端 GET /api/jobs 支持的过滤项（DESIGN §5）。
export type JobFilters = {
  job_no?: string;
  consignor?: string;
  vessel?: string;
  voyage?: string;
  mbl_no?: string;
  pol?: string;
  final_destination?: string;
  status?: string;
  booking_agent?: string;
  etd_from?: string;
  etd_to?: string;
  limit?: number;
  offset?: number;
};

// 统一错误：抛出后端 detail（无则用状态码兜底），调用方 catch 后提示。
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, init);
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.detail ?? `请求失败（${res.status}）`);
  }
  // 204 无内容（如删除成功）。
  return res.status === 204 ? (undefined as T) : await res.json();
}

export function getJobs(filters: JobFilters = {}): Promise<JobList> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  }
  const qs = params.toString();
  return request<JobList>(`/api/jobs${qs ? `?${qs}` : ""}`);
}

export function getJob(id: number): Promise<Job> {
  return request<Job>(`/api/jobs/${id}`);
}

export function createJob(payload: JobCreate): Promise<Job> {
  return request<Job>("/api/jobs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function updateJob(id: number, payload: JobCreate): Promise<Job> {
  return request<Job>(`/api/jobs/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function deleteJob(id: number): Promise<void> {
  return request<void>(`/api/jobs/${id}`, { method: "DELETE" });
}
