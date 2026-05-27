"use client"

import { cn } from "@/lib/utils"
import { Sparkles, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { DashboardLanguage } from "@/components/dashboard/i18n"
import { text } from "@/components/dashboard/i18n"

interface RemixBriefProps {
  brief: string
  onBriefChange: (brief: string) => void
  analysisModel: string
  onAnalysisModelChange: (model: string) => void
  videoProvider: string
  onVideoProviderChange: (provider: string) => void
  onStartRemix: () => void
  isRunning: boolean
  canStart: boolean
  analysisModels?: {
    id: string
    name: string
    provider?: string
  }[]
  videoProviders?: {
    id: string
    name: string
    status?: "ready" | "beta" | "new"
  }[]
  language: DashboardLanguage
}

const defaultAnalysisModels = [
  { id: "gpt-4-vision", name: "GPT-4 Vision", provider: "OpenAI" },
  { id: "claude-3-opus", name: "Claude 3 Opus", provider: "Anthropic" },
  { id: "gemini-pro-vision", name: "Gemini Pro Vision", provider: "Google" },
]

const defaultVideoProviders: NonNullable<RemixBriefProps["videoProviders"]> = [
  { id: "runway", name: "Runway Gen-3", status: "ready" },
  { id: "pika", name: "Pika Labs", status: "ready" },
  { id: "kling", name: "Kling AI", status: "beta" },
  { id: "minimax", name: "MiniMax Video", status: "new" },
]

export function RemixBrief({
  brief,
  onBriefChange,
  analysisModel,
  onAnalysisModelChange,
  videoProvider,
  onVideoProviderChange,
  onStartRemix,
  isRunning,
  canStart,
  analysisModels = defaultAnalysisModels,
  videoProviders = defaultVideoProviders,
  language,
}: RemixBriefProps) {
  const t = text[language]

  return (
    <div className="space-y-4">
      {/* Creative Goal */}
      <div className="space-y-2">
        <Label
          htmlFor="brief"
          className="text-sm font-medium text-foreground"
        >
          {t.creativeGoal}
        </Label>
        <Textarea
          id="brief"
          placeholder={t.briefPlaceholder}
          value={brief}
          onChange={(e) => onBriefChange(e.target.value)}
          className="min-h-[100px] resize-none bg-muted/30"
        />
        <p className="text-xs text-muted-foreground">
          {t.briefHelp}
        </p>
      </div>

      {/* Model Selectors */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">
            {t.analysisModel}
          </Label>
          <Select value={analysisModel} onValueChange={onAnalysisModelChange}>
            <SelectTrigger className="bg-muted/30">
              <SelectValue placeholder={t.selectAnalysisModel} />
            </SelectTrigger>
            <SelectContent>
              {analysisModels.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex items-center gap-2">
                    <span>{model.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {model.provider}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">
            {t.videoGeneration}
          </Label>
          <Select value={videoProvider} onValueChange={onVideoProviderChange}>
            <SelectTrigger className="bg-muted/30">
              <SelectValue placeholder={t.selectVideoProvider} />
            </SelectTrigger>
            <SelectContent>
              {videoProviders.map((provider) => (
                <SelectItem key={provider.id} value={provider.id}>
                  <div className="flex items-center gap-2">
                    <span>{provider.name}</span>
                    {provider.status && provider.status !== "ready" && (
                      <span
                        className={cn(
                          "rounded px-1 py-0.5 text-[10px] font-medium uppercase",
                          provider.status === "beta" &&
                            "bg-warning/10 text-warning",
                          provider.status === "new" &&
                            "bg-primary/10 text-primary"
                        )}
                      >
                        {provider.status}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Start Button */}
      <Button
        onClick={onStartRemix}
        disabled={!canStart || isRunning}
        className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        size="lg"
      >
        {isRunning ? (
          <>
            <Sparkles className="h-4 w-4 animate-pulse" />
            {t.processing}
          </>
        ) : (
          <>
            <Play className="h-4 w-4" />
            {t.startRemix}
          </>
        )}
      </Button>
    </div>
  )
}
