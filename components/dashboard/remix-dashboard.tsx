"use client"

import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { SourceIntake } from "@/components/dashboard/source-intake"
import { RemixBrief } from "@/components/dashboard/remix-brief"
import {
  PipelineBoard,
  defaultStages,
  type PipelineStage,
} from "@/components/dashboard/pipeline-board"
import { InspectionRail } from "@/components/dashboard/inspection-rail"
import { JobDetail } from "@/components/dashboard/job-detail"
import { ProviderSettings } from "@/components/dashboard/provider-settings"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import type { DashboardLanguage } from "@/components/dashboard/i18n"
import { statusLabel, text } from "@/components/dashboard/i18n"

export type DashboardProvider = {
  id: string
  name: string
  type: "analysis" | "video" | "storage"
  configured: boolean
}

export type DashboardProviderConfig = {
  id: string
  name: string
  category: "aggregator" | "official" | "analysis" | "video" | "storage" | "transcription"
  configured: boolean
  apiKeyPlaceholder?: string
  docsUrl?: string
  description?: string
}

export type DashboardRecentJob = {
  id: string
  name: string
  status: "completed" | "running" | "failed" | "queued"
  createdAt: string
  variants?: number
}

export type DashboardArtifact = {
  id: string
  type: "video" | "image" | "json"
  name: string
  createdAt: string
  thumbnail?: string
}

export type DashboardJobDetail = {
  id: string
  name: string
  status: "completed" | "running" | "failed" | "queued"
  createdAt: string
  sourceFile?: string
  analysisModel?: string
  videoProvider?: string
  progress?: number
}

export type DashboardMetric = {
  label: string
  value: string | number
  change?: string
}

export type DashboardGeneratedVideo = {
  id: string
  name: string
  thumbnail?: string
  duration: string
  status: "ready" | "processing" | "error"
}

export type DashboardWarning = {
  type: "info" | "warning" | "error"
  message: string
}

export type DashboardPageProps = {
  initialNav?: "workbench" | "jobs" | "providers" | "settings"
  storageMode: "local" | "cloud"
  providers: DashboardProvider[]
  providerConfigs: DashboardProviderConfig[]
  recentJobs: DashboardRecentJob[]
  artifacts: DashboardArtifact[]
  jobDetail?: DashboardJobDetail
  metrics: DashboardMetric[]
  generatedVideos: DashboardGeneratedVideo[]
  warnings: DashboardWarning[]
  analysisModels: {
    id: string
    name: string
    provider?: string
    providerId?: string
    configured?: boolean
    tags?: string[]
  }[]
  videoProviders: {
    id: string
    name: string
    providerId?: string
    configured?: boolean
    tags?: string[]
    status?: "ready" | "beta" | "new"
  }[]
}

type DashboardNav = NonNullable<DashboardPageProps["initialNav"]>

