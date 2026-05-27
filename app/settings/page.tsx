import { CheckCircle2, Circle, ExternalLink, KeyRound, ShieldAlert } from "lucide-react";
import { AppShell } from "../shell";
import { getProviderStatuses } from "@/lib/config/provider-status";
import { saveProviderSettings } from "./actions";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const statuses = await getProviderStatuses();

  return (
    <AppShell>
      <div className="page-head">
        <div className="stack">
          <p className="eyebrow">Local credentials</p>
          <h1>Configure your own model and video API keys.</h1>
          <p className="subtle">
            Keys are read from environment variables or a local plaintext config file. No accounts, cloud sync, or hosted storage in the MVP.
          </p>
        </div>
        <span className="badge">
          <ShieldAlert size={14} />
          Local plaintext
        </span>
      </div>

      <div className="grid">
        <section className="panel panel-pad stack">
          <h2>Analysis providers</h2>
          <div className="provider-grid">
            {statuses.analysis.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        </section>

        <section className="panel panel-pad stack">
          <h2>Video generation providers</h2>
          <div className="provider-grid">
            {statuses.generation.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        </section>
      </div>

      <section className="section stack settings-section">
        <h2>Transcription providers</h2>
        <div className="panel panel-pad">
          <div className="provider-grid">
            {statuses.transcription.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        </div>
      </section>

      <section className="section stack settings-section">
        <h2>Save local keys</h2>
        <form action={saveProviderSettings} className="panel panel-pad stack">
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
    </AppShell>
  );
}

type ProviderCardProps = {
  provider: {
    name: string;
    envKey: string;
    description: string;
    setupUrl: string;
    capabilityNotes: string[];
    configured: boolean;
  };
};

function ProviderCard({ provider }: ProviderCardProps) {
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
