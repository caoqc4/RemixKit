import { CheckCircle2, Circle, ExternalLink, KeyRound, ShieldAlert, SlidersHorizontal } from "lucide-react";
import { AppShell } from "../shell";
import { getProviderStatuses } from "@/lib/config/provider-status";
import { getStorageMode } from "@/lib/jobs/storage";
import { saveProviderSettings } from "./actions";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const statuses = await getProviderStatuses();
  const storageMode = getStorageMode();
  const hostedMode = storageMode === "vercel-blob";

  return (
    <AppShell>
      <div className="settings-layout">
        <div className="page-head">
          <div className="stack">
            <p className="eyebrow">{hostedMode ? "Hosted credentials" : "Local credentials"}</p>
            <h1>Model stack control room.</h1>
            <p className="subtle">
              Environment keys come first. Local key saving stays available only for developer runs.
            </p>
          </div>
          <span className="badge">
            <ShieldAlert size={14} />
            {hostedMode ? "Environment keys" : "Local plaintext"}
          </span>
        </div>

        <section className="settings-summary">
          <ConfigCount label="Analysis" configured={statuses.analysis.filter((provider) => provider.configured).length} total={statuses.analysis.length} />
          <ConfigCount label="Generation" configured={statuses.generation.filter((provider) => provider.configured).length} total={statuses.generation.length} />
          <ConfigCount label="Transcript" configured={statuses.transcription.filter((provider) => provider.configured).length} total={statuses.transcription.length} />
        </section>

        <div className="settings-grid">
          <ProviderSection title="Analysis providers" providers={statuses.analysis} />
          <ProviderSection title="Video generation providers" providers={statuses.generation} />
          <ProviderSection title="Transcription providers" providers={statuses.transcription} />
        </div>

        {hostedMode ? (
          <section className="credential-panel">
            <div>
              <p className="eyebrow">Vercel env</p>
              <h2>Hosted key map</h2>
            </div>
            <p className="subtle">
              This deployment reads provider keys from Vercel environment variables. Local plaintext key saving is disabled in hosted storage mode.
            </p>
            <pre className="mono env-block">{`REMIXKIT_STORAGE=vercel-blob
BLOB_READ_WRITE_TOKEN=...
OPENAI_API_KEY=...
GEMINI_API_KEY=...
ANTHROPIC_API_KEY=...
DEEPSEEK_API_KEY=...
LUMA_API_KEY=...
RUNWAY_API_KEY=...`}</pre>
          </section>
        ) : (
          <section className="credential-panel">
            <div>
              <p className="eyebrow">Local config</p>
              <h2>Save developer keys</h2>
            </div>
            <form action={saveProviderSettings} className="stack">
            <p className="subtle">
              Paste only the keys you want to add or update. Existing saved keys are preserved when a field is left blank.
            </p>
            <div className="provider-grid">
              {uniqueProvidersByEnvKey([...statuses.analysis, ...statuses.transcription, ...statuses.generation]).map((provider) => (
                <div className="field" key={provider.envKey}>
                  <label htmlFor={provider.envKey}>{provider.name}</label>
                  <input
                    className="input"
                    id={provider.envKey}
                    name={provider.envKey}
                    placeholder={provider.envKey}
                    type="password"
                  />
                </div>
              ))}
            </div>
            <button className="button" type="submit">
              <KeyRound size={16} />
              Save to local config
            </button>
            <div className="provider-card">
              <div className="stack">
                <span className="badge">
                  <KeyRound size={14} />
                  .env.local also works
                </span>
                <pre className="mono">{`OPENAI_API_KEY=...
GEMINI_API_KEY=...
ANTHROPIC_API_KEY=...
DEEPSEEK_API_KEY=...
LUMA_API_KEY=...
RUNWAY_API_KEY=...`}</pre>
              </div>
            </div>
          </form>
          </section>
        )}
      </div>
    </AppShell>
  );
}

type ProviderStatus = {
  name: string;
  envKey: string;
  description: string;
  setupUrl: string;
  capabilityNotes: string[];
  configured: boolean;
};

function ProviderSection({ title, providers }: { title: string; providers: ProviderStatus[] }) {
  return (
    <section className="provider-section">
      <div className="panel-head">
        <h2>{title}</h2>
        <SlidersHorizontal size={18} />
      </div>
      <div className="provider-list">
        {providers.map((provider) => (
          <ProviderCard key={provider.envKey} provider={provider} />
        ))}
      </div>
    </section>
  );
}

function ConfigCount({ label, configured, total }: { label: string; configured: number; total: number }) {
  return (
    <div className="config-count">
      <strong>
        {configured}/{total}
      </strong>
      <span>{label}</span>
    </div>
  );
}

function ProviderCard({ provider }: { provider: ProviderStatus }) {
  return (
    <div className={`provider-card ${provider.configured ? "configured" : ""}`}>
      <div className="stack">
        <span className={provider.configured ? "badge ok" : "badge"}>
          {provider.configured ? <CheckCircle2 size={14} /> : <Circle size={14} />}
          {provider.configured ? "Configured" : "Missing key"}
        </span>
        <div>
          <h3>{provider.name}</h3>
          <p className="subtle">{provider.description}</p>
        </div>
        <p className="mono">{provider.envKey}</p>
        <div className="stack compact-stack">
          {provider.capabilityNotes.map((note) => (
            <p className="subtle" key={note}>
              {note}
            </p>
          ))}
        </div>
        <a className="button secondary" href={provider.setupUrl} rel="noreferrer" target="_blank">
          Open official setup
          <ExternalLink size={15} />
        </a>
      </div>
    </div>
  );
}

function uniqueProvidersByEnvKey<TProvider extends { envKey: string }>(providers: TProvider[]) {
  const seen = new Set<string>();
  return providers.filter((provider) => {
    if (seen.has(provider.envKey)) {
      return false;
    }
    seen.add(provider.envKey);
    return true;
  });
}
