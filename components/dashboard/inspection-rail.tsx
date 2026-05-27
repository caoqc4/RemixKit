"use client"

import { cn } from "@/lib/utils"
import {
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Video,
  Clock,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { DashboardLanguage } from "@/components/dashboard/i18n"
import { artifactName, statusLabel, text } from "@/components/dashboard/i18n"

interface Provider {
  id: string
  name: string
  type: "analysis" | "video" | "storage"
  configured: boolean
  status?: "ready" | "error" | "rate-limited"
}

interface Artifact {
  id: string
  type: "video" | "image" | "json"
  name: string
  thumbnail?: string
  createdAt: string
}

interface RecentJob {
  id: string
  name: string
  status: "completed" | "running" | "failed" | "queued"
  createdAt: string
  variants?: number
}

interface InspectionRailProps {
  providers: Provider[]
  artifacts: Artifact[]
  recentJobs: RecentJob[]
  onViewJob: (jobId: string) => void
  onConfigureProvider: (providerId: string) => void
  language: DashboardLanguage
}

export function InspectionRail({
  providers,
  artifacts,
  recentJobs,
  onViewJob,
  onConfigureProvider,
  language,
}: InspectionRailProps) {
  const t = text[language]

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1">
        <div className="space-y-6 p-4">
          {/* Provider Readiness */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t.providerStatus}
            </h3>
            <div className="space-y-2">
              {providers.map((provider) => (
                <div
                  key={provider.id}
                  className="flex items-center justify-between rounded-md border border-border bg-card/50 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    {provider.configured ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                    ) : (
                      <AlertCircle className="h-3.5 w-3.5 text-warning" />
                    )}
                    <span className="text-sm text-foreground">
                      {provider.name}
                    </span>
                  </div>
                  {!provider.configured && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs text-primary hover:text-primary"
                      onClick={() => onConfigureProvider(provider.id)}
                    >
                      {t.configure}
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Generated Artifacts */}
          {artifacts.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t.artifacts}
              </h3>
              <div className="space-y-2">
                {artifacts.map((artifact) => (
                  <div
                    key={artifact.id}
                    className="group flex items-center gap-3 rounded-md border border-border bg-card/50 p-2 transition-colors hover:bg-card"
                  >
                    <div className="flex h-10 w-14 items-center justify-center rounded bg-muted">
                      {artifact.thumbnail ? (
                        <img
                          src={artifact.thumbnail}
                          alt={artifact.name}
                          className="h-full w-full rounded object-cover"
                        />
                      ) : (
                        <Video className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {artifactName(language, artifact.name)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {artifact.createdAt}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Jobs */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t.recentJobs}
            </h3>
            <div className="space-y-2">
              {recentJobs.map((job) => (
                <button
                  key={job.id}
                  onClick={() => onViewJob(job.id)}
                  className="group flex w-full items-center justify-between rounded-md border border-border bg-card/50 px-3 py-2 text-left transition-colors hover:bg-card"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-foreground">
                        {job.name}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "shrink-0 text-[10px]",
                          job.status === "completed" &&
                            "border-success/30 text-success",
                          job.status === "running" &&
                            "border-primary/30 text-primary",
                          job.status === "failed" &&
                            "border-destructive/30 text-destructive",
                          job.status === "queued" &&
                            "border-muted-foreground/30 text-muted-foreground"
                        )}
                      >
                        {statusLabel(language, job.status)}
                      </Badge>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{job.createdAt}</span>
                      {job.variants && (
                        <>
                          <span>·</span>
                          <span>{language === "zh" ? `${job.variants} ${t.variants}` : `${job.variants} ${t.variants}`}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
