"use client"

import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import {
  Upload,
  Link2,
  Video,
  X,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { DashboardLanguage } from "@/components/dashboard/i18n"
import { text } from "@/components/dashboard/i18n"

interface SourceIntakeProps {
  onSourceChange: (source: {
    type: "upload" | "url" | null
    file?: File
    url?: string
  }) => void
  source: {
    type: "upload" | "url" | null
    file?: File
    url?: string
  }
  language: DashboardLanguage
}

export function SourceIntake({ onSourceChange, source, language }: SourceIntakeProps) {
  const [dragActive, setDragActive] = useState(false)
  const [urlInput, setUrlInput] = useState("")
  const [inputMode, setInputMode] = useState<"upload" | "url">("upload")
  const t = text[language]

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0]
        if (file.type.startsWith("video/")) {
          onSourceChange({ type: "upload", file })
        }
      }
    },
    [onSourceChange]
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        onSourceChange({ type: "upload", file: e.target.files[0] })
      }
    },
    [onSourceChange]
  )

  const handleUrlSubmit = useCallback(() => {
    if (urlInput.trim()) {
      onSourceChange({ type: "url", url: urlInput.trim() })
    }
  }, [urlInput, onSourceChange])

  const clearSource = useCallback(() => {
    onSourceChange({ type: null })
    setUrlInput("")
  }, [onSourceChange])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-foreground">{t.source}</Label>
        <div className="flex rounded-md border border-border bg-muted/50 p-0.5">
          <button
            type="button"
            onClick={() => setInputMode("upload")}
            className={cn(
              "flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors",
              inputMode === "upload"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Upload className="h-3 w-3" />
            {t.upload}
          </button>
          <button
            type="button"
            onClick={() => setInputMode("url")}
            className={cn(
              "flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors",
              inputMode === "url"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Link2 className="h-3 w-3" />
            {t.link}
          </button>
        </div>
      </div>

      {source.type ? (
        <div className="flex items-center gap-3 rounded-md border border-border bg-muted/30 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
            <Video className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {source.type === "upload"
                ? source.file?.name
                : t.externalVideoLink}
            </p>
            <p className="text-xs text-muted-foreground">
              {source.type === "upload"
                ? `${((source.file?.size || 0) / 1024 / 1024).toFixed(1)} MB`
                : source.url}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            onClick={clearSource}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : inputMode === "upload" ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={cn(
            "relative flex flex-col items-center justify-center rounded-md border-2 border-dashed p-6 transition-colors",
            dragActive
              ? "border-primary bg-primary/5"
              : "border-border hover:border-muted-foreground/50"
          )}
        >
          <input
            type="file"
            accept="video/*"
            onChange={handleFileInput}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
          <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">
            {t.dropVideo}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t.supportedFormats}
          </p>
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            placeholder={t.pasteUrl}
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={handleUrlSubmit}
            disabled={!urlInput.trim()}
            size="sm"
            className="shrink-0"
          >
            {t.confirm}
          </Button>
        </div>
      )}

      {/* Legal notice */}
      <div className="flex items-start gap-2 rounded-md bg-warning/5 border border-warning/20 p-2.5">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
        <p className="text-xs text-muted-foreground">
          {t.legalNotice}
        </p>
      </div>
    </div>
  )
}
