import { RESULT_FILTERS, TABS } from '@/app/data/settings'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { DomainGroup, LinkStatus, LinkSummary, RssInfo } from '@/type/link'
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle,
  ExternalLink,
  Filter,
  LinkIcon,
  Loader2,
  Rss
} from 'lucide-react'

export interface AdvancedResultViewState {
  summary: LinkSummary | null
  workingCount: number
  brokenCount: number
  loading: boolean
  progress: number
  mainTab: string
  setMainTab: (tab: string) => void
  activeTab: string
  setActiveTab: (tab: string) => void
  resultFilter: string
  setResultFilter: (filter: string) => void
  selectedDomain: string
  setSelectedDomain: (domain: string) => void
  domainGroups: DomainGroup[]
  filteredResults: LinkStatus[]
  rssLinks: RssInfo[]
  links: any[]
}

interface ResultViewProps {
  state: AdvancedResultViewState
}

export default function ResultView({ state }: ResultViewProps) {
  const {
    summary,
    workingCount,
    brokenCount,
    loading,
    progress,
    mainTab,
    setMainTab,
    activeTab,
    setActiveTab,
    resultFilter,
    setResultFilter,
    selectedDomain,
    setSelectedDomain,
    domainGroups,
    filteredResults,
    rssLinks,
    links
  } = state

  return (
    <Card>
      <CardContent className="pt-6">
        {summary && (
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className="px-2 py-1 text-xs sm:px-3 sm:text-sm"
            >
              Total: {summary.total} links
            </Badge>
            <Badge
              variant="outline"
              className="border-blue-500 px-2 py-1 text-xs sm:px-3 sm:text-sm"
            >
              <LinkIcon className="mr-1 h-3 w-3" />
              Internal: {summary.internal}
            </Badge>
            <Badge
              variant="outline"
              className="border-orange-500 px-2 py-1 text-xs sm:px-3 sm:text-sm"
            >
              <ExternalLink className="mr-1 h-3 w-3" />
              External: {summary.external}
            </Badge>
            {workingCount > 0 && (
              <Badge
                variant="outline"
                className="border-green-500 px-2 py-1 text-xs sm:px-3 sm:text-sm"
              >
                <CheckCircle className="mr-1 h-3 w-3" />
                Working: {workingCount}
              </Badge>
            )}
            {brokenCount > 0 && (
              <Badge
                variant="outline"
                className="border-red-500 px-2 py-1 text-xs sm:px-3 sm:text-sm"
              >
                <AlertCircle className="mr-1 h-3 w-3" />
                Broken: {brokenCount}
              </Badge>
            )}
            {summary.rss > 0 && (
              <Badge
                variant="outline"
                className="border-green-500 px-2 py-1 text-xs sm:px-3 sm:text-sm"
              >
                <Rss className="mr-1 h-3 w-3" />
                RSS: {summary.rss}
              </Badge>
            )}
          </div>
        )}

        {loading && (
          <div className="mb-4">
            <div className="mb-2 text-sm text-muted-foreground">
              Progress: {Math.round(progress)}%
            </div>
            <Progress value={progress} />
          </div>
        )}

        <Tabs value={mainTab} onValueChange={setMainTab} className="mb-4">
          <TabsList>
            <TabsTrigger value="links">Website Links</TabsTrigger>
            <TabsTrigger value="domains" disabled={domainGroups.length === 0}>
              Domains{' '}
              <span className="hidden sm:inline">
                {domainGroups.length > 0 && `(${domainGroups.length})`}
              </span>
            </TabsTrigger>
            <TabsTrigger value="rss" disabled={rssLinks.length === 0}>
              RSS{' '}
              <span className="hidden sm:inline">
                Feeds {rssLinks.length > 0 && `(${rssLinks.length})`}
              </span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {mainTab === 'links' && (
          <>
            <div className="mb-4 flex flex-col gap-4 sm:flex-row">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full sm:flex-1"
              >
                <TabsList className="grid w-full grid-cols-3">
                  {TABS.map((tab) => (
                    <TabsTrigger key={tab.value} value={tab.value}>
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              <Tabs
                value={resultFilter}
                onValueChange={setResultFilter}
                className="w-full sm:flex-1"
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

              <div className="w-full sm:w-52">
                <Select
                  value={selectedDomain}
                  onValueChange={setSelectedDomain}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by domain" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">All Domains</SelectItem>
                      {domainGroups.map((group, index) => (
                        <SelectItem key={index} value={group.domain}>
                          {group.domain} ({group.count})
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%] min-w-[200px]">URL</TableHead>
                    <TableHead className="w-[15%]">Type</TableHead>
                    <TableHead className="w-[15%]">Status</TableHead>
                    <TableHead className="w-[30%]">Result</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="py-4 text-center text-muted-foreground"
                      >
                        No links found matching the current filters
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredResults.map((link, index) => (
                      <TableRow key={index}>
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
                          {link.isExternal ? (
                            <Badge
                              variant="outline"
                              className="border-orange-500 text-orange-600"
                            >
                              External
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-blue-500 text-blue-600"
                            >
                              Internal
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {link.checking ? 'Checking...' : link.status || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {link.checking ? (
                              <>
                                <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin" />
                                <span>Checking...</span>
                              </>
                            ) : link.ok ? (
                              <>
                                <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-500" />
                                <span className="text-green-500">Working</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-500" />
                                <span className="break-words text-red-500">
                                  {link.error || 'Broken'}
                                </span>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        {mainTab === 'rss' && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50%] min-w-[200px]">
                    RSS Feed URL
                  </TableHead>
                  <TableHead className="w-[25%]">Title</TableHead>
                  <TableHead className="w-[25%]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rssLinks.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="py-4 text-center text-muted-foreground"
                    >
                      No RSS feeds found
                    </TableCell>
                  </TableRow>
                ) : (
                  rssLinks.map((feed, index) => (
                    <TableRow key={index}>
                      <TableCell className="break-all font-mono text-xs">
                        <div className="flex items-start gap-2">
                          <Rss className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                          <div className="flex-1">
                            <div className="flex items-center gap-1">
                              <span>{feed.url}</span>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <a
                                      href={feed.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-muted-foreground hover:text-primary"
                                    >
                                      <ArrowUpRight className="h-3.5 w-3.5" />
                                    </a>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Open RSS feed in new tab</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {feed.feedInfo ? (
                          <div>
                            <div className="font-medium">
                              {feed.feedInfo.title}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {feed.feedInfo.itemCount} items
                            </div>
                          </div>
                        ) : (
                          feed.title
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {feed.checking ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Checking...</span>
                            </>
                          ) : feed.ok ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-green-500">
                                Valid RSS Feed
                              </span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              <span className="text-red-500">
                                {feed.error || 'Invalid Feed'}
                              </span>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {mainTab === 'domains' && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%] min-w-[150px]">
                    Domain
                  </TableHead>
                  <TableHead className="w-[20%]">Link Count</TableHead>
                  <TableHead className="w-[40%]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {domainGroups.map((group, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {group.domain}
                    </TableCell>
                    <TableCell>{group.count}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedDomain(group.domain)
                          setMainTab('links')
                        }}
                      >
                        <Filter className="mr-1 h-3.5 w-3.5" />
                        View Links
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
