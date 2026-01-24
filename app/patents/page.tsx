'use client'

import React, { useCallback, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Search
} from 'lucide-react'
import { Header } from '@/components/Header'
import { Sidebar } from '@/components/Sidebar'
import { Footer } from '@/components/Footer'
import { listPatentsAction } from '@/app/_actions/patent-actions'
import { ListPatentsResponse, Patent } from '@/lib/types'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function PatentsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<ListPatentsResponse | null>(null)
  
  // Params
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortBy, setSortBy] = useState('publication_date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [expandedPatents, setExpandedPatents] = useState<Set<string>>(new Set())

  // Sidebar state
  const [sidebarTab, setSidebarTab] = useState('patents')

  const fetchPatents = useCallback(async () => {
    setLoading(true)
    try {
      const response = await listPatentsAction({
        page,
        page_size: pageSize,
        sort_by: sortBy,
        sort_order: sortOrder
      })
      setData(response)
    } catch (error) {
      console.error('Error fetching patents:', error)
      toast.error('Error loading patents', {
        description: 'Could not fetch the patent list.'
      })
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, sortBy, sortOrder])

  useEffect(() => {
    fetchPatents()
  }, [fetchPatents])

  const handleSidebarTabChange = (tab: string) => {
    if (tab === 'main') {
      router.push('/')
    } else if (tab === 'patents') {
      // Do nothing, already here
    } else {
      toast.info('Redirecting to the main page to view history.')
      router.push('/')
    }
  }

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedPatents)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedPatents(newExpanded)
  }

  // Helper to handle sort clicks on headers
  const handleHeaderClick = (column: string) => {
    if (sortBy === column) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc') // Default to desc for new columns
    }
  }

  const SortIcon = ({ column }: { column: string }) => {
    if (sortBy !== column) return <span className="w-4 h-4 inline-block" /> // spacer
    return sortOrder === 'asc' ? <ChevronUp className="w-4 h-4 ml-1 inline-block" /> : <ChevronDown className="w-4 h-4 ml-1 inline-block" />
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar activeTab={sidebarTab} onTabChange={handleSidebarTabChange} />
      <Header />

      <main className="pt-16 pb-16 md:pb-0 md:pl-16 min-h-screen flex flex-col">
        <div className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 animate-fade-in">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                Registered Patents
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
                View and manage the patents indexed in the system
              </p>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col">
            {/* Toolbar */}
            <div className="p-3 sm:p-4 border-b border-border flex flex-wrap items-center justify-between gap-4 bg-muted/30">
              <div className="flex items-center gap-2">
                 {/* Page Size Selector */}
                 <span className="text-xs sm:text-sm font-medium">Items per page:</span>
                <Select value={pageSize.toString()} onValueChange={(val) => {
                  setPageSize(Number(val))
                  setPage(1) // Reset to first page
                }}>
                  <SelectTrigger className="w-[70px] sm:w-[80px] h-8 sm:h-10 bg-background text-xs sm:text-sm">
                    <SelectValue placeholder="10" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Table Content */}
            <div className="relative overflow-x-auto scrollbar-custom">
              {loading ? (
                <div className="p-12 flex flex-col items-center justify-center text-muted-foreground space-y-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="text-sm">Loading patents...</p>
                </div>
              ) : !data || data.patents.length === 0 ? (
                <div className="p-12 flex flex-col items-center justify-center text-muted-foreground">
                  <Search className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-sm">No patents found.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px] sm:w-[50px]"></TableHead>
                      <TableHead 
                        className="cursor-pointer hover:text-foreground transition-colors text-xs sm:text-sm"
                        onClick={() => handleHeaderClick('title')}
                      >
                        Title <SortIcon column="title" />
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:text-foreground transition-colors text-xs sm:text-sm"
                        onClick={() => handleHeaderClick('publication_number')}
                      >
                        Pub. Number <SortIcon column="publication_number" />
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:text-foreground transition-colors text-xs sm:text-sm hidden md:table-cell"
                        onClick={() => handleHeaderClick('publication_date')}
                      >
                        Date <SortIcon column="publication_date" />
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:text-foreground transition-colors text-xs sm:text-sm hidden lg:table-cell"
                        onClick={() => handleHeaderClick('orgname')}
                      >
                         Organization <SortIcon column="orgname" />
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.patents.map((patent) => (
                      <React.Fragment key={patent.publication_number}>
                        <TableRow 
                          className={cn(
                            "cursor-pointer transition-colors",
                            expandedPatents.has(patent.publication_number) ? "bg-muted/50" : "hover:bg-muted/30"
                          )}
                          onClick={() => toggleExpand(patent.publication_number)}
                        >
                          <TableCell className="py-3">
                            {expandedPatents.has(patent.publication_number) ? (
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            )}
                          </TableCell>
                          <TableCell className="font-medium py-3">
                            <div className="line-clamp-2 text-xs sm:text-sm" title={patent.title}>
                              {patent.title || "No title"}
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap font-mono text-[10px] sm:text-xs py-3">
                             {patent.publication_number}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-muted-foreground text-[10px] sm:text-xs py-3 hidden md:table-cell">
                             {patent.publication_date || "N/A"}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-muted-foreground text-[10px] sm:text-xs py-3 hidden lg:table-cell max-w-[200px] truncate" title={patent.orgname}>
                             {patent.orgname || "N/A"}
                          </TableCell>
                        </TableRow>
                        
                        {/* Expandable Row Details */}
                        {expandedPatents.has(patent.publication_number) && (
                          <TableRow className="hover:bg-transparent bg-muted/20 border-t-0">
                            <TableCell colSpan={5} className="p-0 border-t-0">
                               <div className="p-4 sm:p-6 pl-8 sm:pl-14 grid gap-4 animate-in slide-in-from-top-2 duration-200">
                                  <div>
                                    <h4 className="font-semibold text-xs sm:text-sm mb-1 text-foreground">Abstract</h4>
                                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                      {patent.abstract || "No abstract available."}
                                    </p>
                                  </div>
                                  
                                  {patent.ipc_codes && patent.ipc_codes.length > 0 && (
                                    <div>
                                      <h4 className="font-semibold text-xs sm:text-sm mb-1 text-foreground">IPC Codes</h4>
                                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                        {patent.ipc_codes.map(code => (
                                          <span key={code} className="px-1.5 sm:px-2 py-0.5 rounded-full bg-background border border-border text-[10px] sm:text-xs font-medium font-mono text-muted-foreground">
                                            {code}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  <div className="flex flex-col sm:flex-row sm:gap-4 gap-2 text-[10px] sm:text-xs text-muted-foreground mt-2">
                                     <span className="flex items-center gap-1">
                                        <span className="font-semibold">App Number:</span> {patent.application_number || 'N/A'}
                                     </span>
                                     <span className="flex items-center gap-1">
                                        <span className="font-semibold">Main Group:</span> {patent.maingroup || 'N/A'}
                                     </span>
                                      <span className="flex items-center gap-1">
                                        <span className="font-semibold">SubGroup:</span> {patent.subgroup || 'N/A'}
                                     </span>
                                  </div>
                               </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            {/* Pagination Footer */}
            {data && (
               <div className="p-3 sm:p-4 border-t border-border flex flex-col lg:flex-row items-center justify-between gap-4 bg-muted/30">
                 <div className="text-[10px] sm:text-sm text-muted-foreground text-center lg:text-left">
                   Showing <span className="font-medium text-foreground">{((page - 1) * pageSize) + 1}</span> to <span className="font-medium text-foreground">{Math.min(page * pageSize, data.total_count)}</span> of <span className="font-medium text-foreground">{data.total_count}</span> results
                 </div>

                 <div className="flex items-center gap-1.5 sm:gap-2">
                   <Button
                     variant="outline"
                     size="icon"
                     className="h-8 w-8 sm:h-10 sm:w-10"
                     onClick={() => setPage(1)}
                     disabled={!data.has_previous}
                     title="First page"
                   >
                     <ChevronsLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                   </Button>
                   <Button
                     variant="outline"
                     size="icon"
                     className="h-8 w-8 sm:h-10 sm:w-10"
                     onClick={() => setPage(p => Math.max(1, p - 1))}
                     disabled={!data.has_previous}
                     title="Previous page"
                   >
                     <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                   </Button>
                   
                   <div className="flex items-center justify-center min-w-[100px] sm:min-w-[140px] text-[11px] sm:text-sm font-medium bg-background border border-border rounded-lg h-8 sm:h-10 px-2 sm:px-4">
                     Page <span className="text-primary mx-1">{data.page}</span> of {data.total_pages}
                   </div>
                   
                   <Button
                     variant="outline"
                     size="icon"
                     className="h-8 w-8 sm:h-10 sm:w-10"
                     onClick={() => setPage(p => Math.min(data.total_pages, p + 1))}
                     disabled={!data.has_next}
                     title="Next page"
                   >
                     <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                   </Button>
                   <Button
                     variant="outline"
                     size="icon"
                     className="h-8 w-8 sm:h-10 sm:w-10"
                     onClick={() => setPage(data.total_pages)}
                     disabled={!data.has_next}
                     title="Last page"
                   >
                     <ChevronsRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                   </Button>
                 </div>
               </div>
            )}
          </div>
        </div>
        
        <Footer />
      </main>
    </div>
  )
}

