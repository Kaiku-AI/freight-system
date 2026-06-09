"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { deleteJob, getJob } from "@/lib/api";
import type { Job, JobBase } from "@/types/job";

import JobForm from "./JobForm";
import JobTabs, { DEFAULT_TAB, TabPlaceholder } from "./JobTabs";
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

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-ink">{job.job_no}</h1>
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(job.status)}`}
            >
              {statusLabel(job.status)}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted">{job.consignor}</p>
        </div>
        <div className="flex gap-2">
          {!editing && (
            <>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
              >
                编辑
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="rounded-lg border border-line-strong px-4 py-2 text-sm text-star transition-colors hover:bg-[#fef2f4]"
              >
                删除
              </button>
            </>
          )}
          <Link href="/jobs" className="self-center text-sm text-muted hover:text-brand">
            返回列表
          </Link>
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-star">{error}</p>}

      {editing ? (
        <JobForm
          job={job}
          onCancel={() => setEditing(false)}
          onSaved={(saved) => {
            setJob(saved);
            setEditing(false);
          }}
        />
      ) : (
        <div className="space-y-6">
          <ConfirmationCard job={job} />
          <SectionShell title="基本信息">
            <FieldGrid fields={BASIC_FIELDS} job={job} />
          </SectionShell>
          <ReadFlags job={job} />
          {/* 托单信息及其余子页签（仅托单信息有内容，其余本区域内显示「暂未开放」）*/}
          <section className="rounded-2xl border border-line bg-white p-5">
            <JobTabs active={tab} onSelect={setTab} />
            {tab === DEFAULT_TAB ? (
              <FieldGrid fields={CONSIGNMENT_FIELDS} job={job} />
            ) : (
              <TabPlaceholder name={tab} />
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function SectionShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-white p-5">
      <h2 className="mb-5 flex items-center gap-2 text-sm font-semibold text-ink">
        <span className="h-3.5 w-1 rounded-full bg-brand" />
        {title}
      </h2>
      {children}
    </section>
  );
}

// 只读字段网格（基本信息/托单信息共用）。
function FieldGrid({ fields, job }: { fields: FieldDef[]; job: Job }) {
  return (
    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {fields.map((f) => (
        <div key={f.name} className={f.full ? "col-span-full" : ""}>
          <dt className="text-xs text-muted">{f.label}</dt>
          <dd className="mt-0.5 text-sm whitespace-pre-wrap text-ink">{displayValue(job, f)}</dd>
        </div>
      ))}
    </dl>
  );
}

function ConfirmationCard({ job }: { job: Job }) {
  return (
    <SectionShell title="作业确认状态">
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm sm:grid-cols-3 lg:grid-cols-6">
        {CONFIRMATION_FLAGS.map((n) => {
          const checked = Boolean(job[n.name]);
          return (
            <span key={n.name} className="flex items-center gap-2 text-body">
              <input
                type="checkbox"
                checked={checked}
                readOnly
                className="h-4 w-4 rounded border-line-strong accent-brand"
              />
              {n.label}
            </span>
          );
        })}
      </div>
    </SectionShell>
  );
}

function ReadFlags({ job }: { job: Job }) {
  const active = SERVICE_FLAGS.filter((f) => Boolean(job[f.name as keyof JobBase]));
  return (
    <SectionShell title="服务标志">
      {active.length === 0 ? (
        <p className="text-sm text-faint">无</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {active.map((f) => (
            <span
              key={f.name}
              className="rounded-full bg-brand-soft px-3 py-1 text-xs font-medium text-brand"
            >
              {f.label}
            </span>
          ))}
        </div>
      )}
    </SectionShell>
  );
}
