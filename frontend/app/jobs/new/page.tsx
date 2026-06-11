import JobForm from "../_components/JobForm";

// 新建整箱作业（DESIGN §6：写入；job_no 由后端生成）。
// 页面标题/返回入口由 JobForm 内的云海窗体（标题栏 + 关闭）承担。
export default function NewJobPage() {
  return <JobForm />;
}
