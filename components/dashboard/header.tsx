"use client"

import { cn } from "@/lib/utils"
import {
  HardDrive,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronDown,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
}

export function Header({
  storageMode,
  onStorageModeChange,
  providerStatus,
  recentRun,
}: HeaderProps) {
  const allProvidersReady = providerStatus.analysis && providerStatus.video

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
      {/* Left: Context */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <h1 className="text-sm font-semibold text-foreground">工作台</h1>
          <p className="text-xs text-muted-foreground">AI 视频广告混剪工作流</p>
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
                {storageMode === "local" ? "本地存储" : "云存储"}
              </span>
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onStorageModeChange("local")}>
              <HardDrive className="mr-2 h-4 w-4" />
              本地存储
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStorageModeChange("cloud")}>
              <Cloud className="mr-2 h-4 w-4" />
              云存储
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
              {allProvidersReady ? "服务就绪" : "需配置"}
            </span>
          </div>
        </div>

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
