"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createJob, updateJob } from "@/lib/api";
import type { Job } from "@/types/job";

import JobTabs, { DEFAULT_TAB, TabPlaceholder } from "./JobTabs";
import JobToolbar from "./JobToolbar";
import JobWindow from "./JobWindow";
import {
  BASIC_FIELDS,
  CONFIRMATION_FLAGS,
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

  const cancel = () => (onCancel ? onCancel() : router.back());

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
    <form onSubmit={onSubmit}>
      <JobWindow
        caption={job ? job.job_no : "新建作业单"}
        onClose={cancel}
        toolbar={
          <JobToolbar mode={job ? "edit" : "new"} submitting={submitting} onCancel={cancel} />
        }
      >
        {error && (
          <p className="border border-[#f7c9d4] bg-[#fef2f4] px-4 py-2 text-sm text-star">
            {error}
          </p>
        )}

        <Panel title="作业确认状态">
          <FlagGrid>
            {CONFIRMATION_FLAGS.map((f) => (
              <label key={f.name} className="flex items-center gap-2 text-sm text-body">
                <input
                  type="checkbox"
                  checked={Boolean(state[f.name])}
                  onChange={(e) => set(f.name, e.target.checked)}
                  className="check-brand"
                />
                {f.label}
              </label>
            ))}
          </FlagGrid>
        </Panel>

        {/* 基本信息 + 服务标志同处一块淡蓝面板（云海大面板：字段密排，下接勾选行） */}
        <Panel title="基本信息">
          <FieldGrid>
            {BASIC_FIELDS.map((f) => (
              <FieldInput key={f.name} def={f} value={state[f.name] as string} onChange={set} />
            ))}
          </FieldGrid>
          <div className="mt-3 border-t border-panel-line/70 pt-3">
            <FlagGrid>
              {SERVICE_FLAGS.map((f) => (
                <label key={f.name} className="flex items-center gap-2 text-sm text-body">
                  <input
                    type="checkbox"
                    checked={Boolean(state[f.name])}
                    onChange={(e) => set(f.name, e.target.checked)}
                    className="check-brand"
                  />
                  {f.label}
                </label>
              ))}
            </FlagGrid>
          </div>
        </Panel>

        {/* 托单信息及其余子页签（仅托单信息可填，其余本区域内显示「暂未开放」）*/}
        <section>
          <JobTabs active={tab} onSelect={setTab} />
          <div className="bg-panel p-3">
            {tab === DEFAULT_TAB ? (
              <FieldGrid>
                {CONSIGNMENT_FIELDS.map((f) => (
                  <FieldInput key={f.name} def={f} value={state[f.name] as string} onChange={set} />
                ))}
              </FieldGrid>
            ) : (
              <TabPlaceholder name={tab} />
            )}
          </div>
        </section>
      </JobWindow>
    </form>
  );
}

// 分块面板：淡蓝底整块 + 块内粗体标题（还原云海表单分块）。
function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-panel p-3">
      <h2 className="mb-2.5 text-sm font-bold text-ink">{title}</h2>
      {children}
    </section>
  );
}

// 值字段网格（标签左、输入右的密排行）。
function FieldGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {children}
    </div>
  );
}

// 勾选项网格（确认状态/服务标志）。
function FlagGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-3 lg:grid-cols-6">{children}</div>
  );
}

// 单个值字段：标签左对齐 + 输入框，必填项米黄底 + 红星（DESIGN §6，配色对齐云海）。
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
    "min-w-0 flex-1 rounded border px-2.5 py-1 text-sm text-ink outline-none transition-colors focus:border-brand " +
    (def.required ? "border-required-line bg-required" : "border-panel-line bg-white");

  return (
    <label className={`flex items-center gap-2 text-xs ${def.full ? "col-span-full" : ""}`}>
      <span className="w-20 shrink-0 text-body">
        {def.label}
        {def.required && <span className="ml-0.5 text-star">*</span>}
      </span>
      {def.type === "textarea" ? (
        <textarea
          name={def.name}
          value={value}
          onChange={(e) => onChange(def.name, e.target.value)}
          onInput={(e) => onChange(def.name, e.currentTarget.value)}
          rows={2}
          className={inputBase}
        />
      ) : def.type === "select" ? (
        <select
          name={def.name}
          value={value}
          onChange={(e) => onChange(def.name, e.target.value)}
          onInput={(e) => onChange(def.name, e.currentTarget.value)}
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
          onInput={(e) => onChange(def.name, e.currentTarget.value)}
          className={inputBase}
        />
      )}
    </label>
  );
}
