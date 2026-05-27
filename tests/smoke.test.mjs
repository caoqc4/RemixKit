import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { readdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();

function readText(filePath) {
  return readFileSync(path.join(root, filePath), "utf8");
}

function readJson(filePath) {
  return JSON.parse(readText(filePath));
}

function assertContains(filePath, expected) {
  const text = readText(filePath);
  assert.ok(text.includes(expected), `${filePath} should include ${expected}`);
}

function assertFile(filePath) {
  assert.ok(existsSync(path.join(root, filePath)), `${filePath} should exist`);
}

async function main() {
  const packageJson = readJson("package.json");

  assert.equal(packageJson.type, "module");
  assert.equal(packageJson.scripts.test, "node tests/smoke.test.mjs");
  assert.ok(packageJson.scripts.typecheck);
  assert.ok(packageJson.scripts.lint);
  assert.ok(packageJson.scripts.build);

  for (const filePath of [
    "lib/providers/analysis/openai.ts",
    "lib/providers/analysis/gemini.ts",
    "lib/providers/analysis/anthropic.ts",
    "lib/providers/analysis/deepseek.ts",
    "lib/providers/transcription/openai.ts",
    "lib/providers/video/runway.ts",
    "lib/providers/video/luma.ts",
    "app/api/jobs/[id]/analyze/route.ts",
    "app/api/jobs/[id]/generate/route.ts",
    "app/api/jobs/[id]/refresh-generated/route.ts"
  ]) {
    assertFile(filePath);
  }

  assertContains("lib/providers/analysis/registry.ts", 'id: "openai"');
  assertContains("lib/providers/analysis/registry.ts", 'id: "gemini"');
  assertContains("lib/providers/analysis/registry.ts", 'id: "anthropic"');
  assertContains("lib/providers/analysis/registry.ts", 'id: "deepseek"');
  assertContains("lib/providers/selection.ts", "selectAnalysisProvider");
  assertContains("lib/providers/selection.ts", "selectVideoProvider");
  assertContains("lib/analysis/schema.ts", "creativeAnalysisSchema");
  assertContains("lib/analysis/schema.ts", "variantPlansEnvelopeSchema");
  assertContains("lib/extraction/types.ts", "audio?:");
  assertContains("lib/extraction/types.ts", "transcript?:");
  assertContains("lib/jobs/storage.ts", "vercel-blob");
  assertContains("lib/jobs/storage.ts", "saveUploadedInput");
  assertContains("lib/jobs/create.ts", "createRemoteRemixJob");
  assertContains("app/api/jobs/route.ts", "sourceUrl");
  assertContains("lib/providers/video/runway.ts", "sourceVideoUrl");
  assertContains("app/page.tsx", "RemixKit Workbench");
  assertContains("app/page.tsx", "Reference creative to original ad variants.");
  assertContains("app/page.tsx", "Pipeline");
  assertContains("app/page.tsx", "Generated videos");
  assertContains("app/settings/page.tsx", "Model stack control room.");
  assertContains("app/jobs/[id]/page.tsx", "action-deck");

  assertContains("README.md", "Analysis providers are peers");
  assertContains("README.md", "Deploy From GitHub to Vercel");
  assertContains("README.md", "Transcription is a separate evidence-extraction step");
  assertContains("docs/architecture.md", "OpenAI is only first in auto-selection order");
  assertContains("docs/architecture.md", "per-user secret vault");
  assertContains("docs/mvp-roadmap.md", "Vercel Blob job storage");

  const appApiFiles = await readdir(path.join(root, "app/api/jobs/[id]"));
  assert.deepEqual(
    appApiFiles.sort(),
    ["analyze", "generate", "refresh-generated"].sort(),
    "job API routes should expose analyze/generate/refresh-generated"
  );

  console.log("Smoke checks passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
