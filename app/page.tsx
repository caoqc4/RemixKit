import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Cloud,
  Download,
  FileVideo,
  Link2,
  Play,
  RefreshCcw,
  Search,
  Upload,
  Wand2
} from "lucide-react";
import { AppShell } from "./shell";
import { getProviderStatuses } from "@/lib/config/provider-status";
import { getStorageMode, listJobs } from "@/lib/jobs/storage";

export const dynamic = "force-dynamic";

const workflow = ["素材导入", "证据提取", "创意解读", "变体规划", "视频生成", "输出交付"];
const demoVariants = ["变体_A_活力版", "变体_B_沉稳版", "变体_C_极简版"];

export default async function HomePage() {
  const statuses = await getProviderStatuses();
  const jobs = await listJobs();
  const storageMode = getStorageMode();
  const hostedMode = storageMode === "vercel-blob";
  const readyCount = [...statuses.analysis, ...statuses.generation, ...statuses.transcription].filter((provider) => provider.configured).length;
  const totalCount = statuses.analysis.length + statuses.generation.length + statuses.transcription.length;
  const ready = statuses.analysis.some((provider) => provider.configured) && statuses.generation.some((provider) => provider.configured);
  const latest = jobs[0];

  return (
    <AppShell>
      <div className="v0-page">
        <header className="v0-topbar">
          <div>
            <h1>工作台</h1>
            <p>AI 视频广告混剪工作流</p>
          </div>
          <div className="topbar-actions">
            <span className="select-pill">
              <Cloud size={14} />
              {hostedMode ? "云端存储" : "本地存储"}
            </span>
            <span className={ready ? "status-badge ready" : "status-badge"}>
              <CheckCircle2 size={14} />
              {ready ? "服务就绪" : `${readyCount}/${totalCount} 服务商`}
            </span>
          </div>
        </header>

        <form action="/api/jobs" className="v0-workbench" encType="multipart/form-data" method="post">
          <section className="v0-stack">
            <div className="v0-card">
              <div className="card-head">
                <h2>素材来源</h2>
                <div className="segmented">
                  <button type="button" aria-pressed="true">
                    <Upload size={14} />
                    上传
                  </button>
                  <button type="button">
                    <Link2 size={14} />
                    链接
                  </button>
                </div>
              </div>

              <label className="drop-zone" htmlFor="video">
                <input id="video" name="video" type="file" accept="video/*" />
                <Upload size={28} />
                <strong>拖放视频文件或点击上传</strong>
                <span>支持 MP4、MOV、WebM 格式</span>
              </label>

              <label className="dark-field" htmlFor="sourceUrl">
                <span>公开视频链接</span>
                <input id="sourceUrl" name="sourceUrl" placeholder="https://example.com/owned-video.mp4" type="url" />
              </label>

              <div className="warning-note">
                <AlertTriangle size={15} />
                <span>请仅使用您拥有版权或已获授权的素材。生成的变体仅用于参考学习，商用需确保合规。</span>
              </div>
            </div>

            <div className="v0-card">
              <h2>创意目标</h2>
              <label className="dark-field" htmlFor="goal">
                <span>目标说明</span>
                <textarea
                  id="goal"
                  name="goal"
                  placeholder="描述您想要的变体风格，例如：保持原视频的节奏和叙事结构，但使用更明亮的色调和更年轻化的视觉元素，适合抖音投放..."
                />
              </label>
              <p className="hint">AI 将分析原视频并根据您的目标生成创意变体</p>

              <div className="provider-selects">
                <label className="dark-field" htmlFor="analysisProvider">
                  <span>分析模型</span>
                  <select id="analysisProvider" name="analysisProvider" defaultValue="auto">
                    <option value="auto">自动选择</option>
                    {statuses.analysis.map((provider) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="dark-field" htmlFor="generationProvider">
                  <span>视频生成</span>
                  <select id="generationProvider" name="generationProvider" defaultValue="auto">
                    <option value="auto">自动选择</option>
                    {statuses.generation.map((provider) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <button className="button primary full" type="submit">
                <Play size={15} />
                开始混剪
              </button>
            </div>

            <div className="v0-card">
              <h2>工作流程</h2>
              <div className="workflow-list">
                {workflow.map((stage, index) => (
                  <div className="workflow-row" key={stage}>
                    <span>{index + 1}</span>
                    <strong>{stage}</strong>
                    <Circle size={13} />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="v0-rail">
            <section className="v0-card rail-card">
              <h2>服务状态</h2>
              <RailItem label="分析模型" value={`${statuses.analysis.filter((p) => p.configured).length}/${statuses.analysis.length}`} />
              <RailItem label="视频生成" value={`${statuses.generation.filter((p) => p.configured).length}/${statuses.generation.length}`} />
              <RailItem label="转写服务" value={`${statuses.transcription.filter((p) => p.configured).length}/${statuses.transcription.length}`} />
            </section>

            <section className="v0-card rail-card">
              <h2>生成产物</h2>
              {["镜头证据", "转写文本", "创意解读", "变体方案"].map((artifact) => (
                <RailItem key={artifact} label={artifact} value="等待生成" />
              ))}
            </section>

            <section className="v0-card rail-card">
              <h2>最近任务</h2>
              {jobs.length ? (
                jobs.slice(0, 4).map((job) => (
                  <a className="job-mini" href={`/jobs/${job.id}`} key={job.id}>
                    <span>{job.status}</span>
                    <strong>{job.sourceFileName}</strong>
                    <small>{new Date(job.createdAt).toLocaleString()}</small>
                  </a>
                ))
              ) : (
                <p className="hint">暂无任务</p>
              )}
            </section>
          </aside>
        </form>

        <section className="v0-card job-showcase">
          <div className="job-title-row">
            <div>
              <h2>{latest?.sourceFileName ?? "夏季促销广告"}</h2>
              <p>{latest ? `${latest.status} · ${new Date(latest.createdAt).toLocaleString()}` : "完成 · 2024-01-15 14:30 · summer_promo_original.mp4"}</p>
            </div>
            <div className="job-actions">
              <button className="button ghost" type="button">
                <Search size={15} />
                分析
              </button>
              <button className="button ghost" type="button">
                <Wand2 size={15} />
                生成
              </button>
              <button className="button ghost" type="button">
                <RefreshCcw size={15} />
                刷新
              </button>
            </div>
          </div>

          <div className="warning-note">
            <AlertTriangle size={15} />
            <span>建议：原视频包含人脸，生成变体可能需要额外的肖像权授权。</span>
          </div>

          <div className="metric-grid">
            <Metric label="生成变体" value="3" />
            <Metric label="处理时长" value="4m 32s" />
            <Metric label="视觉匹配度" value="92%" delta="+5%" />
            <Metric label="API 成本" value="$2.40" />
          </div>

          <h3>生成视频 (3)</h3>
          <div className="video-grid">
            {demoVariants.map((variant) => (
              <div className="video-tile" key={variant}>
                <span>0:15</span>
                <FileVideo size={20} />
                <strong>{variant}</strong>
                <button className="icon-button" type="button" aria-label={`下载 ${variant}`}>
                  <Download size={14} />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function RailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rail-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Metric({ label, value, delta }: { label: string; value: string; delta?: string }) {
  return (
    <div className="metric-tile">
      <strong>
        {value}
        {delta ? <span>{delta}</span> : null}
      </strong>
      <small>{label}</small>
    </div>
  );
}
