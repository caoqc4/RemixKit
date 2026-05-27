import { ArrowRight, Sparkles, Wand2 } from "lucide-react";
import { AppShell } from "./shell";
import { getProviderStatuses } from "@/lib/config/provider-status";
import { listJobs } from "@/lib/jobs/storage";

export const dynamic = "force-dynamic";

const analysisModules = [
  "Creative Summary",
  "Hook Analysis",
  "Scene Timeline",
  "Pacing & Rhythm",
  "Message / Copy Structure",
  "Visual Pattern",
  "Compliance Risk",
  "Variant Strategy"
];

export default async function HomePage() {
  const statuses = await getProviderStatuses();
  const jobs = await listJobs();
  const configuredAnalysis = statuses.analysis.filter((provider) => provider.configured);
  const configuredTranscription = statuses.transcription.filter((provider) => provider.configured);
  const configuredGeneration = statuses.generation.filter((provider) => provider.configured);

  return (
    <AppShell>
      <div className="page-head">
        <div className="stack">
          <p className="eyebrow">Local creative workflow</p>
          <h1>Turn a reference creative into fresh video ad variants.</h1>
          <p className="subtle">
            Upload one video, extract its marketing structure, then generate original variant plans and video assets with your own provider keys.
          </p>
        </div>
        <span className="badge ok">
          <Sparkles size={14} />
          MVP workbench
        </span>
      </div>

      <div className="grid">
        <section className="panel panel-pad stack">
          <div className="stack">
            <h2>Create a remix job</h2>
            <p className="subtle">
              The first build focuses on local files. URL import can be added as an experimental path once the core job flow is stable.
            </p>
          </div>

          <form action="/api/jobs" className="stack" encType="multipart/form-data" method="post">
            <div className="field">
              <label htmlFor="video">Reference video</label>
              <input className="input" id="video" name="video" type="file" accept="video/*" />
            </div>

            <div className="field">
              <label htmlFor="goal">Creative goal</label>
              <textarea
                className="textarea"
                id="goal"
                name="goal"
                placeholder="Example: Generate 3 TikTok ad variants for a skincare product, keep the hook punchy and avoid copying the original creator identity."
              />
            </div>

            <div className="provider-grid">
              <div className="field">
                <label htmlFor="analysisProvider">Analysis model</label>
                <select className="select" id="analysisProvider" name="analysisProvider" defaultValue="auto">
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
                <select className="select" id="generationProvider" name="generationProvider" defaultValue="auto">
                  <option value="auto">Auto select</option>
                  {statuses.generation.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button className="button" type="submit">
              <Wand2 size={17} />
              Run analysis and generate
            </button>
            <p className="subtle">
              This creates a local job, stores the uploaded video, and extracts metadata when ffprobe is available.
            </p>
          </form>
        </section>

        <aside className="stack">
          <section className="panel panel-pad stack">
            <h2>Provider readiness</h2>
            <div className="stack">
              <p className="subtle">
                Analysis providers are peers. OpenAI is the default only when auto-selecting and multiple keys are configured.
              </p>
              <div className="provider-grid">
                <div>
                  <h3>Analysis</h3>
                  <p className="subtle">{configuredAnalysis.length} configured</p>
                </div>
                <div>
                  <h3>Generation</h3>
                  <p className="subtle">{configuredGeneration.length} configured</p>
                </div>
                <div>
                  <h3>Transcription</h3>
                  <p className="subtle">{configuredTranscription.length} configured</p>
                </div>
              </div>
            </div>
          </section>

          <section className="panel panel-pad stack">
            <h2>Analysis frame</h2>
            <div className="timeline">
              {analysisModules.map((module, index) => (
                <div className="timeline-row" key={module}>
                  <span className="mono">{String(index + 1).padStart(2, "0")}</span>
                  <span>{module}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="panel panel-pad stack">
            <h2>Output shape</h2>
            <p className="subtle">
              Each job will save analysis JSON, remix brief, variant prompts, and generated videos under a local storage folder.
            </p>
            <a className="button secondary" href="/settings">
              Configure providers
              <ArrowRight size={16} />
            </a>
          </section>

          <section className="panel panel-pad stack">
            <h2>Recent jobs</h2>
            {jobs.length ? (
              <div className="timeline">
                {jobs.slice(0, 5).map((job) => (
                  <a className="timeline-row" href={`/jobs/${job.id}`} key={job.id}>
                    <span className="mono">{job.status}</span>
                    <span>
                      {job.sourceFileName}
                      <br />
                      <span className="subtle">{new Date(job.createdAt).toLocaleString()}</span>
                    </span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="subtle">No local jobs yet.</p>
            )}
          </section>
        </aside>
      </div>
    </AppShell>
  );
}
