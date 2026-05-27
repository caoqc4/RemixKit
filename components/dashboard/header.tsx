"use client"

import { cn } from "@/lib/utils"
import {
  HardDrive,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronDown,
  Languages,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { DashboardLanguage } from "@/components/dashboard/i18n"
import { text } from "@/components/dashboard/i18n"

interface HeaderProps {
  storageMode: "local" | "cloud"
  onStorageModeChange: (mode: "local" | "cloud") => void
  providerStatus: {
    analysis: boolean
    video: boolean
  }
  recentRun?: {
    status: "completed" | "running" | "failed"
    timestamp: string
    jobId: string
  }
  language: DashboardLanguage
  onLanguageChange: (language: DashboardLanguage) => void
}

export function Header({
  storageMode,
  onStorageModeChange,
  providerStatus,
  recentRun,
  language,
  onLanguageChange,
}: HeaderProps) {
  const allProvidersReady = providerStatus.analysis && providerStatus.video
  const t = text[language]

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
      {/* Left: Context */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <h1 className="text-sm font-semibold text-foreground">{t.workbench}</h1>
          <p className="text-xs text-muted-foreground">{t.tagline}</p>
        </div>
      </div>

      {/* Center/Right: Status indicators */}
      <div className="flex items-center gap-3">
        {/* Storage Mode */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-2 text-xs font-medium"
            >
              {storageMode === "local" ? (
                <HardDrive className="h-3.5 w-3.5" />
              ) : (
                <Cloud className="h-3.5 w-3.5" />
              )}
              <span className="hidden sm:inline">
                {storageMode === "local" ? t.localStorage : t.cloudStorage}
              </span>
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onStorageModeChange("local")}>
              <HardDrive className="mr-2 h-4 w-4" />
              {t.localStorage}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStorageModeChange("cloud")}>
              <Cloud className="mr-2 h-4 w-4" />
              {t.cloudStorage}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Provider Status */}
        <div className="flex items-center gap-1.5">
          <div
            className={cn(
              "flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium",
              allProvidersReady
                ? "border-success/30 bg-success/10 text-success"
                : "border-warning/30 bg-warning/10 text-warning"
            )}
          >
            {allProvidersReady ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <AlertCircle className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">
              {allProvidersReady ? t.providersReady : t.needsConfig}
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 px-2.5 text-xs font-medium"
          aria-label={t.languageLabel}
          onClick={() => onLanguageChange(language === "zh" ? "en" : "zh")}
        >
          <Languages className="h-3.5 w-3.5" />
          {t.languageToggle}
        </Button>

        {/* Recent Run Status */}
        {recentRun && (
          <Badge
            variant="outline"
            className={cn(
              "gap-1.5 font-normal",
              recentRun.status === "completed" &&
                "border-success/30 text-success",
              recentRun.status === "running" &&
                "border-primary/30 text-primary",
              recentRun.status === "failed" &&
                "border-destructive/30 text-destructive"
            )}
          >
            {recentRun.status === "completed" && (
              <CheckCircle2 className="h-3 w-3" />
            )}
            {recentRun.status === "running" && (
              <Clock className="h-3 w-3 animate-pulse" />
            )}
            {recentRun.status === "failed" && (
              <AlertCircle className="h-3 w-3" />
            )}
            <span className="hidden md:inline">{recentRun.timestamp}</span>
          </Badge>
        )}
      </div>
    </header>
  )
}
