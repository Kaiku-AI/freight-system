"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { deleteJob, getJobs, type JobFilters } from "@/lib/api";
import type { Job } from "@/types/job";

import {
  CONFIRMATION_FLAGS,
  STATUS_OPTIONS,
  fmtDate,
  statusBadgeClass,
  statusLabel,
} from "./fields";
import { ToolbarDivider, ToolbarGhost } from "./Toolbar";

const PAGE_SIZE = 20;

// 文本筛选项——对齐列表列与后端 GET /api/jobs（DESIGN §5）。
const TEXT_FILTERS = [
  { key: "job_no", label: "作业号" },
  { key: "consignor", label: "委托人" },
  { key: "vessel", label: "船名" },
  { key: "mbl_no", label: "MB/L No." },
  { key: "pol", label: "起运港" },
  { key: "final_destination", label: "目的地" },
] as const;

// 布尔列：与基本信息 checkbox 保持同一视觉语言。
function Flag({ on, label }: { on: boolean; label: string }) {
  return (
    <input
      type="checkbox"
      aria-label={label}
      checked={on}
      readOnly
      className="check-brand"
    />
  );
}

export default function JobListClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const offset = Math.max(0, Number(searchParams.get("offset") ?? 0));
  // 把 URL query 还原成筛选参数，喂给 getJobs。
  const query = searchParams.toString();

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const filters: JobFilters = {
        limit: PAGE_SIZE,
        offset: Math.max(0, Number(searchParams.get("offset") ?? 0)),
      };
      for (const { key } of TEXT_FILTERS) {
        const v = searchParams.get(key);
        if (v) filters[key] = v;
      }
      const status = searchParams.get("status");
      if (status) filters.status = status;
      const etdFrom = searchParams.get("etd_from");
      if (etdFrom) filters.etd_from = etdFrom;
      const etdTo = searchParams.get("etd_to");
      if (etdTo) filters.etd_to = etdTo;

      const data = await getJobs(filters);
      setJobs(data.items);
      setTotal(data.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  // 筛选/分页变化（URL query 变化）即重拉。
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  // 提交筛选：把表单值写进 URL query（offset 归零），交由上面 effect 重拉。
  function onSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    for (const [key, value] of form.entries()) {
      const v = String(value).trim();
      if (v) params.set(key, v);
    }
    router.push(`/jobs?${params.toString()}`);
  }

  function onReset() {
    router.push("/jobs");
  }

  function goPage(nextOffset: number) {
    const params = new URLSearchParams(query);
    if (nextOffset <= 0) params.delete("offset");
    else params.set("offset", String(nextOffset));
    router.push(`/jobs?${params.toString()}`);
  }

  async function onDelete(job: Job) {
    if (!window.confirm(`确认删除作业 ${job.job_no}？此操作不可撤销。`)) return;
    try {
      await deleteJob(job.id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "删除失败");
    }
  }

  const from = total === 0 ? 0 : offset + 1;
  const to = Math.min(offset + PAGE_SIZE, total);

  const inputCls =
    "rounded-lg border border-line bg-white px-3 py-1.5 text-sm text-ink outline-none transition-colors focus:border-brand";

  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="mb-4 text-2xl font-semibold text-ink">作业列表</h1>

      {/* 顶部工具栏（还原 Penpot）：新建可用，其余仅展示 */}
      <div className="mb-5 flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-white p-3">
        <Link
          href="/jobs/new"
          className="rounded-lg bg-brand px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
        >
          + 新建整箱
        </Link>
        <ToolbarGhost items={["复制", "删除"]} />
        <ToolbarDivider />
        <ToolbarGhost
          items={["热搜索", "动作 ▾", "打印 ▾", "数据交换 ▾", "数据分析 ▾", "导出", "系统功能 ▾"]}
        />
      </div>

      {/* 筛选条——值由 name 还原进 URL query */}
      <form
        onSubmit={onSearch}
        className="mb-5 rounded-2xl border border-line bg-white p-5"
      >
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink">
          <span className="h-3.5 w-1 rounded-full bg-brand" />
          筛选条件
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {TEXT_FILTERS.map(({ key, label }) => (
            <label key={key} className="flex flex-col gap-1 text-xs text-muted">
              {label}
              <input
                name={key}
                defaultValue={searchParams.get(key) ?? ""}
                className={inputCls}
              />
            </label>
          ))}
          <label className="flex flex-col gap-1 text-xs text-muted">
            出运状态
            <select
              name="status"
              defaultValue={searchParams.get("status") ?? ""}
              className={inputCls}
            >
              <option value="">全部</option>
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted">
            ETD 从
            <input
              type="date"
              name="etd_from"
              defaultValue={searchParams.get("etd_from") ?? ""}
              className={inputCls}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted">
            ETD 至
            <input
              type="date"
              name="etd_to"
              defaultValue={searchParams.get("etd_to") ?? ""}
              className={inputCls}
            />
          </label>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onReset}
            className="rounded-lg border border-line-strong px-4 py-1.5 text-sm text-body transition-colors hover:bg-canvas"
          >
            重置
          </button>
          <button
            type="submit"
            className="rounded-lg bg-brand px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
          >
            搜索
          </button>
        </div>
      </form>

      {error && <p className="mb-4 text-sm text-star">{error}</p>}

      <div className="rounded-2xl border border-line bg-white">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
            <span className="h-3.5 w-1 rounded-full bg-brand" />
            作业列表
          </h2>
          <span className="text-xs text-muted">{`共 ${total} 票`}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[1500px] w-full text-left text-sm">
            <thead className="border-y border-line bg-canvas text-xs text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">作业号</th>
                <th className="px-4 py-3 font-medium">委托人</th>
                <th className="px-4 py-3 font-medium">船名·航次</th>
                <th className="px-4 py-3 font-medium">MB/L No.</th>
                <th className="px-4 py-3 font-medium">起运港</th>
                <th className="px-4 py-3 font-medium">目的地</th>
                <th className="px-4 py-3 font-medium">ETD</th>
                <th className="px-4 py-3 font-medium">出运状态</th>
                {CONFIRMATION_FLAGS.map((f) => (
                  <th key={f.name} className="px-3 py-3 text-center font-medium">
                    {f.label}
                  </th>
                ))}
                <th className="px-4 py-3 text-center font-medium">拖车</th>
                <th className="px-4 py-3 text-center font-medium">报关</th>
                <th className="px-4 py-3 text-right font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading ? (
                <tr>
                  <td colSpan={17} className="px-4 py-10 text-center text-faint">
                    加载中…
                  </td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={17} className="px-4 py-10 text-center text-faint">
                    暂无作业
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-canvas">
                    <td className="px-4 py-3">
                      <Link
                        href={`/jobs/${job.id}`}
                        className="font-medium text-brand hover:text-brand-dark"
                      >
                        {job.job_no}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{job.consignor}</td>
                    <td className="px-4 py-3">
                      {[job.vessel, job.voyage].filter(Boolean).join(" · ") || "-"}
                    </td>
                    <td className="px-4 py-3">{job.mbl_no || "-"}</td>
                    <td className="px-4 py-3">{job.pol || "-"}</td>
                    <td className="px-4 py-3">{job.final_destination || "-"}</td>
                    <td className="px-4 py-3">{fmtDate(job.etd)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(job.status)}`}
                      >
                        {statusLabel(job.status)}
                      </span>
                    </td>
                    {CONFIRMATION_FLAGS.map((f) => (
                      <td key={f.name} className="px-3 py-3 text-center">
                        <Flag on={Boolean(job[f.name])} label={f.label} />
                      </td>
                    ))}
                    <td className="px-4 py-3 text-center">
                      <Flag on={job.trucking} label="拖车" />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Flag on={job.customs_declare} label="报关" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => onDelete(job)}
                        className="rounded-lg border border-line-strong px-2.5 py-1 text-xs text-star transition-colors hover:bg-[#fef2f4]"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 分页 */}
      <div className="mt-4 flex items-center justify-between text-sm text-muted">
        <span>
          {total > 0 ? `第 ${from}–${to} 条，共 ${total} 条` : "共 0 条"}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={offset <= 0}
            onClick={() => goPage(offset - PAGE_SIZE)}
            className="rounded-lg border border-line-strong px-3 py-1.5 text-body transition-colors hover:bg-canvas disabled:opacity-40"
          >
            上一页
          </button>
          <button
            type="button"
            disabled={to >= total}
            onClick={() => goPage(offset + PAGE_SIZE)}
            className="rounded-lg border border-line-strong px-3 py-1.5 text-body transition-colors hover:bg-canvas disabled:opacity-40"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  );
}