export function RemixDashboard({
  initialNav = "workbench",
  storageMode: initialStorageMode,
  providers,
  providerConfigs,
  recentJobs,
  artifacts,
  jobDetail,
  metrics,
  generatedVideos,
  warnings,
  analysisModels,
  videoProviders,
}: DashboardPageProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeNav, setActiveNav] = useState<DashboardNav>(initialNav)
  const [language, setLanguage] = useState<DashboardLanguage>("zh")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Workbench state
  const [storageMode, setStorageMode] = useState<"local" | "cloud">(initialStorageMode)
  const [source, setSource] = useState<{
    type: "upload" | "url" | null
    file?: File
    url?: string
  }>({ type: null })
  const [brief, setBrief] = useState("")
  const [analysisModel, setAnalysisModel] = useState(
    analysisModels.find((model) => model.configured)?.id ?? analysisModels[0]?.id ?? "auto"
  )
  const [videoProvider, setVideoProvider] = useState(
    videoProviders.find((provider) => provider.configured)?.id ?? videoProviders[0]?.id ?? "auto"
  )
  const [isRunning, setIsRunning] = useState(false)
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>(defaultStages)
  const [selectedJob] = useState<string | null>(jobDetail?.id ?? recentJobs[0]?.id ?? null)
  const t = text[language]

  const providerStatus = {
    analysis: providers.some((p) => p.type === "analysis" && p.configured),
    video: providers.some((p) => p.type === "video" && p.configured),
  }

  const selectedAnalysisModel = analysisModels.find((model) => model.id === analysisModel)
  const selectedVideoProvider = videoProviders.find((provider) => provider.id === videoProvider)
  const canStart =
    source.type !== null &&
    brief.trim().length > 0 &&
    Boolean(selectedAnalysisModel?.configured) &&
    Boolean(selectedVideoProvider?.configured)

  const handleStartRemix = useCallback(async () => {
    if (!canStart) return
    setIsRunning(true)
    setPipelineStages((prev) =>
      prev.map((stage, index) =>
        index === 0 ? { ...stage, status: "active", detail: t.submitJob } : { ...stage, status: "pending" }
      )
    )

    try {
      const formData = new FormData()
      if (source.type === "upload" && source.file) {
        formData.set("video", source.file)
      }
      if (source.type === "url" && source.url) {
        formData.set("sourceUrl", source.url)
      }
      const selectedAnalysis = analysisModels.find((model) => model.id === analysisModel)
      const selectedVideo = videoProviders.find((provider) => provider.id === videoProvider)
      formData.set("goal", brief)
      formData.set("analysisProvider", selectedAnalysis?.providerId ?? analysisModel)
      formData.set("generationProvider", selectedVideo?.providerId ?? videoProvider)

      const response = await fetch("/api/jobs", { method: "POST", body: formData })

      if (response.redirected) {
        window.location.href = response.url
        return
      }

      if (!response.ok) {
        throw new Error(await response.text())
      }

      window.location.reload()
    } catch (error) {
      console.error("[RemixKit] Failed to start remix run:", error)
      setPipelineStages((prev) =>
        prev.map((stage, i) => {
          if (i === 0) return { ...stage, status: "error", detail: t.submitFailed }
          return { ...stage, status: "pending" }
        })
      )
    } finally {
      setIsRunning(false)
    }
  }, [analysisModel, analysisModels, brief, canStart, source, t.submitFailed, t.submitJob, videoProvider, videoProviders])

  const handleViewJob = useCallback((jobId: string) => {
    window.location.href = `/jobs/${jobId}`
  }, [])

  const handleConfigureProvider = useCallback(() => {
    setActiveNav("providers")
  }, [])

  const handleSaveKey = useCallback(async (providerId: string, key: string) => {
    const provider = providerConfigs.find((item) => item.id === providerId)
    if (!provider?.apiKeyPlaceholder) return

    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ envKey: provider.apiKeyPlaceholder, value: key }),
    })
    window.location.reload()
  }, [providerConfigs])

  const runJobAction = useCallback(async (action: "analyze" | "generate" | "refresh-generated") => {
    const jobId = jobDetail?.id
    if (!jobId) return

    await fetch(`/api/jobs/${jobId}/${action}`, { method: "POST" })
    window.location.href = `/jobs/${jobId}`
  }, [jobDetail])

  // Mobile sidebar
  const sidebarContent = (
    <Sidebar
      activeNav={activeNav}
      onNavChange={(nav) => {
        setActiveNav(nav as DashboardNav)
        setMobileMenuOpen(false)
      }}
      collapsed={false}
      onCollapsedChange={() => {}}
      language={language}
    />
  )

  return (
    <div className="flex h-screen bg-canvas">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          activeNav={activeNav}
          onNavChange={(nav) => setActiveNav(nav as DashboardNav)}
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
          language={language}
        />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-56 p-0">
          {sidebarContent}
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-200",
          sidebarCollapsed ? "lg:ml-16" : "lg:ml-56"
        )}
      >
        {/* Mobile Header */}
        <div className="flex h-14 items-center gap-3 border-b border-border bg-card px-4 lg:hidden">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-semibold">RemixKit</span>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block">
          <Header
            storageMode={storageMode}
            onStorageModeChange={setStorageMode}
            providerStatus={providerStatus}
            language={language}
            onLanguageChange={setLanguage}
            recentRun={
              isRunning
                ? { status: "running", timestamp: t.running, jobId: "current" }
                : { status: "completed", timestamp: t.recentRun, jobId: "job-1" }
            }
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {activeNav === "workbench" && (
            <div className="flex h-full">
              {/* Main Work Area */}
              <ScrollArea className="flex-1">
                <div className="p-4 lg:p-6">
                  <div className="mx-auto max-w-4xl space-y-6">
                    {/* Mobile header info */}
                    <div className="lg:hidden">
                      <Header
                        storageMode={storageMode}
                        onStorageModeChange={setStorageMode}
                        providerStatus={providerStatus}
                        language={language}
                        onLanguageChange={setLanguage}
                        recentRun={
                          isRunning
                            ? { status: "running", timestamp: t.running, jobId: "current" }
                            : undefined
                        }
                      />
                    </div>

                    {/* Source + Brief Row */}
                    <div className="grid gap-6 lg:grid-cols-2">
                      {/* Source Intake */}
                      <div className="rounded-lg border border-border bg-card p-4">
                        <SourceIntake source={source} onSourceChange={setSource} language={language} />
                      </div>

                      {/* Remix Brief */}
                      <div className="rounded-lg border border-border bg-card p-4">
                        <RemixBrief
                          brief={brief}
                          onBriefChange={setBrief}
                          analysisModel={analysisModel}
                          onAnalysisModelChange={setAnalysisModel}
                          videoProvider={videoProvider}
                          onVideoProviderChange={setVideoProvider}
                          onStartRemix={handleStartRemix}
                          isRunning={isRunning}
                          canStart={canStart}
                          analysisModels={analysisModels}
                          videoProviders={videoProviders}
                          language={language}
                        />
                      </div>
                    </div>

                    {/* Pipeline Board - Full width on mobile, side panel on large */}
                    <div className="rounded-lg border border-border bg-card p-4 xl:hidden">
                      <PipelineBoard stages={pipelineStages} language={language} />
                    </div>

                    {/* Job Detail Section */}
                    {selectedJob && (
                      <JobDetail
                        job={jobDetail ?? {
                          id: selectedJob,
                          name: t.waitingJob,
                          status: "queued",
                          createdAt: t.notCreated,
                        }}
                        metrics={metrics}
                        generatedVideos={generatedVideos}
                        warnings={warnings}
                        onAnalyze={() => runJobAction("analyze")}
                        onGenerate={() => runJobAction("generate")}
                        onRefresh={() => runJobAction("refresh-generated")}
                        language={language}
                      />
                    )}
                  </div>
                </div>
              </ScrollArea>

              {/* Right Inspection Rail - Desktop only */}
              <div className="hidden w-72 shrink-0 border-l border-border bg-card xl:block">
                <div className="flex h-full flex-col">
                  {/* Pipeline compact view */}
                  <div className="border-b border-border p-4">
                    <PipelineBoard stages={pipelineStages} language={language} />
                  </div>
                  {/* Inspection */}
                  <InspectionRail
                    providers={providers}
                    artifacts={artifacts}
                    recentJobs={recentJobs}
                    onViewJob={handleViewJob}
                    onConfigureProvider={handleConfigureProvider}
                    language={language}
                  />
                </div>
              </div>
            </div>
          )}

          {activeNav === "jobs" && (
            <ScrollArea className="h-full">
              <div className="p-4 lg:p-6">
                <div className="mx-auto max-w-4xl">
                  <h2 className="mb-4 text-lg font-semibold text-foreground">
                    {t.jobs}
                  </h2>
                  <div className="space-y-3">
                    {recentJobs.length ? recentJobs.map((job) => (
                      <button
                        key={job.id}
                        onClick={() => handleViewJob(job.id)}
                        className="flex w-full items-center justify-between rounded-lg border border-border bg-card p-4 text-left transition-colors hover:bg-card/80"
                      >
                        <div>
                          <span className="font-medium text-foreground">
                            {job.name}
                          </span>
                          <p className="mt-0.5 text-sm text-muted-foreground">
                            {job.createdAt}
                            {job.variants && ` · ${job.variants} ${t.variants}`}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-xs font-medium",
                            job.status === "completed" &&
                              "bg-success/10 text-success",
                            job.status === "running" &&
                              "bg-primary/10 text-primary",
                            job.status === "queued" &&
                              "bg-muted text-muted-foreground"
                          )}
                        >
                          {statusLabel(language, job.status)}
                        </span>
                      </button>
                    )) : (
                      <div className="rounded-lg border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
                        {t.noJobs}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}

          {activeNav === "providers" && (
            <ScrollArea className="h-full">
              <div className="p-4 lg:p-6">
                <div className="mx-auto max-w-2xl">
                  <h2 className="mb-1 text-lg font-semibold text-foreground">
                    {t.providerSettings}
                  </h2>
                  <p className="mb-6 text-sm text-muted-foreground">
                    {t.providerSettingsHelp}
                  </p>
                  <ProviderSettings
                    providers={providerConfigs}
                    onSaveKey={handleSaveKey}
                    language={language}
                    analysisModels={analysisModels}
                    videoProviders={videoProviders}
                    analysisModel={analysisModel}
                    videoProvider={videoProvider}
                    onAnalysisModelChange={setAnalysisModel}
                    onVideoProviderChange={setVideoProvider}
                  />
                </div>
              </div>
            </ScrollArea>
          )}

          {activeNav === "settings" && (
            <ScrollArea className="h-full">
              <div className="p-4 lg:p-6">
                <div className="mx-auto max-w-2xl">
                  <h2 className="mb-1 text-lg font-semibold text-foreground">
                    {t.settings}
                  </h2>
                  <p className="mb-6 text-sm text-muted-foreground">
                    {t.settingsHelp}
                  </p>

                  <div className="space-y-4">
                    <div className="rounded-lg border border-border bg-card p-4">
                      <h3 className="font-medium text-foreground">{t.storageSettings}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {t.storageSettingsHelp}
                      </p>
                      <div className="mt-3 flex gap-2">
                        <Button
                          variant={storageMode === "local" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setStorageMode("local")}
                        >
                          {t.localStorage}
                        </Button>
                        <Button
                          variant={storageMode === "cloud" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setStorageMode("cloud")}
                        >
                          {t.cloudStorage}
                        </Button>
                      </div>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-4">
                      <h3 className="font-medium text-foreground">{t.dataManagement}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {t.dataManagementHelp}
                      </p>
                      <div className="mt-3 flex gap-2">
                        <Button variant="outline" size="sm">
                          {t.exportData}
                        </Button>
                        <Button variant="outline" size="sm" className="text-destructive">
                          {t.clearCache}
                        </Button>
                      </div>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-4">
                      <h3 className="font-medium text-foreground">{t.about}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        RemixKit v1.0.0
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {t.aboutText}
                        <a href="#" className="ml-1 text-primary hover:underline">
                          {t.docs}
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  )
}
