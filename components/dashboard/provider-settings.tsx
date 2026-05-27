"use client"

import { cn } from "@/lib/utils"
import {
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Key,
  Eye,
  EyeOff,
  Copy,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"

interface ProviderConfig {
  id: string
  name: string
  category: "analysis" | "video" | "storage" | "transcription"
  configured: boolean
  apiKeyPlaceholder?: string
  docsUrl?: string
  description?: string
}

interface ProviderSettingsProps {
  providers: ProviderConfig[]
  onSaveKey: (providerId: string, key: string) => void
}

const categoryLabels: Record<string, string> = {
  analysis: "分析模型",
  video: "视频生成",
  storage: "存储服务",
  transcription: "转写服务",
}

export function ProviderSettings({
  providers,
  onSaveKey,
}: ProviderSettingsProps) {
  const [editingProvider, setEditingProvider] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState("")
  const [showKey, setShowKey] = useState(false)
  const [copied, setCopied] = useState(false)

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
                          已配置
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-warning/30 text-warning"
                        >
                          <AlertCircle className="mr-1 h-3 w-3" />
                          待配置
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
                          文档
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
                      {provider.configured ? "更新密钥" : "添加密钥"}
                    </Button>
                  </div>
                </div>

                {editingProvider === provider.id && (
                  <div className="mt-4 space-y-3 border-t border-border pt-4">
                    <div className="space-y-2">
                      <Label htmlFor={`key-${provider.id}`} className="text-sm">
                        API 密钥
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
                          保存
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      密钥会保存到 RemixKit 本地开发配置；托管环境请使用环境变量。
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
