"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { deleteJob, getJob } from "@/lib/api";
import type { Job, JobBase } from "@/types/job";

import JobForm from "./JobForm";
import {
  BASIC_FIELDS,
  CONSIGNMENT_FIELDS,
  NODE_FIELDS,
  SERVICE_FLAGS,
  fmtDate,
  fmtDateTime,
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

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getJob(id)
      .then((data) => alive && setJob(data))
      .catch((e) => alive && setError(e instanceof Error ? e.message : "加载失败"))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
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

  if (loading) return <p className="text-sm text-zinc-400">加载中…</p>;
  if (error && !job)
    return (
      <div className="text-sm">
        <p className="mb-3 text-red-600">{error}</p>
        <Link href="/jobs" className="text-zinc-500 hover:underline">
          返回列表
        </Link>
      </div>
    );
  if (!job) return null;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">{job.job_no}</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {job.consignor} · {statusLabel(job.status)}
          </p>
        </div>
        <div className="flex gap-2">
          {!editing && (
            <>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
              >
                编辑
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="rounded-md border border-zinc-300 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
              >
                删除
              </button>
            </>
          )}
          <Link href="/jobs" className="self-center text-sm text-zinc-500 hover:underline">
            返回列表
          </Link>
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

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
          {/* 节点进度（DESIGN §6：订舱→放舱→装箱→舱单→提单→开船）*/}
          <NodeProgress job={job} />
          <ReadSection title="基本信息" fields={BASIC_FIELDS} job={job} />
          <ReadFlags job={job} />
          <ReadSection title="托单信息" fields={CONSIGNMENT_FIELDS} job={job} />
        </div>
      )}
    </div>
  );
}

function NodeProgress({ job }: { job: Job }) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5">
      <h2 className="mb-4 text-sm font-semibold text-zinc-900">节点进度</h2>
      <ol className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
        {NODE_FIELDS.map((n) => {
          const done = Boolean(job[n.name]);
          return (
            <li key={n.name} className="flex items-center gap-2">
              <span className={done ? "text-emerald-600" : "text-zinc-300"}>
                {done ? "✓" : "○"}
              </span>
              <span className={done ? "text-zinc-900" : "text-zinc-400"}>{n.label}</span>
              {done && (
                <span className="text-xs text-zinc-400">
                  {fmtDateTime(String(job[n.name]))}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function ReadSection({
  title,
  fields,
  job,
}: {
  title: string;
  fields: FieldDef[];
  job: Job;
}) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5">
      <h2 className="mb-4 text-sm font-semibold text-zinc-900">{title}</h2>
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {fields.map((f) => (
          <div key={f.name} className={f.full ? "col-span-full" : ""}>
            <dt className="text-xs text-zinc-500">{f.label}</dt>
            <dd className="mt-0.5 text-sm whitespace-pre-wrap text-zinc-900">
              {displayValue(job, f)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function ReadFlags({ job }: { job: Job }) {
  const active = SERVICE_FLAGS.filter((f) => Boolean(job[f.name as keyof JobBase]));
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5">
      <h2 className="mb-4 text-sm font-semibold text-zinc-900">服务标志</h2>
      {active.length === 0 ? (
        <p className="text-sm text-zinc-400">无</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {active.map((f) => (
            <span
              key={f.name}
              className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700"
            >
              {f.label}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
