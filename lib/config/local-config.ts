import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

const localConfigSchema = z.object({
  keys: z.record(z.string()).default({})
});

export type LocalConfig = z.infer<typeof localConfigSchema>;

const configPath = path.join(process.cwd(), ".remixkit", "config.json");

export async function readLocalConfig(): Promise<LocalConfig> {
  try {
    const raw = await readFile(configPath, "utf8");
    return localConfigSchema.parse(JSON.parse(raw));
  } catch {
    return { keys: {} };
  }
}

export async function hasCredential(envKey: string): Promise<boolean> {
  return Boolean(await getCredential(envKey));
}

export async function getCredential(envKey: string): Promise<string | null> {
  if (process.env[envKey]) {
    return process.env[envKey] ?? null;
  }

  const config = await readLocalConfig();
  return config.keys[envKey] || null;
}

export async function getConfigValue(envKey: string): Promise<string | null> {
  return getCredential(envKey);
}

export async function writeLocalConfig(config: LocalConfig): Promise<void> {
  await mkdir(path.dirname(configPath), { recursive: true });
  await writeFile(configPath, `${JSON.stringify(localConfigSchema.parse(config), null, 2)}\n`, "utf8");
}

export async function upsertLocalCredentials(keys: Record<string, string>): Promise<void> {
  const config = await readLocalConfig();
  const nextKeys = { ...config.keys };

  for (const [key, value] of Object.entries(keys)) {
    const trimmed = value.trim();
    if (trimmed) {
      nextKeys[key] = trimmed;
    }
  }

  await writeLocalConfig({ keys: nextKeys });
}
