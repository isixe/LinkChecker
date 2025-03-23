'use client'

import type React from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle,
  ExternalLink,
  Filter,
  Globe,
  Info,
  Link2,
  LinkIcon,
  Loader2,
  Rss,
  Search,
  Zap
} from 'lucide-react'
import { useState } from 'react'
import { FeatureCard } from './ui/feature-card'

export function LinkChecker() {
  const [url, setUrl] = useState('')
  const [links, setLinks] = useState<LinkInfo[]>([])
  const [results, setResults] = useState<LinkStatus[]>([])
  const [rssLinks, setRssLinks] = useState<RssInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [error, setError] = useState<{
    message: string
    details?: string
  } | null>(null)
  const [progress, setProgress] = useState(0)
  const [summary, setSummary] = useState<LinkSummary | null>(null)
  const [activeTab, setActiveTab] = useState('all')
  const [resultFilter, setResultFilter] = useState('all') // New state for result filtering
  const [mainTab, setMainTab] = useState('links')
  const [domainGroups, setDomainGroups] = useState<DomainGroup[]>([])
  const [selectedDomain, setSelectedDomain] = useState<string>('all')
  const [hasSearched, setHasSearched] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!url) return

    try {
      setLoading(true)
      setExtracting(true)
      setError(null)
      setLinks([])
      setResults([])
      setRssLinks([])
      setProgress(0)
      setSummary(null)
      setActiveTab('all')
      setResultFilter('all') // Reset result filter
      setMainTab('links')
      setDomainGroups([])
      setSelectedDomain('all')
      setHasSearched(true)

      // Validate URL format
      let urlToCheck = url
      const urlPattern = /^https?:\/\/\S+/
      if (!url.trim() || !urlPattern.test(url)) {
        setError({
          message: 'Invalid URL',
          details: 'Please enter a valid URL starting with http:// or https://'
        })
        return
      }

      // First, extract all links from the page
      const response = await fetch('/api/collect-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: urlToCheck })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to extract links', {
          cause: data.details
        })
      }

      if (data.links && data.links.length === 0) {
        setExtracting(false)
        setLoading(false)
        setError({
          message: 'No links found on this page',
          details:
            'The page was successfully fetched, but no valid links were detected.'
        })
        return
      }

      setLinks(data.links)
      setSummary(data.summary)
      setDomainGroups(data.domainGroups)
      setExtracting(false)

      // Initialize RSS links
      if (data.rssLinks && data.rssLinks.length > 0) {
        const initialRssLinks = data.rssLinks.map((link: RssInfo) => ({
          ...link,
          checking: true
        }))
        setRssLinks(initialRssLinks)

        // Check each RSS link
        for (let i = 0; i < data.rssLinks.length; i++) {
          const rssLink = data.rssLinks[i]

          try {
            const rssResponse = await fetch('/api/check-rss', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ url: rssLink.url })
            })

            const rssResult = await rssResponse.json()

            // Update the RSS link result
            setRssLinks((prev) =>
              prev.map((item, index) =>
                index === i ? { ...item, ...rssResult, checking: false } : item
              )
            )
          } catch (err) {
            setRssLinks((prev) =>
              prev.map((item, index) =>
                index === i
                  ? {
                      ...item,
                      ok: false,
                      error:
                        err instanceof Error
                          ? err.message
                          : 'Failed to check RSS feed',
                      checking: false
                    }
                  : item
              )
            )
          }
        }
      }

      // Initialize results with all links as "checking"
      const initialResults = data.links.map((link: LinkInfo) => ({
        ...link,
        status: null,
        ok: false,
        checking: true
      }))
      setResults(initialResults)

      // Check each link one by one
      for (let i = 0; i < data.links.length; i++) {
        const link = data.links[i]

        try {
          const checkResponse = await fetch('/api/check-link', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: link.url })
          })

          if (!checkResponse.ok) {
            const errorData = await checkResponse.json()
            throw new Error(errorData.error || 'Failed to check link')
          }

          const linkResult = await checkResponse.json()

          // Update the result for this specific link
          setResults((prev) =>
            prev.map((item, index) =>
              index === i ? { ...item, ...linkResult, checking: false } : item
            )
          )
        } catch (err) {
          // Update with error
          setResults((prev) =>
            prev.map((item, index) =>
              index === i
                ? {
                    ...item,
                    status: null,
                    ok: false,
                    error:
                      err instanceof Error
                        ? err.message
                        : 'Failed to check link',
                    checking: false
                  }
                : item
            )
          )
        }

        // Update progress
        setProgress(((i + 1) / data.links.length) * 100)
      }
    } catch (err) {
      let errorMessage = 'An unknown error occurred'
      let errorDetails = undefined

      if (err instanceof Error) {
        errorMessage = err.message
        errorDetails = err.cause as string
      }

      setError({ message: errorMessage, details: errorDetails })
    } finally {
      setLoading(false)
      setExtracting(false)
    }
  }

  // Filter results based on active tab, result filter, and domain
  const filteredResults = results
    .filter((link) => {
      // Skip links that are still checking
      if (link.checking) {
        return true
      }

      // Filter by internal/external
      if (
        activeTab !== 'all' &&
        ((activeTab === 'external' && !link.isExternal) ||
          (activeTab === 'internal' && link.isExternal))
      ) {
        return false
      }

      // Filter by result status
      if (resultFilter === 'working' && !link.ok) {
        return false
      }
      if (resultFilter === 'broken' && link.ok) {
        return false
      }

      // Filter by domain
      if (selectedDomain !== 'all' && link.domain !== selectedDomain) {
        return false
      }

      return true
    })
    .sort((a, b) => {
      // Sort by status: working links first, then broken links
      if (a.ok && !b.ok) return -1
      if (!a.ok && b.ok) return 1
      return 0
    })

  // Count working and broken links
  const workingCount = results.filter(
    (link) => !link.checking && link.ok
  ).length
  const brokenCount = results.filter(
    (link) => !link.checking && !link.ok
  ).length

  // Landing page content
  const renderLandingPage = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
        <FeatureCard
          icon={<Link2 className="h-5 w-5" />}
          title="Comprehensive Link Analysis"
          description="Check all links on a webpage, categorize them as internal or external, and identify broken links in real-time."
        />
        <FeatureCard
          icon={<Zap className="h-5 w-5" />}
          title="Real-time Checking"
          description="See results as they come in with a progress indicator showing the status of each link check."
        />
        <FeatureCard
          icon={<Globe className="h-5 w-5" />}
          title="Domain Grouping"
          description="Group links by domain to see which external sites are most frequently referenced."
        />
        <FeatureCard
          icon={<Rss className="h-5 w-5" />}
          title="RSS Feed Discovery"
          description="Discover and validate RSS feeds, if they're linked on the page."
        />
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Advanced Link Checker</h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Check all links on a website, identify broken links, and analyze
          different links.
        </p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <Input
              type="text"
              placeholder="Enter website URL (e.g., example.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              disabled={loading}
            />
            <Button type="submit" disabled={loading || !url}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {extracting ? 'Extracting links...' : 'Checking...'}
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Check Links
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert
          variant={
            error.message.includes('No links found') ? 'default' : 'destructive'
          }
        >
          {error.message.includes('No links found') ? (
            <Info className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertTitle>{error.message}</AlertTitle>
          {error.details && (
            <AlertDescription>{error.details}</AlertDescription>
          )}
        </Alert>
      )}

      {!hasSearched && renderLandingPage()}

      {hasSearched && (links.length > 0 || rssLinks.length > 0) && (
        <Card>
          <CardContent className="pt-6">
            {summary && (
              <div className="mb-4 flex flex-wrap gap-3">
                <Badge variant="outline" className="px-3 py-1 text-sm">
                  Total: {summary.total} links
                </Badge>
                <Badge
                  variant="outline"
                  className="border-blue-500 px-3 py-1 text-sm"
                >
                  <LinkIcon className="mr-1 h-3 w-3" />
                  Internal: {summary.internal} links
                </Badge>
                <Badge
                  variant="outline"
                  className="border-orange-500 px-3 py-1 text-sm"
                >
                  <ExternalLink className="mr-1 h-3 w-3" />
                  External: {summary.external} links
                </Badge>
                {workingCount > 0 && (
                  <Badge
                    variant="outline"
                    className="border-green-500 px-3 py-1 text-sm"
                  >
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Working: {workingCount} links
                  </Badge>
                )}
                {brokenCount > 0 && (
                  <Badge
                    variant="outline"
                    className="border-red-500 px-3 py-1 text-sm"
                  >
                    <AlertCircle className="mr-1 h-3 w-3" />
                    Broken: {brokenCount} links
                  </Badge>
                )}
                {summary.rss > 0 && (
                  <Badge
                    variant="outline"
                    className="border-green-500 px-3 py-1 text-sm"
                  >
                    <Rss className="mr-1 h-3 w-3" />
                    RSS: {summary.rss} feeds
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
                <TabsTrigger
                  value="domains"
                  disabled={domainGroups.length === 0}
                >
                  Domains{' '}
                  {domainGroups.length > 0 && `(${domainGroups.length})`}
                </TabsTrigger>
                <TabsTrigger value="rss" disabled={rssLinks.length === 0}>
                  RSS Feeds {rssLinks.length > 0 && `(${rssLinks.length})`}
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {mainTab === 'links' && (
              <>
                <div className="mb-4 flex flex-col gap-4 md:flex-row">
                  <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="flex-1"
                  >
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="all">All Links</TabsTrigger>
                      <TabsTrigger value="external">External</TabsTrigger>
                      <TabsTrigger value="internal">Internal</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <Tabs
                    value={resultFilter}
                    onValueChange={setResultFilter}
                    className="flex-1"
                  >
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="all">All Results</TabsTrigger>
                      <TabsTrigger value="working">
                        <CheckCircle className="mr-1 h-3.5 w-3.5 text-green-500" />
                        Working
                      </TabsTrigger>
                      <TabsTrigger value="broken">
                        <AlertCircle className="mr-1 h-3.5 w-3.5 text-red-500" />
                        Broken
                      </TabsTrigger>
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

                <div className="overflow-hidden rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50%]">URL</TableHead>
                        <TableHead className="w-[15%]">Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Result</TableHead>
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
                                    <span>{link.url}</span>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <a
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-muted-foreground hover:text-primary"
                                          >
                                            <ArrowUpRight className="h-3.5 w-3.5" />
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
                              {link.checking
                                ? 'Checking...'
                                : link.status || 'N/A'}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {link.checking ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Checking...</span>
                                  </>
                                ) : link.ok ? (
                                  <>
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span className="text-green-500">
                                      Working
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                    <span className="text-red-500">
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
              <div className="overflow-hidden rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50%]">RSS Feed URL</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
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
              <div className="overflow-hidden rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Domain</TableHead>
                      <TableHead>Link Count</TableHead>
                      <TableHead>Actions</TableHead>
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
      )}
    </div>
  )
}
