"use client"

import { cn } from "@/lib/utils"
import {
  Play,
  RotateCcw,
  Search,
  Download,
  Video,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import type { DashboardLanguage } from "@/components/dashboard/i18n"
import { metricLabel, statusLabel, text } from "@/components/dashboard/i18n"

interface JobMetric {
  label: string
  value: string | number
  change?: string
}

interface GeneratedVideo {
  id: string
  name: string
  thumbnail?: string
  duration: string
  status: "ready" | "processing" | "error"
}

interface JobWarning {
  type: "info" | "warning" | "error"
  message: string
}

interface JobDetailProps {
  job: {
    id: string
    name: string
    status: "completed" | "running" | "failed" | "queued"
    createdAt: string
    sourceFile?: string
    analysisModel?: string
    videoProvider?: string
    progress?: number
  }
  metrics: JobMetric[]
  generatedVideos: GeneratedVideo[]
  warnings: JobWarning[]
  onAnalyze: () => void
  onGenerate: () => void
  onRefresh: () => void
  language: DashboardLanguage
}

export function JobDetail({
  job,
  metrics,
  generatedVideos,
  warnings,
  onAnalyze,
  onGenerate,
  onRefresh,
  language,
}: JobDetailProps) {
  const t = text[language]

  return (
    <div className="space-y-6 rounded-lg border border-border bg-card p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground">{job.name}</h2>
            <Badge
              variant="outline"
              className={cn(
                job.status === "completed" && "border-success/30 text-success",
                job.status === "running" && "border-primary/30 text-primary",
                job.status === "failed" && "border-destructive/30 text-destructive",
                job.status === "queued" && "border-muted-foreground/30 text-muted-foreground"
              )}
            >
              {job.status === "completed" && (
                <>
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  {statusLabel(language, "completed")}
                </>
              )}
              {job.status === "running" && (
                <>
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  {statusLabel(language, "running")}
                </>
              )}
              {job.status === "failed" && statusLabel(language, "failed")}
              {job.status === "queued" && statusLabel(language, "queued")}
            </Badge>
          </div>
          <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {job.createdAt}
            </span>
            {job.sourceFile && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Video className="h-3.5 w-3.5" />
                  {job.sourceFile}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={onAnalyze}>
            <Search className="mr-1.5 h-3.5 w-3.5" />
            {t.analyze}
          </Button>
          <Button variant="outline" size="sm" onClick={onGenerate}>
            <Play className="mr-1.5 h-3.5 w-3.5" />
            {t.generate}
          </Button>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            {t.refresh}
          </Button>
        </div>
      </div>

      {/* Progress */}
      {job.status === "running" && job.progress !== undefined && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t.progress}</span>
            <span className="font-medium text-foreground">{job.progress}%</span>
          </div>
          <Progress value={job.progress} className="h-2" />
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-2">
          {warnings.map((warning, index) => (
            <div
              key={index}
              className={cn(
                "flex items-start gap-2 rounded-md px-3 py-2 text-sm",
                warning.type === "info" && "bg-primary/5 text-primary",
                warning.type === "warning" && "bg-warning/10 text-warning",
                warning.type === "error" && "bg-destructive/10 text-destructive"
              )}
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{warning.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-md border border-border bg-muted/30 px-3 py-2"
          >
            <p className="text-xs text-muted-foreground">{metricLabel(language, metric.label)}</p>
            <p className="mt-0.5 text-lg font-semibold text-foreground">
              {metric.value === "待分析" ? t.pendingAnalysis : metric.value}
            </p>
            {metric.change && (
              <p className="text-xs text-success">{metric.change}</p>
            )}
          </div>
        ))}
      </div>

      {/* Generated Videos */}
      {generatedVideos.length > 0 && (
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
            <h3 className="text-sm font-medium text-foreground">
              {t.generatedVideos} ({generatedVideos.length})
            </h3>
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {generatedVideos.map((video) => (
                <div
                  key={video.id}
                  className="group overflow-hidden rounded-md border border-border bg-muted/30 transition-colors hover:bg-muted/50"
                >
                  <div className="relative aspect-video bg-sidebar">
                    {video.thumbnail ? (
                      <img
                        src={video.thumbnail}
                        alt={video.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Video className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    {video.status === "processing" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 rounded bg-background/80 px-1.5 py-0.5 text-xs font-medium text-foreground">
                      {video.duration}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2">
                    <span className="truncate text-sm text-foreground">
                      {video.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Source & Config */}
      <div className="grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t.sourceStorage}
          </h4>
          <p className="mt-1 text-sm text-foreground">
            {job.sourceFile || t.noUpload}
          </p>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t.configUsed}
          </h4>
          <p className="mt-1 text-sm text-foreground">
            {job.analysisModel} + {job.videoProvider}
          </p>
        </div>
      </div>
    </div>
  )
}
