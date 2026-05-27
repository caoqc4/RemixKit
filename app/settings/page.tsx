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
            <p className="eyebrow">{hostedMode ? "云端凭证" : "本地凭证"}</p>
            <h1>服务商配置</h1>
            <p className="subtle">
              按分析模型、视频生成和转写服务分组管理 API Key。第一版本地 demo 使用你自己的 provider key。
            </p>
          </div>
          <span className="badge">
            <ShieldAlert size={14} />
            {hostedMode ? "环境变量" : "本地保存"}
          </span>
        </div>

        <section className="settings-summary">
          <ConfigCount label="Analysis" configured={statuses.analysis.filter((provider) => provider.configured).length} total={statuses.analysis.length} />
          <ConfigCount label="Generation" configured={statuses.generation.filter((provider) => provider.configured).length} total={statuses.generation.length} />
          <ConfigCount label="Transcript" configured={statuses.transcription.filter((provider) => provider.configured).length} total={statuses.transcription.length} />
        </section>

        <div className="settings-grid">
          <ProviderSection title="分析模型" providers={statuses.analysis} />
          <ProviderSection title="视频生成" providers={statuses.generation} />
          <ProviderSection title="转写服务" providers={statuses.transcription} />
        </div>

        {hostedMode ? (
          <section className="credential-panel">
            <div>
              <p className="eyebrow">Vercel env</p>
              <h2>云端 Key 映射</h2>
            </div>
            <p className="subtle">
              当前部署从 Vercel 环境变量读取服务商 Key。云端存储模式下不会启用本地明文保存。
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
              <h2>保存开发者 Key</h2>
            </div>
            <form action={saveProviderSettings} className="stack">
            <p className="subtle">
              只填写需要新增或更新的 Key。留空的字段会保留已有配置。
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
              保存到本地配置
            </button>
            <div className="provider-card">
              <div className="stack">
                <span className="badge">
                  <KeyRound size={14} />
                  也支持 .env.local
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
          {provider.configured ? "已配置" : "缺少 Key"}
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
          打开官方配置
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
