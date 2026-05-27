"use client"

import { cn } from "@/lib/utils"
import {
  Upload,
  Search,
  FileText,
  Layers,
  Wand2,
  Download,
  CheckCircle2,
  Circle,
  Loader2,
  AlertCircle,
} from "lucide-react"

type StageStatus = "pending" | "active" | "completed" | "error"

interface PipelineStage {
  id: string
  label: string
  icon: React.ElementType
  status: StageStatus
  detail?: string
}

interface PipelineBoardProps {
  stages: PipelineStage[]
  currentStage?: string
}

const defaultStages: PipelineStage[] = [
  { id: "intake", label: "素材导入", icon: Upload, status: "pending" },
  { id: "evidence", label: "证据提取", icon: Search, status: "pending" },
  { id: "creative-read", label: "创意解读", icon: FileText, status: "pending" },
  { id: "variant-plan", label: "变体规划", icon: Layers, status: "pending" },
  { id: "generation", label: "视频生成", icon: Wand2, status: "pending" },
  { id: "output", label: "输出交付", icon: Download, status: "pending" },
]

function getStatusIcon(status: StageStatus) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-4 w-4 text-success" />
    case "active":
      return <Loader2 className="h-4 w-4 animate-spin text-primary" />
    case "error":
      return <AlertCircle className="h-4 w-4 text-destructive" />
    default:
      return <Circle className="h-4 w-4 text-muted-foreground/40" />
  }
}

export function PipelineBoard({
  stages = defaultStages,
  currentStage,
}: PipelineBoardProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-foreground">工作流程</h3>
      <div className="relative">
        {/* Progress line */}
        <div className="absolute left-[19px] top-0 h-full w-px bg-border" />

        {/* Stages */}
        <div className="relative space-y-1">
          {stages.map((stage, index) => {
            const Icon = stage.icon
            const isActive = stage.status === "active"
            const isCompleted = stage.status === "completed"

            return (
              <div
                key={stage.id}
                className={cn(
                  "flex items-center gap-3 rounded-md px-2 py-2 transition-colors",
                  isActive && "bg-primary/5",
                  isCompleted && "opacity-70"
                )}
              >
                {/* Status indicator */}
                <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-md bg-card border border-border">
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      isActive && "text-primary",
                      isCompleted && "text-success",
                      !isActive && !isCompleted && "text-muted-foreground"
                    )}
                  />
                </div>

                {/* Label and status */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isActive && "text-primary",
                        isCompleted && "text-foreground",
                        !isActive && !isCompleted && "text-muted-foreground"
                      )}
                    >
                      {stage.label}
                    </span>
                    {getStatusIcon(stage.status)}
                  </div>
                  {stage.detail && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {stage.detail}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export { defaultStages }
export type { PipelineStage, StageStatus }
