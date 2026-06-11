"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { deleteJob, getJob } from "@/lib/api";
import type { Job } from "@/types/job";

import JobForm from "./JobForm";
import JobTabs, { DEFAULT_TAB, TabPlaceholder } from "./JobTabs";
import JobToolbar from "./JobToolbar";
import JobWindow from "./JobWindow";
import {
  BASIC_FIELDS,
  CONFIRMATION_FLAGS,
  CONSIGNMENT_FIELDS,
  SERVICE_FLAGS,
  fmtDate,
  fmtDateTime,
  statusBadgeClass,
  statusLabel,
  type FieldDef,
} from "./fields";

// 把单个字段值格式化成可读文本（明细只读展示用）。
function displayValue(job: Job, def: FieldDef): string {
  const v = job[def.name];
  if (v == null || v === "") return "-";
  if (def.name === "status") return statusLabel(String(v));
  if (def.type === "date") return fmtDate(String(v));
  if (def.type === "datetime") return fmtDateTime(String(v));
  return String(v);
}

export default function JobDetailClient({ id }: { id: number }) {
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [tab, setTab] = useState(DEFAULT_TAB);

  useEffect(() => {
    let alive = true;
    const timer = window.setTimeout(() => {
      setLoading(true);
      getJob(id)
        .then((data) => alive && setJob(data))
        .catch((e) => alive && setError(e instanceof Error ? e.message : "加载失败"))
        .finally(() => alive && setLoading(false));
    }, 0);
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [id]);

  async function onDelete() {
    if (!job) return;
    if (!window.confirm(`确认删除作业 ${job.job_no}？此操作不可撤销。`)) return;
    try {
      await deleteJob(job.id);
      router.push("/jobs");
    } catch (e) {
      setError(e instanceof Error ? e.message : "删除失败");
    }
  }

  if (loading) return <p className="text-sm text-faint">加载中…</p>;
  if (error && !job)
    return (
      <div className="text-sm">
        <p className="mb-3 text-star">{error}</p>
        <Link href="/jobs" className="text-muted hover:text-brand">
          返回列表
        </Link>
      </div>
    );
  if (!job) return null;

  if (editing) {
    return (
      <JobForm
        job={job}
        onCancel={() => setEditing(false)}
        onSaved={(saved) => {
          setJob(saved);
          setEditing(false);
        }}
      />
    );
  }

  return (
    <JobWindow
      caption={
        <>
          {job.job_no}
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${statusBadgeClass(job.status)}`}
          >
            {statusLabel(job.status)}
          </span>
        </>
      }
      onDelete={onDelete}
      onClose={() => router.push("/jobs")}
      toolbar={<JobToolbar mode="view" onEdit={() => setEditing(true)} />}
    >
      {error && (
        <p className="border border-[#f7c9d4] bg-[#fef2f4] px-4 py-2 text-sm text-star">{error}</p>
      )}

      <SectionShell title="作业确认状态">
        <FlagGrid flags={CONFIRMATION_FLAGS} job={job} />
      </SectionShell>

      {/* 基本信息 + 服务标志同处一块淡蓝面板（与编辑表单同构） */}
      <SectionShell title="基本信息">
        <FieldGrid fields={BASIC_FIELDS} job={job} />
        <div className="mt-3 border-t border-panel-line/70 pt-3">
          <FlagGrid flags={SERVICE_FLAGS} job={job} />
        </div>
      </SectionShell>

      {/* 托单信息及其余子页签（仅托单信息有内容，其余本区域内显示「暂未开放」）*/}
      <section>
        <JobTabs active={tab} onSelect={setTab} />
        <div className="bg-panel p-3">
          {tab === DEFAULT_TAB ? (
            <FieldGrid fields={CONSIGNMENT_FIELDS} job={job} />
          ) : (
            <TabPlaceholder name={tab} />
          )}
        </div>
      </section>
    </JobWindow>
  );
}

// 分块面板：淡蓝底整块 + 块内粗体标题（与 JobForm 一致，还原云海表单分块）。
function SectionShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-panel p-3">
      <h2 className="mb-2.5 text-sm font-bold text-ink">{title}</h2>
      {children}
    </section>
  );
}

// 只读字段网格（标签左、值右的密排行；基本信息/托单信息共用）。
function FieldGrid({ fields, job }: { fields: FieldDef[]; job: Job }) {
  return (
    <dl className="grid grid-cols-1 gap-x-5 gap-y-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {fields.map((f) => (
        <div key={f.name} className={`flex items-baseline gap-2 ${f.full ? "col-span-full" : ""}`}>
          <dt className="w-20 shrink-0 text-xs text-body">{f.label}</dt>
          <dd className="min-w-0 flex-1 text-sm whitespace-pre-wrap text-ink">
            {displayValue(job, f)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

// 只读勾选网格（确认状态/服务标志共用，与表单同一视觉语言）。
function FlagGrid({ flags, job }: { flags: FieldDef[]; job: Job }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm sm:grid-cols-3 lg:grid-cols-6">
      {flags.map((f) => (
        <span key={f.name} className="flex items-center gap-2 text-body">
          <input type="checkbox" checked={Boolean(job[f.name])} readOnly className="check-brand" />
          {f.label}
        </span>
      ))}
    </div>
  );
}
