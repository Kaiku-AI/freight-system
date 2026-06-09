import { Suspense } from "react";

import JobListClient from "./_components/JobListClient";

// 作业列表（DESIGN §6/§7：查询 + 删除）。
// 筛选条件放 URL query，故列表用 useSearchParams——Next 要求包一层 Suspense。
export default function JobsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-400">加载中…</p>}>
      <JobListClient />
    </Suspense>
  );
}
