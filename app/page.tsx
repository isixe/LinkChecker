'use client'

import type React from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import AdvancedResultView, {
  AdvancedResultViewState
} from '@/components/view/advanced-result-view'
import LandingView from '@/components/view/landing-view'
import {
  DomainGroup,
  LinkInfo,
  LinkStatus,
  LinkSummary,
  RssInfo
} from '@/type/link'
import { AlertCircle, Info, Loader2, Search } from 'lucide-react'
import { useState } from 'react'

export default function Home() {
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
  const [resultFilter, setResultFilter] = useState('all')
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
      setResultFilter('all')
      setMainTab('links')
      setDomainGroups([])
      setSelectedDomain('all')
      setHasSearched(true)

      // Validate URL format
      const urlToCheck = url
      const urlPattern = /^https?:\/\/\S+/
      if (!url.trim() || !urlPattern.test(url)) {
        setError({
          message: 'Invalid URL',
          details: 'Please enter a valid URL starting with http:// or https://'
        })
        return
      }

      // First, extract all links from the page
      const response = await fetch('/api/link/collect', {
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
            const rssResponse = await fetch('/api/rss/check', {
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
          const checkResponse = await fetch('/api/link/check', {
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

  const AdvancedResultViewState: AdvancedResultViewState = {
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
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold md:text-4xl">
            Advanced Link Checker
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Check all links on a website, identify broken links, and analyze
            different links.
          </p>
        </div>
        <div className="mx-auto max-w-6xl pt-6">
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
        </div>

        {error && (
          <Alert
            variant={
              error.message.includes('No links found')
                ? 'default'
                : 'destructive'
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

        {!hasSearched && <LandingView />}

        {hasSearched && (links.length > 0 || rssLinks.length > 0) && (
          <AdvancedResultView state={AdvancedResultViewState} />
        )}
      </div>
    </div>
  )
}
