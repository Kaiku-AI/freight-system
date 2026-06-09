"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createJob, updateJob } from "@/lib/api";
import type { Job } from "@/types/job";

import JobTabs, { DEFAULT_TAB, TabPlaceholder } from "./JobTabs";
import { ToolbarDivider, ToolbarGhost } from "./Toolbar";
import {
  BASIC_FIELDS,
  CONSIGNMENT_FIELDS,
  SERVICE_FLAGS,
  buildJobPayload,
  initialFormState,
  missingRequired,
  type FieldDef,
  type FormState,
} from "./fields";

export default function JobForm({
  job,
  onCancel,
  onSaved,
}: {
  job?: Job; // 传入则编辑，不传则新建
  onCancel?: () => void;
  onSaved?: (job: Job) => void; // 编辑保存后回调（明细页用）；新建默认跳明细
}) {
  const router = useRouter();
  const [state, setState] = useState<FormState>(() => initialFormState(job));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState(DEFAULT_TAB);

  const set = (name: string, value: string | boolean) =>
    setState((s) => ({ ...s, [name]: value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // 必填校验：避免空串触发后端 422，给即时中文提示。
    const missing = missingRequired(state);
    if (missing.length > 0) {
      setError(`请填写必填项：${missing.map((f) => f.label).join("、")}`);
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const payload = buildJobPayload(state);
      const saved = job ? await updateJob(job.id, payload) : await createJob(payload);
      if (onSaved) onSaved(saved);
      else router.push(`/jobs/${saved.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* 顶部工具栏（还原 Penpot）：保存/放弃可用，其余仅展示 */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-white p-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-brand px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
        >
          {submitting ? "保存中…" : "保存"}
        </button>
        <button
          type="button"
          onClick={() => (onCancel ? onCancel() : router.back())}
          className="rounded-lg border border-line-strong px-4 py-1.5 text-sm text-body transition-colors hover:bg-canvas"
        >
          放弃
        </button>
        <ToolbarDivider />
        <ToolbarGhost items={["订舱模板 ▾", "相关操作 ▾", "动作 ▾", "数据交换 ▾", "通知 ▾", "系统功能 ▾"]} />
      </div>

      {error && (
        <p className="rounded-lg border border-[#f7c9d4] bg-[#fef2f4] px-4 py-2 text-sm text-star">
          {error}
        </p>
      )}

      <Section title="基本信息">
        {BASIC_FIELDS.map((f) => (
          <FieldInput key={f.name} def={f} value={state[f.name] as string} onChange={set} />
        ))}
      </Section>

      <Section title="服务标志">
        <div className="col-span-full grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-3 lg:grid-cols-6">
          {SERVICE_FLAGS.map((f) => (
            <label key={f.name} className="flex items-center gap-2 text-sm text-body">
              <input
                type="checkbox"
                checked={Boolean(state[f.name])}
                onChange={(e) => set(f.name, e.target.checked)}
                className="h-4 w-4 rounded border-line-strong accent-brand"
              />
              {f.label}
            </label>
          ))}
        </div>
      </Section>

      {/* 托单信息及其余子页签（仅托单信息可填，其余本区域内显示「暂未开放」）*/}
      <section className="rounded-2xl border border-line bg-white p-5">
        <JobTabs active={tab} onSelect={setTab} />
        {tab === DEFAULT_TAB ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {CONSIGNMENT_FIELDS.map((f) => (
              <FieldInput key={f.name} def={f} value={state[f.name] as string} onChange={set} />
            ))}
          </div>
        ) : (
          <TabPlaceholder name={tab} />
        )}
      </section>
    </form>
  );
}

// 分块容器：标题（主色竖条）+ 字段网格。
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-white p-5">
      <h2 className="mb-5 flex items-center gap-2 text-sm font-semibold text-ink">
        <span className="h-3.5 w-1 rounded-full bg-brand" />
        {title}
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{children}</div>
    </section>
  );
}

// 单个值字段：必填项黄底 + 红星（DESIGN §6）。
function FieldInput({
  def,
  value,
  onChange,
}: {
  def: FieldDef;
  value: string;
  onChange: (name: string, value: string) => void;
}) {
  const inputBase =
    "rounded-lg border px-3 py-1.5 text-sm text-ink outline-none transition-colors focus:border-brand " +
    (def.required ? "border-required-line bg-required" : "border-line bg-white");

  return (
    <label className={`flex flex-col gap-1 text-xs text-muted ${def.full ? "col-span-full" : ""}`}>
      <span>
        {def.label}
        {def.required && <span className="ml-0.5 text-star">*</span>}
      </span>
      {def.type === "textarea" ? (
        <textarea
          name={def.name}
          value={value}
          onChange={(e) => onChange(def.name, e.target.value)}
          rows={2}
          className={inputBase}
        />
      ) : def.type === "select" ? (
        <select
          name={def.name}
          value={value}
          onChange={(e) => onChange(def.name, e.target.value)}
          className={inputBase}
        >
          <option value="">请选择</option>
          {def.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          name={def.name}
          type={
            def.type === "date"
              ? "date"
              : def.type === "datetime"
                ? "datetime-local"
                : def.type === "number"
                  ? "number"
                  : "text"
          }
          step={def.type === "number" ? "any" : undefined}
          value={value}
          onChange={(e) => onChange(def.name, e.target.value)}
          className={inputBase}
        />
      )}
    </label>
  );
}
