'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ParameterSlider } from '@/components/ParameterSlider'
import { SLIDER_CONFIGS, API_DEFAULTS } from '@/lib/types'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Settings2, RotateCcw, Layers, Image, FileText, Zap, Check, Sparkles, Search } from 'lucide-react'

export type SearchType = 'similarity' | 'image_search' | 'analyze'

export interface SearchParams {
  similarity_threshold: number
  max_results: number
  use_chunks: boolean
  searchType: SearchType
}

export const defaultSearchParams: SearchParams = {
  similarity_threshold: API_DEFAULTS.similarity_threshold,
  max_results: API_DEFAULTS.max_results,
  use_chunks: API_DEFAULTS.use_chunks,
  searchType: 'similarity',
}

interface SearchSettingsModalProps {
  params: SearchParams
  onParamsChange: (params: SearchParams) => void
  mode: 'text' | 'image'
  disabled?: boolean
}

export function SearchSettingsModal({
  params,
  onParamsChange,
  mode,
  disabled = false,
}: SearchSettingsModalProps) {
  const [open, setOpen] = useState(false)
  const [localParams, setLocalParams] = useState<SearchParams>(params)

  // Sync local params when dialog opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setLocalParams(params)
    }
    setOpen(isOpen)
  }

  const handleReset = useCallback(() => {
    setLocalParams({
      ...defaultSearchParams,
      searchType: mode === 'text' ? 'similarity' : 'image_search',
    })
  }, [mode])

  const handleApply = useCallback(() => {
    onParamsChange(localParams)
    setOpen(false)
  }, [localParams, onParamsChange])

  const updateParam = useCallback(
    <K extends keyof SearchParams>(key: K, value: SearchParams[K]) => {
      setLocalParams((prev) => ({
        ...prev,
        [key]: value,
      }))
    },
    []
  )

  const hasChanges =
    localParams.similarity_threshold !== defaultSearchParams.similarity_threshold ||
    localParams.max_results !== defaultSearchParams.max_results ||
    localParams.use_chunks !== defaultSearchParams.use_chunks ||
    localParams.searchType !== (mode === 'text' ? 'similarity' : 'image_search')

  // Get available search types based on mode
  const getSearchTypeOptions = () => {
    if (mode === 'text') {
      return [
        { value: 'similarity', label: 'Busca por Similaridade', icon: Search, description: 'Encontra patentes similares ao texto' },
        { value: 'analyze', label: 'Análise com IA', icon: Sparkles, description: 'Analisa o texto com inteligência artificial' },
      ]
    } else {
      return [
        { value: 'image_search', label: 'Busca por Imagem', icon: Image, description: 'Encontra patentes com imagens similares' },
      ]
    }
  }

  const searchTypeOptions = getSearchTypeOptions()
  const currentSearchType = localParams.searchType
  const showSimilaritySettings = currentSearchType === 'similarity' || currentSearchType === 'image_search'

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          disabled={disabled}
          className="shrink-0 relative h-14 w-14 rounded-2xl border-border/40 bg-card/50 backdrop-blur-sm hover:bg-secondary/50 shadow-soft"
          title="Configurações Avançadas"
        >
          <Settings2 className="w-5 h-5 text-muted-foreground" />
          {/* Badge indicator when settings are modified */}
          {hasChanges && (
            <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-primary rounded-full shadow-glow" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-primary" />
            Configurações Avançadas
          </DialogTitle>
          <DialogDescription>
            Configure o tipo de operação e os parâmetros de busca.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Search Type Selector */}
          <div className="p-4 rounded-lg bg-secondary/30 border border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Tipo de Operação</span>
            </div>
            <Select
              value={localParams.searchType}
              onValueChange={(value: SearchType) => updateParam('searchType', value)}
              disabled={disabled}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o tipo de operação" />
              </SelectTrigger>
              <SelectContent>
                {searchTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <option.icon className="w-4 h-4" />
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              {searchTypeOptions.find(opt => opt.value === localParams.searchType)?.description}
            </p>
          </div>

          {/* Route Information */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 rounded-lg p-3">
            {currentSearchType === 'similarity' ? (
              <>
                <FileText className="w-4 h-4" />
                <span>
                  Rotas: <code className="bg-secondary px-1 rounded font-mono">/embed</code> → <code className="bg-secondary px-1 rounded font-mono">/search/by-text</code>
                </span>
              </>
            ) : currentSearchType === 'image_search' ? (
              <>
                <Image className="w-4 h-4" />
                <span>
                  Rota: <code className="bg-secondary px-1 rounded font-mono">/images/search</code>
                </span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>
                  Rota: <code className="bg-secondary px-1 rounded font-mono">/analyze</code>
                </span>
              </>
            )}
          </div>

          {/* Similarity Settings - Only show for similarity searches */}
          {showSimilaritySettings && (
            <>
              {/* Similarity Threshold Slider */}
              <div className="p-4 rounded-lg bg-secondary/30 border border-border/50">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium text-foreground">Parâmetros de Similaridade</span>
                </div>
                <ParameterSlider
                  config={SLIDER_CONFIGS.similarity_threshold}
                  value={localParams.similarity_threshold}
                  onChange={(value) => updateParam('similarity_threshold', value)}
                  disabled={disabled}
                />
              </div>

              {/* Max Results Slider */}
              <div className="p-4 rounded-lg bg-secondary/30 border border-border/50">
                <div className="flex items-center gap-2 mb-4">
                  <Layers className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-foreground">Limite de Resultados</span>
                </div>
                <ParameterSlider
                  config={SLIDER_CONFIGS.max_results}
                  value={localParams.max_results}
                  onChange={(value) => updateParam('max_results', value)}
                  disabled={disabled}
                />
              </div>

              {/* Use Chunks Toggle - Only for text mode */}
              {mode === 'text' && currentSearchType === 'similarity' && (
                <div className="p-4 rounded-lg bg-secondary/30 border border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-purple-500" />
                        <Label
                          htmlFor="use-chunks-modal"
                          className="text-sm font-medium cursor-pointer"
                        >
                          Buscar por Chunks
                        </Label>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Quando ativado, compara o texto com cada chunk das patentes ao invés do embedding completo.
                      </p>
                    </div>
                    <Switch
                      id="use-chunks-modal"
                      checked={localParams.use_chunks}
                      onCheckedChange={(checked) => updateParam('use_chunks', checked)}
                      disabled={disabled}
                      className="ml-4"
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {hasChanges && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={disabled}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Resetar
            </Button>
          )}
          <div className="flex-1" />
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleApply}
            disabled={disabled}
            className="gap-2"
          >
            <Check className="w-4 h-4" />
            Aplicar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
