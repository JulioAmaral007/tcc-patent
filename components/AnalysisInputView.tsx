'use client'

import { FileText, Trash2, Upload, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TextInputArea } from '@/components/TextInputArea'
import { UploadArea } from '@/components/UploadArea'
import { ImagePreview } from '@/components/ImagePreview'
import {
  SearchSettingsModal,
  type SearchParams,
} from '@/components/SearchSettingsModal'
import { ProcessingProgress } from '@/components/ProcessingProgress'
import { ErrorBox } from '@/components/ErrorBox'

interface AnalysisInputViewProps {
  activeTab: string
  onTabChange: (tab: string) => void
  textInput: string
  onTextInputChange: (val: string) => void
  isProcessing: boolean
  selectedFile: File | null
  onFileSelect: (file: File) => void
  onClearFile: () => void
  hasContent: boolean
  onClearAll: () => void
  searchParams: SearchParams
  onSearchParamsChange: (params: SearchParams) => void
  onSubmit: () => void
  processingStage: 'api' | 'similarity' | null
  error: string | null
  onDismissError: () => void
}

export function AnalysisInputView({
  activeTab,
  onTabChange,
  textInput,
  onTextInputChange,
  isProcessing,
  selectedFile,
  onFileSelect,
  onClearFile,
  hasContent,
  onClearAll,
  searchParams,
  onSearchParamsChange,
  onSubmit,
  processingStage,
  error,
  onDismissError,
}: AnalysisInputViewProps) {
  return (
    <div className="flex-1 overflow-y-auto flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-2xl space-y-6 animate-fade-in">
        {/* Main Input Card */}
        <div className="glass-effect rounded-2xl p-4 sm:p-6 card-glow relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">
                Data Input
              </h2>
            </div>
            {hasContent && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                className="text-muted-foreground hover:text-destructive rounded-xl h-8 px-3"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          <Tabs
            value={activeTab}
            onValueChange={onTabChange}
            className="w-full space-y-6"
          >
            <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/50 rounded-xl h-11">
              <TabsTrigger
                value="text"
                className="flex items-center justify-center w-full h-full gap-2 rounded-lg data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:glow-primary data-[state=active]:shadow-md transition-all duration-200"
              >
                <FileText className="w-4 h-4" />
                Text
              </TabsTrigger>
              <TabsTrigger
                value="image"
                className="flex items-center justify-center w-full h-full gap-2 rounded-lg data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:glow-primary data-[state=active]:shadow-md transition-all duration-200"
              >
                <Upload className="w-4 h-4" />
                Upload
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="mt-0 outline-none">
              <TextInputArea
                value={textInput}
                onChange={onTextInputChange}
                disabled={isProcessing}
                placeholder="Paste or type the patent text here..."
              />
            </TabsContent>

            <TabsContent value="image" className="mt-0 space-y-4 outline-none">
              <UploadArea
                onFileSelect={onFileSelect}
                selectedFile={selectedFile}
                onClearFile={onClearFile}
                isProcessing={isProcessing}
              />

              <ImagePreview file={selectedFile} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Single Submit Button */}
        <div className="flex items-center gap-3">
          <SearchSettingsModal
            params={searchParams}
            onParamsChange={onSearchParamsChange}
            mode={activeTab === 'text' ? 'text' : 'image'}
            disabled={isProcessing}
          />
          <Button
            onClick={onSubmit}
            disabled={
              isProcessing ||
              (activeTab === 'text' ? !textInput.trim() : !selectedFile)
            }
            className="flex-1 h-14 rounded-xl gradient-primary text-primary-foreground text-lg font-semibold hover:opacity-90 transition-all glow-primary disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isProcessing ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>
                  {activeTab === 'text' ? 'Search Similar' : 'Search by Image'}
                </span>
              </div>
            )}
          </Button>
        </div>

        {/* Progress & Error */}
        <ProcessingProgress stage={processingStage} />

        {error && (
          <ErrorBox
            message={error}
            onDismiss={onDismissError}
            onRetry={onSubmit}
          />
        )}
      </div>
    </div>
  )
}
