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

export type DashboardProvider = {
  id: string
  name: string
  type: "analysis" | "video" | "storage"
  configured: boolean
}

export type DashboardProviderConfig = {
  id: string
  name: string
  category: "analysis" | "video" | "storage" | "transcription"
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
  }[]
  videoProviders: {
    id: string
    name: string
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Workbench state
  const [storageMode, setStorageMode] = useState<"local" | "cloud">(initialStorageMode)
  const [source, setSource] = useState<{
    type: "upload" | "url" | null
    file?: File
    url?: string
  }>({ type: null })
  const [brief, setBrief] = useState("")
  const [analysisModel, setAnalysisModel] = useState(analysisModels[0]?.id ?? "auto")
  const [videoProvider, setVideoProvider] = useState(videoProviders[0]?.id ?? "auto")
  const [isRunning, setIsRunning] = useState(false)
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>(defaultStages)
  const [selectedJob] = useState<string | null>(jobDetail?.id ?? recentJobs[0]?.id ?? null)

  const providerStatus = {
    analysis: providers.some((p) => p.type === "analysis" && p.configured),
    video: providers.some((p) => p.type === "video" && p.configured),
  }

  const canStart = source.type !== null && brief.trim().length > 0 && providerStatus.analysis && providerStatus.video

  const handleStartRemix = useCallback(async () => {
    if (!canStart) return
    setIsRunning(true)
    setPipelineStages((prev) =>
      prev.map((stage, index) =>
        index === 0 ? { ...stage, status: "active", detail: "提交任务..." } : { ...stage, status: "pending" }
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
      formData.set("goal", brief)
      formData.set("analysisProvider", analysisModel)
      formData.set("generationProvider", videoProvider)

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
          if (i === 0) return { ...stage, status: "error", detail: "提交失败" }
          return { ...stage, status: "pending" }
        })
      )
    } finally {
      setIsRunning(false)
    }
  }, [analysisModel, brief, canStart, source, videoProvider])

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
            recentRun={
              isRunning
                ? { status: "running", timestamp: "运行中", jobId: "current" }
                : { status: "completed", timestamp: "10 分钟前", jobId: "job-1" }
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
                        recentRun={
                          isRunning
                            ? { status: "running", timestamp: "运行中", jobId: "current" }
                            : undefined
                        }
                      />
                    </div>

                    {/* Source + Brief Row */}
                    <div className="grid gap-6 lg:grid-cols-2">
                      {/* Source Intake */}
                      <div className="rounded-lg border border-border bg-card p-4">
                        <SourceIntake source={source} onSourceChange={setSource} />
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
                        />
                      </div>
                    </div>

                    {/* Pipeline Board - Full width on mobile, side panel on large */}
                    <div className="rounded-lg border border-border bg-card p-4 xl:hidden">
                      <PipelineBoard stages={pipelineStages} />
                    </div>

                    {/* Job Detail Section */}
                    {selectedJob && (
                      <JobDetail
                        job={jobDetail ?? {
                          id: selectedJob,
                          name: "等待任务数据",
                          status: "queued",
                          createdAt: "尚未创建",
                        }}
                        metrics={metrics}
                        generatedVideos={generatedVideos}
                        warnings={warnings}
                        onAnalyze={() => runJobAction("analyze")}
                        onGenerate={() => runJobAction("generate")}
                        onRefresh={() => runJobAction("refresh-generated")}
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
                    <PipelineBoard stages={pipelineStages} />
                  </div>
                  {/* Inspection */}
                  <InspectionRail
                    providers={providers}
                    artifacts={artifacts}
                    recentJobs={recentJobs}
                    onViewJob={handleViewJob}
                    onConfigureProvider={handleConfigureProvider}
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
                    任务队列
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
                            {job.variants && ` · ${job.variants} 个变体`}
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
                          {job.status === "completed" && "完成"}
                          {job.status === "running" && "运行中"}
                          {job.status === "queued" && "队列中"}
                        </span>
                      </button>
                    )) : (
                      <div className="rounded-lg border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
                        还没有任务。回到工作台上传一个参考视频开始。
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
                    服务商配置
                  </h2>
                  <p className="mb-6 text-sm text-muted-foreground">
                    配置您的 API 密钥以启用各项服务。密钥仅保存在本地。
                  </p>
                  <ProviderSettings
                    providers={providerConfigs}
                    onSaveKey={handleSaveKey}
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
                    设置
                  </h2>
                  <p className="mb-6 text-sm text-muted-foreground">
                    管理应用偏好设置和数据
                  </p>

                  <div className="space-y-4">
                    <div className="rounded-lg border border-border bg-card p-4">
                      <h3 className="font-medium text-foreground">存储设置</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        选择素材和生成结果的存储位置
                      </p>
                      <div className="mt-3 flex gap-2">
                        <Button
                          variant={storageMode === "local" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setStorageMode("local")}
                        >
                          本地存储
                        </Button>
                        <Button
                          variant={storageMode === "cloud" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setStorageMode("cloud")}
                        >
                          云存储
                        </Button>
                      </div>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-4">
                      <h3 className="font-medium text-foreground">数据管理</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        清除本地缓存或导出数据
                      </p>
                      <div className="mt-3 flex gap-2">
                        <Button variant="outline" size="sm">
                          导出数据
                        </Button>
                        <Button variant="outline" size="sm" className="text-destructive">
                          清除缓存
                        </Button>
                      </div>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-4">
                      <h3 className="font-medium text-foreground">关于</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        RemixKit v1.0.0
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        开源 AI 视频广告混剪工作流。
                        <a href="#" className="ml-1 text-primary hover:underline">
                          查看文档
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
