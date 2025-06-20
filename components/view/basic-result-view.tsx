import { RESULT_FILTERS } from '@/app/data/settings'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BasicLinkStatus } from '@/type/link'
import {
  AlertCircle,
  ArrowUpRight,
  Check,
  CheckCircle,
  Copy,
  Loader2,
  Search
} from 'lucide-react'
import { useState } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '../ui/tooltip'

export interface BasicResultViewState {
  workingCount: number
  brokenCount: number
  loading: boolean
  progress: number
  results: BasicLinkStatus[]
  onQuickAdvancedCheck: (url: string) => void
}

interface ResultViewProps {
  state: BasicResultViewState
}

export default function ResultView({ state }: ResultViewProps) {
  const {
    workingCount,
    brokenCount,
    loading,
    progress,
    results,
    onQuickAdvancedCheck
  } = state

  const [resultFilter, setResultFilter] = useState('all')
  const [copied, setCopied] = useState(false)

  const filteredResults =
    resultFilter === 'all'
      ? results
      : resultFilter === 'working'
        ? results.filter((r) => r.ok)
        : results.filter((r) => !r.ok)

  const currentFilterLabel =
    RESULT_FILTERS.find((f) => f.value === resultFilter)?.label || 'All'

  const handleCopyUrls = async () => {
    try {
      const filteredUrls = filteredResults.map((r) => r.url).join('\n')
      await navigator.clipboard.writeText(filteredUrls)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="rounded border bg-white p-4 shadow">
        <div className="mb-4 flex flex-wrap gap-2">
          <Badge
            variant="outline"
            className="border-green-500 px-2 py-1 text-xs sm:px-3 sm:text-sm"
          >
            <CheckCircle className="mr-1 h-3 w-3" />
            Working: {workingCount}
          </Badge>
          <Badge
            variant="outline"
            className="border-red-500 px-2 py-1 text-xs sm:px-3 sm:text-sm"
          >
            <AlertCircle className="mr-1 h-3 w-3" />
            Broken: {brokenCount}
          </Badge>
        </div>
        {loading && (
          <div className="mb-2">
            <div className="mb-1 text-sm text-muted-foreground">
              Progress: {Math.round(progress)}%
            </div>
            <Progress value={progress} />
          </div>
        )}

        <Tabs
          value={resultFilter}
          onValueChange={setResultFilter}
          className="mb-4"
        >
          <TabsList className="grid w-full grid-cols-3">
            {RESULT_FILTERS.map((filter) => (
              <TabsTrigger key={filter.value} value={filter.value}>
                {filter.icon}
                {filter.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50%] min-w-[200px]">URL</TableHead>
                <TableHead className="w-[15%]">Status</TableHead>
                <TableHead className="w-[15%]">Result</TableHead>
                <TableHead className="w-[20%]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResults.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-4 text-center text-muted-foreground"
                  >
                    No results
                  </TableCell>
                </TableRow>
              ) : (
                filteredResults.map((link, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="break-all font-mono text-xs">
                      <div className="flex items-start gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-1">
                            <span className="line-clamp-2">{link.url}</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <a
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-muted-foreground hover:text-primary"
                                  >
                                    <ArrowUpRight className="h-3.5 w-3.5 flex-shrink-0" />
                                  </a>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Open link in new tab</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          {link.text && link.text !== link.url && (
                            <div className="mt-1 font-sans text-muted-foreground">
                              {link.text.length > 50
                                ? link.text.substring(0, 50) + '...'
                                : link.text}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {loading ? (
                        <span className="flex items-center gap-1 text-gray-500">
                          <Loader2 className="h-4 w-4 animate-spin" />{' '}
                          Checking...
                        </span>
                      ) : typeof link.status === 'number' ? (
                        <span>{link.status}</span>
                      ) : (
                        <span>None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {loading ? (
                        <span className="flex items-center gap-1 text-gray-500">
                          <Loader2 className="h-4 w-4 animate-spin" />{' '}
                          Checking...
                        </span>
                      ) : link.ok ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-4 w-4" /> Working
                        </span>
                      ) : (
                        <>
                          {link.error && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="flex cursor-pointer items-center gap-1 text-red-600">
                                    <AlertCircle className="h-4 w-4" /> Broken
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{link.error}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onQuickAdvancedCheck(link.url)}
                      >
                        <Search className="mr-1 h-4 w-4" />
                        Advanced Check
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mb-4 flex items-center justify-between py-4">
          Showing {filteredResults.length} URLs ({currentFilterLabel})
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopyUrls}
            disabled={filteredResults.length === 0}
            className="flex items-center gap-2"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-600" />
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        <div className="rounded border bg-gray-50 p-3">
          {filteredResults.length === 0 ? (
            <div className="py-2 text-center text-muted-foreground">
              No results
            </div>
          ) : (
            <pre className="overflow-y-auto whitespace-pre-wrap break-all font-mono text-xs">
              {filteredResults.map((r) => r.url).join('\n')}
            </pre>
          )}
        </div>
      </div>
    </div>
  )
}
