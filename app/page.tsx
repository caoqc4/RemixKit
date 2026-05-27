import { ArrowRight, Sparkles, Wand2 } from "lucide-react";
import { AppShell } from "./shell";
import { getProviderStatuses } from "@/lib/config/provider-status";
import { getStorageMode, listJobs } from "@/lib/jobs/storage";

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
  const storageMode = getStorageMode();

  return (
    <AppShell>
      <div className="page-head">
        <div className="stack">
          <p className="eyebrow">{storageMode === "vercel-blob" ? "Hosted creative workflow" : "Local creative workflow"}</p>
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
              Upload a user-owned reference video. Local mode extracts frames and audio with ffmpeg; hosted mode stores the source in Vercel Blob and uses its public URL for video providers.
            </p>
          </div>

          <form action="/api/jobs" className="stack" encType="multipart/form-data" method="post">
            <div className="field">
              <label htmlFor="video">Reference video</label>
              <input className="input" id="video" name="video" type="file" accept="video/*" />
            </div>

            <div className="field">
              <label htmlFor="sourceUrl">Public video URL</label>
              <input
                className="input"
                id="sourceUrl"
                name="sourceUrl"
                placeholder="https://example.com/your-owned-reference-video.mp4"
                type="url"
              />
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
              Upload a file for local extraction, or paste a public video URL for a hosted-friendly path.
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
              Each job saves analysis JSON, remix brief, variant prompts, and generated videos in {storageMode === "vercel-blob" ? "Vercel Blob" : "the local storage folder"}.
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
              <p className="subtle">No jobs yet.</p>
            )}
          </section>
        </aside>
      </div>
    </AppShell>
  );
}
