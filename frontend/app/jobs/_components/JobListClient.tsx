"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { deleteJob, getJobs, type JobFilters } from "@/lib/api";
import type { Job } from "@/types/job";

import { STATUS_OPTIONS, fmtDate, statusLabel } from "./fields";

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

const flag = (b: boolean) => (b ? "✓" : "—");

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
    load();
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

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900">作业列表</h1>
        <Link
          href="/jobs/new"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
        >
          新建整箱
        </Link>
      </div>

      {/* 筛选条——值由 name 还原进 URL query */}
      <form
        onSubmit={onSearch}
        className="mb-5 grid grid-cols-2 gap-3 rounded-xl border border-zinc-200 bg-white p-4 sm:grid-cols-3 lg:grid-cols-4"
      >
        {TEXT_FILTERS.map(({ key, label }) => (
          <label key={key} className="flex flex-col gap-1 text-xs text-zinc-500">
            {label}
            <input
              name={key}
              defaultValue={searchParams.get(key) ?? ""}
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-900"
            />
          </label>
        ))}
        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          出运状态
          <select
            name="status"
            defaultValue={searchParams.get("status") ?? ""}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-900"
          >
            <option value="">全部</option>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          ETD 从
          <input
            type="date"
            name="etd_from"
            defaultValue={searchParams.get("etd_from") ?? ""}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          ETD 至
          <input
            type="date"
            name="etd_to"
            defaultValue={searchParams.get("etd_to") ?? ""}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-900"
          />
        </label>
        <div className="col-span-full flex gap-2">
          <button
            type="submit"
            className="rounded-md bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
          >
            查询
          </button>
          <button
            type="button"
            onClick={onReset}
            className="rounded-md border border-zinc-300 px-4 py-1.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-100"
          >
            重置
          </button>
        </div>
      </form>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 text-xs text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">作业号</th>
              <th className="px-4 py-3 font-medium">委托人</th>
              <th className="px-4 py-3 font-medium">船名·航次</th>
              <th className="px-4 py-3 font-medium">MB/L No.</th>
              <th className="px-4 py-3 font-medium">起运港</th>
              <th className="px-4 py-3 font-medium">目的地</th>
              <th className="px-4 py-3 font-medium">ETD</th>
              <th className="px-4 py-3 font-medium">出运状态</th>
              <th className="px-4 py-3 text-center font-medium">拖车</th>
              <th className="px-4 py-3 text-center font-medium">报关</th>
              <th className="px-4 py-3 text-center font-medium">提单</th>
              <th className="px-4 py-3 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {loading ? (
              <tr>
                <td colSpan={12} className="px-4 py-10 text-center text-zinc-400">
                  加载中…
                </td>
              </tr>
            ) : jobs.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-4 py-10 text-center text-zinc-400">
                  暂无作业
                </td>
              </tr>
            ) : (
              jobs.map((job) => (
                <tr key={job.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/jobs/${job.id}`}
                      className="font-medium text-zinc-900 hover:underline"
                    >
                      {job.job_no}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-zinc-700">{job.consignor}</td>
                  <td className="px-4 py-3 text-zinc-700">
                    {[job.vessel, job.voyage].filter(Boolean).join(" · ") || "-"}
                  </td>
                  <td className="px-4 py-3 text-zinc-700">{job.mbl_no || "-"}</td>
                  <td className="px-4 py-3 text-zinc-700">{job.pol || "-"}</td>
                  <td className="px-4 py-3 text-zinc-700">{job.final_destination || "-"}</td>
                  <td className="px-4 py-3 text-zinc-700">{fmtDate(job.etd)}</td>
                  <td className="px-4 py-3 text-zinc-700">{statusLabel(job.status)}</td>
                  <td className="px-4 py-3 text-center text-zinc-700">{flag(job.trucking)}</td>
                  <td className="px-4 py-3 text-center text-zinc-700">
                    {flag(job.customs_declare)}
                  </td>
                  {/* 提单：提单确认节点（bl_confirmed_at）是否完成 */}
                  <td className="px-4 py-3 text-center text-zinc-700">
                    {flag(Boolean(job.bl_confirmed_at))}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onDelete(job)}
                      className="rounded-md border border-zinc-300 px-2.5 py-1 text-xs text-red-600 transition-colors hover:bg-red-50"
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

      {/* 分页 */}
      <div className="mt-4 flex items-center justify-between text-sm text-zinc-500">
        <span>
          {total > 0 ? `第 ${from}–${to} 条，共 ${total} 条` : "共 0 条"}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={offset <= 0}
            onClick={() => goPage(offset - PAGE_SIZE)}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-40"
          >
            上一页
          </button>
          <button
            type="button"
            disabled={to >= total}
            onClick={() => goPage(offset + PAGE_SIZE)}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-40"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  );
}
