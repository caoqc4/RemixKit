import {
  ArrowRight,
  CheckCircle2,
  Circle,
  ClipboardList,
  Cloud,
  Film,
  Link2,
  Play,
  Settings2,
  UploadCloud
} from "lucide-react";
import { AppShell } from "./shell";
import { getProviderStatuses } from "@/lib/config/provider-status";
import { getStorageMode, listJobs } from "@/lib/jobs/storage";

export const dynamic = "force-dynamic";

const stages = ["Source", "Evidence", "Read", "Plan", "Generate"];

export default async function HomePage() {
  const statuses = await getProviderStatuses();
  const jobs = await listJobs();
  const configuredAnalysis = statuses.analysis.filter((provider) => provider.configured);
  const configuredTranscription = statuses.transcription.filter((provider) => provider.configured);
  const configuredGeneration = statuses.generation.filter((provider) => provider.configured);
  const storageMode = getStorageMode();
  const hostedMode = storageMode === "vercel-blob";

  return (
    <AppShell>
      <div className="screen workbench-screen">
        <header className="op-header">
          <div>
            <p className="kicker">Cinematic Operations Workbench</p>
            <h1>Build video ad variants from a reference creative.</h1>
          </div>
          <div className="header-actions">
            <span className="status-pill">
              <Cloud size={15} />
              {hostedMode ? "Vercel Blob" : "Local storage"}
            </span>
            <a className="button ghost" href="/settings">
              <Settings2 size={16} />
              Providers
            </a>
          </div>
        </header>

        <section className="stage-track" aria-label="Remix workflow">
          {stages.map((stage, index) => (
            <div className="stage" key={stage}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{stage}</strong>
            </div>
          ))}
        </section>

        <form action="/api/jobs" className="launch-grid" encType="multipart/form-data" method="post">
          <section className="module source-module">
            <div className="module-title">
              <span className="module-index">01</span>
              <div>
                <h2>Source creative</h2>
                <p>Upload locally for extraction, or use a public URL for hosted runs.</p>
              </div>
            </div>

            <label className="media-intake" htmlFor="video">
              <input id="video" name="video" type="file" accept="video/*" />
              <span className="media-frame">
                <Film size={34} />
              </span>
              <span>
                <strong>Drop reference video</strong>
                <small>MP4, MOV, or any browser-supported video file</small>
              </span>
              <UploadCloud size={20} />
            </label>

            <label className="url-field" htmlFor="sourceUrl">
              <Link2 size={17} />
              <span>Public video URL</span>
              <input id="sourceUrl" name="sourceUrl" placeholder="https://example.com/owned-reference.mp4" type="url" />
            </label>
          </section>

          <section className="module brief-module">
            <div className="module-title">
              <span className="module-index">02</span>
              <div>
                <h2>Remix brief</h2>
                <p>Tell the system what kind of variants you want to test.</p>
              </div>
            </div>

            <label className="brief-field" htmlFor="goal">
              <span>Creative goal</span>
              <textarea
                id="goal"
                name="goal"
                placeholder="Generate 3 TikTok ad variants for a skincare product. Keep the hook direct; avoid copying the creator identity."
              />
            </label>

            <div className="select-grid">
              <label htmlFor="analysisProvider">
                <span>Analysis model</span>
                <select id="analysisProvider" name="analysisProvider" defaultValue="auto">
                  <option value="auto">Auto select</option>
                  {statuses.analysis.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
                    </option>
                  ))}
                </select>
              </label>
              <label htmlFor="generationProvider">
                <span>Video provider</span>
                <select id="generationProvider" name="generationProvider" defaultValue="auto">
                  <option value="auto">Auto select</option>
                  {statuses.generation.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <button className="button launch-button" type="submit">
              <Play size={17} />
              Start remix run
            </button>
          </section>

          <aside className="ops-column">
            <section className="module compact-module">
              <div className="module-title">
                <span className="module-index">03</span>
                <div>
                  <h2>Provider readiness</h2>
                  <p>Configured API keys available to this run.</p>
                </div>
              </div>
              <div className="readiness-list">
                <ReadinessRow label="Analysis" value={configuredAnalysis.length} total={statuses.analysis.length} />
                <ReadinessRow label="Generation" value={configuredGeneration.length} total={statuses.generation.length} />
                <ReadinessRow label="Transcript" value={configuredTranscription.length} total={statuses.transcription.length} />
              </div>
            </section>

            <section className="module compact-module">
              <div className="module-title">
                <span className="module-index">04</span>
                <div>
                  <h2>Recent runs</h2>
                  <p>Pick up where the last creative test stopped.</p>
                </div>
              </div>
              {jobs.length ? (
                <div className="run-list">
                  {jobs.slice(0, 5).map((job) => (
                    <a className="run-row" href={`/jobs/${job.id}`} key={job.id}>
                      <span>{job.status}</span>
                      <strong>{job.sourceFileName}</strong>
                      <small>{new Date(job.createdAt).toLocaleString()}</small>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="empty-panel">
                  <ClipboardList size={18} />
                  No remix runs yet.
                </div>
              )}
            </section>
          </aside>
        </form>
      </div>
    </AppShell>
  );
}

function ReadinessRow({ label, value, total }: { label: string; value: number; total: number }) {
  const ready = value > 0;

  return (
    <div className="readiness-row">
      <span className={ready ? "ready-dot ready" : "ready-dot"}>{ready ? <CheckCircle2 size={15} /> : <Circle size={15} />}</span>
      <strong>{label}</strong>
      <small>
        {value}/{total} configured
      </small>
      <ArrowRight size={14} />
    </div>
  );
}
