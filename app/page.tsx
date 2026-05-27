import { ArrowRight, CheckCircle2, Circle, ClipboardList, Film, Link2, Play, Sparkles, UploadCloud } from "lucide-react";
import { AppShell } from "./shell";
import { getProviderStatuses } from "@/lib/config/provider-status";
import { getStorageMode, listJobs } from "@/lib/jobs/storage";

export const dynamic = "force-dynamic";

const pipeline = [
  "Intake",
  "Evidence",
  "Creative read",
  "Variant plan",
  "Generation"
];

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
      <div className="workbench">
        <header className="hero-bar">
          <div className="hero-copy">
            <p className="eyebrow">{hostedMode ? "Hosted remix workflow" : "Local remix workflow"}</p>
            <h1>Reference in. Original ad variants out.</h1>
            <p className="hero-subtitle">
              Analyze a winning creative pattern, keep the structure, and generate fresh video ad directions without copying the source.
            </p>
          </div>
          <div className="hero-meter" aria-label="Workflow readiness">
            <span className="meter-label">MVP</span>
            <span className="meter-value">RemixKit</span>
            <span className="meter-note">{hostedMode ? "Vercel Blob" : "Local storage"}</span>
          </div>
        </header>

        <section className="workflow-strip" aria-label="Workflow stages">
          {pipeline.map((step, index) => (
            <div className="workflow-step" key={step}>
              <span className="step-index">{String(index + 1).padStart(2, "0")}</span>
              <span>{step}</span>
            </div>
          ))}
        </section>

        <div className="workbench-grid">
          <section className="intake-panel">
            <div className="panel-head">
              <div>
                <p className="eyebrow">New job</p>
                <h2>Create remix run</h2>
              </div>
              <span className="badge ok">
                <Sparkles size={14} />
                Ready
              </span>
            </div>

            <form action="/api/jobs" className="intake-form" encType="multipart/form-data" method="post">
              <label className="dropzone" htmlFor="video">
                <span className="dropzone-icon">
                  <UploadCloud size={24} />
                </span>
                <span>
                  <strong>Upload reference video</strong>
                  <span>Local mode extracts frames, audio, and transcript evidence.</span>
                </span>
                <input id="video" name="video" type="file" accept="video/*" />
              </label>

              <div className="field with-icon">
                <Link2 size={17} />
                <div>
                  <label htmlFor="sourceUrl">Public video URL</label>
                  <input
                    id="sourceUrl"
                    name="sourceUrl"
                    placeholder="https://example.com/owned-reference.mp4"
                    type="url"
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="goal">Creative goal</label>
                <textarea
                  id="goal"
                  name="goal"
                  placeholder="3 TikTok ad variants for a skincare product. Keep the hook direct, avoid copying the creator identity."
                />
              </div>

              <div className="selector-row">
                <div className="field">
                  <label htmlFor="analysisProvider">Analysis model</label>
                  <select id="analysisProvider" name="analysisProvider" defaultValue="auto">
                    <option value="auto">Auto select</option>
                    {statuses.analysis.map((provider) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="generationProvider">Video provider</label>
                  <select id="generationProvider" name="generationProvider" defaultValue="auto">
                    <option value="auto">Auto select</option>
                    {statuses.generation.map((provider) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button className="button primary-action" type="submit">
                <Play size={17} />
                Start remix run
              </button>
            </form>
          </section>

          <aside className="side-rail">
            <section className="readiness-card">
              <div className="panel-head">
                <h2>Provider stack</h2>
                <a className="text-link" href="/settings">
                  Configure <ArrowRight size={14} />
                </a>
              </div>
              <div className="status-grid">
                <ReadinessMetric label="Analysis" value={configuredAnalysis.length} total={statuses.analysis.length} />
                <ReadinessMetric label="Generation" value={configuredGeneration.length} total={statuses.generation.length} />
                <ReadinessMetric label="Transcript" value={configuredTranscription.length} total={statuses.transcription.length} />
              </div>
            </section>

            <section className="artifact-card">
              <div className="artifact-visual" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <div>
                <p className="eyebrow">Output</p>
                <h2>Brief, prompts, tasks</h2>
              </div>
              <p className="subtle">
                Jobs save a remix brief, structured analysis, provider prompts, and generation results in {hostedMode ? "Vercel Blob" : "local storage"}.
              </p>
            </section>

            <section className="recent-card">
              <div className="panel-head">
                <h2>Recent runs</h2>
                <ClipboardList size={18} />
              </div>
              {jobs.length ? (
                <div className="job-list">
                  {jobs.slice(0, 5).map((job) => (
                    <a className="job-row" href={`/jobs/${job.id}`} key={job.id}>
                      <span className="job-status">{job.status}</span>
                      <span>
                        <strong>{job.sourceFileName}</strong>
                        <small>{new Date(job.createdAt).toLocaleString()}</small>
                      </span>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <Film size={20} />
                  <span>No runs yet.</span>
                </div>
              )}
            </section>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

function ReadinessMetric({ label, value, total }: { label: string; value: number; total: number }) {
  const ready = value > 0;

  return (
    <div className={`metric ${ready ? "ready" : ""}`}>
      <span>{ready ? <CheckCircle2 size={16} /> : <Circle size={16} />}</span>
      <strong>
        {value}/{total}
      </strong>
      <small>{label}</small>
    </div>
  );
}
