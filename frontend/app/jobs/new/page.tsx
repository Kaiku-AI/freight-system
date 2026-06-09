import Link from "next/link";

import JobForm from "../_components/JobForm";

// 新建整箱作业（DESIGN §6：写入；job_no 由后端生成）。
export default function NewJobPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900">新建整箱</h1>
        <Link href="/jobs" className="text-sm text-zinc-500 hover:text-zinc-900 hover:underline">
          返回列表
        </Link>
      </div>
      <JobForm />
    </div>
  );
}
