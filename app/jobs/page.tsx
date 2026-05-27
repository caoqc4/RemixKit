import { ArrowRight, BriefcaseBusiness, Clock, FileVideo } from "lucide-react";
import { AppShell } from "../shell";
import { listJobs } from "@/lib/jobs/storage";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  const jobs = await listJobs();

  return (
    <AppShell>
      <div className="v0-page">
        <header className="v0-topbar">
          <div>
            <h1>任务队列</h1>
            <p>查看分析、生成和刷新中的广告变体任务</p>
          </div>
          <span className="status-badge ready">
            <BriefcaseBusiness size={14} />
            {jobs.length} 个任务
          </span>
        </header>

        <section className="v0-card">
          <div className="queue-list">
            {jobs.length ? (
              jobs.map((job) => (
                <a className="queue-row" href={`/jobs/${job.id}`} key={job.id}>
                  <span className="queue-icon">
                    <FileVideo size={18} />
                  </span>
                  <span>
                    <strong>{job.sourceFileName}</strong>
                    <small>
                      <Clock size={13} />
                      {new Date(job.createdAt).toLocaleString()}
                    </small>
                  </span>
                  <span className="status-badge">{job.status}</span>
                  <ArrowRight size={16} />
                </a>
              ))
            ) : (
              <p className="hint">还没有任务。回到工作台上传一个参考视频开始。</p>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
