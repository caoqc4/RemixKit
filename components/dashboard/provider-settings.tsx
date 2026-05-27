"use client"

import {
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Key,
  Eye,
  EyeOff,
  SlidersHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import type { DashboardLanguage } from "@/components/dashboard/i18n"
import { text } from "@/components/dashboard/i18n"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ProviderConfig {
  id: string
  name: string
  category: "aggregator" | "official" | "analysis" | "video" | "storage" | "transcription"
  configured: boolean
  apiKeyPlaceholder?: string
  docsUrl?: string
  description?: string
}

type ModelOption = {
  id: string
  name: string
  provider?: string
  configured?: boolean
  tags?: string[]
  status?: "ready" | "beta" | "new"
}

interface ProviderSettingsProps {
  providers: ProviderConfig[]
  onSaveKey: (providerId: string, key: string) => void
  language: DashboardLanguage
  analysisModels: ModelOption[]
  videoProviders: ModelOption[]
  analysisModel: string
  videoProvider: string
  onAnalysisModelChange: (model: string) => void
  onVideoProviderChange: (provider: string) => void
  keyStorageMode?: "server" | "browser"
}

export function ProviderSettings({
  providers,
  onSaveKey,
  language,
  analysisModels,
  videoProviders,
  analysisModel,
  videoProvider,
  onAnalysisModelChange,
  onVideoProviderChange,
  keyStorageMode = "server",
}: ProviderSettingsProps) {
  const [editingProvider, setEditingProvider] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState("")
  const [showKey, setShowKey] = useState(false)
  const t = text[language]
  const categoryLabels: Record<string, string> = {
    aggregator: t.categoryAggregator,
    official: t.categoryOfficial,
    analysis: t.categoryAnalysis,
    video: t.categoryVideo,
    storage: t.categoryStorage,
    transcription: t.categoryTranscription,
  }

  const groupedProviders = providers.reduce(
    (acc, provider) => {
      if (!acc[provider.category]) {
        acc[provider.category] = []
      }
      acc[provider.category].push(provider)
      return acc
    },
    {} as Record<string, ProviderConfig[]>
  )

  const handleSave = (providerId: string) => {
    if (apiKey.trim()) {
      onSaveKey(providerId, apiKey.trim())
      setEditingProvider(null)
      setApiKey("")
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card/50 p-4">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <SlidersHorizontal className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              {t.modelSelection}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {t.modelSelectionHelp}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <ModelSelect
            label={t.analysisModel}
            value={analysisModel}
            options={analysisModels}
            placeholder={t.selectAnalysisModel}
            missingText={t.needsConfig}
            onChange={onAnalysisModelChange}
          />
          <ModelSelect
            label={t.videoGeneration}
            value={videoProvider}
            options={videoProviders}
            placeholder={t.selectVideoProvider}
            missingText={t.needsConfig}
            onChange={onVideoProviderChange}
          />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card/50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <p className="text-sm text-muted-foreground">
            {keyStorageMode === "browser" ? t.browserKeyNotice : t.serverKeyNotice}
          </p>
        </div>
      </div>

      {Object.entries(groupedProviders).map(([category, categoryProviders]) => (
        <div key={category} className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">
            {categoryLabels[category] || category}
          </h3>
          <div className="space-y-2">
            {categoryProviders.map((provider) => (
              <div
                key={provider.id}
                className="rounded-lg border border-border bg-card/50 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {provider.name}
                      </span>
                      {provider.configured ? (
                        <Badge
                          variant="outline"
                          className="border-success/30 text-success"
                        >
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          {t.configured}
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-warning/30 text-warning"
                        >
                          <AlertCircle className="mr-1 h-3 w-3" />
                          {t.pendingConfig}
                        </Badge>
                      )}
                    </div>
                    {provider.description && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {provider.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {provider.docsUrl && (
                      <Button variant="ghost" size="sm" asChild>
                        <a
                          href={provider.docsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="gap-1.5"
                        >
                          {t.docsShort}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    )}
                    <Button
                      variant={provider.configured ? "ghost" : "outline"}
                      size="sm"
                      onClick={() => {
                        setEditingProvider(
                          editingProvider === provider.id ? null : provider.id
                        )
                        setApiKey("")
                        setShowKey(false)
                      }}
                    >
                      <Key className="mr-1.5 h-3.5 w-3.5" />
                      {provider.configured ? t.updateKey : t.addKey}
                    </Button>
                  </div>
                </div>

                {editingProvider === provider.id && (
                  <div className="mt-4 space-y-3 border-t border-border pt-4">
                    <div className="space-y-2">
                      <Label htmlFor={`key-${provider.id}`} className="text-sm">
                        {t.apiKey}
                      </Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            id={`key-${provider.id}`}
                            type={showKey ? "text" : "password"}
                            placeholder={
                              provider.apiKeyPlaceholder || "sk-..."
                            }
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowKey(!showKey)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showKey ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        <Button
                          onClick={() => handleSave(provider.id)}
                          disabled={!apiKey.trim()}
                          size="sm"
                        >
                          {t.save}
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t.keyNotice}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function ModelSelect({
  label,
  value,
  options,
  placeholder,
  missingText,
  onChange,
}: {
  label: string
  value: string
  options: ModelOption[]
  placeholder: string
  missingText: string
  onChange: (value: string) => void
}) {
  const selected = options.find((option) => option.id === value)

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="bg-muted/30">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              <div className="flex items-center gap-2">
                <span>{option.name}</span>
                {option.provider ? (
                  <span className="text-xs text-muted-foreground">
                    {option.provider}
                  </span>
                ) : null}
                {!option.configured ? (
                  <span className="rounded px-1 py-0.5 text-[10px] font-medium uppercase bg-warning/10 text-warning">
                    {missingText}
                  </span>
                ) : null}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selected?.tags?.length ? (
        <div className="flex flex-wrap gap-1">
          {selected.tags.map((tag) => (
            <span
              key={tag}
              className="rounded border border-border bg-muted/30 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}
