import { notFound } from "next/navigation";

import JobDetailClient from "../_components/JobDetailClient";

// 作业明细（DESIGN §6：只读 + 编辑）。Next 16：params 为 Promise，需 await。
export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) notFound();
  return <JobDetailClient id={numericId} />;
}
