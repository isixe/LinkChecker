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

interface PreProcessFormResult {
  valid: boolean
  urlToCheck?: string
}

interface GetLinkCheckedResultsParams {
  collectedLinks: LinkInfo[]
  setProgress: (progress: number) => void
}

interface GetFinalFilteredResultsParams {
  results: LinkStatus[]
  activeTab: string
  resultFilter: string
  selectedDomain: string
}

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

  const preProcessForm = (): PreProcessFormResult => {
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

    const urlToCheck = url
    const urlPattern = /^https?:\/\/\S+/
    if (!url.trim() || !urlPattern.test(url)) {
      setError({
        message: 'Invalid URL',
        details: 'Please enter a valid URL starting with http:// or https://'
      })
      setLoading(false)
      setExtracting(false)
      return { valid: false }
    }
    return { valid: true, urlToCheck }
  }

  const getCollectionLinks = async ({ urlToCheck }: { urlToCheck: string }) => {
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

    return {
      links: data.links,
      summary: data.summary,
      domainGroups: data.domainGroups,
      rssLinks: data.rssLinks
    }
  }

  const getRssCheckResults = async ({ rssLinks }: { rssLinks: RssInfo[] }) => {
    const results: RssInfo[] = []

    for (let i = 0; i < rssLinks.length; i++) {
      const rssLink = rssLinks[i]
      try {
        const rssResponse = await fetch('/api/rss/check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ url: rssLink.url })
        })
        const rssResult = await rssResponse.json()
        results[i] = { ...rssLink, ...rssResult, checking: false }
      } catch (err) {
        results[i] = {
          ...rssLink,
          ok: false,
          error:
            err instanceof Error ? err.message : 'Failed to check RSS feed',
          checking: false
        }
      }
    }
    return results
  }

  const getLinkCheckedResults = async ({
    collectedLinks,
    setProgress,
    setResults
  }: GetLinkCheckedResultsParams & {
    setResults: (results: LinkStatus[]) => void
  }) => {
    const results: LinkStatus[] = collectedLinks.map((link) => ({
      ...link,
      status: null,
      ok: false,
      checking: true
    }))

    for (let i = 0; i < collectedLinks.length; i++) {
      const link = collectedLinks[i]
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
        results[i] = { ...results[i], ...linkResult, checking: false }
      } catch (err) {
        results[i] = {
          ...results[i],
          status: null,
          ok: false,
          error: err instanceof Error ? err.message : 'Failed to check link',
          checking: false
        }
      }
      setProgress(((i + 1) / collectedLinks.length) * 100)
      setResults([...results]) // 实时刷新
    }
    return results
  }

  const getFinalFilteredResults = ({
    results,
    activeTab,
    resultFilter,
    selectedDomain
  }: GetFinalFilteredResultsParams): LinkStatus[] => {
    const isChecking = (link: LinkStatus) => link.checking
    const matchTab = (link: LinkStatus) => {
      return (
        activeTab === 'all' ||
        (activeTab === 'external' && link.isExternal) ||
        (activeTab === 'internal' && !link.isExternal)
      )
    }
    const matchResult = (link: LinkStatus) => {
      return (
        resultFilter === 'all' ||
        (resultFilter === 'working' && link.ok) ||
        (resultFilter === 'broken' && !link.ok)
      )
    }
    const matchDomain = (link: LinkStatus) => {
      return selectedDomain === 'all' || link.domain === selectedDomain
    }

    return results
      .filter((link) => {
        if (isChecking(link)) {
          return true
        }
        return [matchTab, matchResult, matchDomain].every((fn) => fn(link))
      })
      .sort((a, b) => {
        if (a.ok && !b.ok) {
          return -1
        }
        if (!a.ok && b.ok) {
          return 1
        }
        return 0
      })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!url) {
      return
    }

    const { valid, urlToCheck } = preProcessForm()

    if (!valid || !urlToCheck) {
      return
    }

    try {
      const {
        links: collectedLinks,
        summary,
        domainGroups,
        rssLinks
      } = await getCollectionLinks({ urlToCheck })

      if (collectedLinks && collectedLinks.length === 0) {
        setExtracting(false)
        setLoading(false)
        setError({
          message: 'No links found on this page',
          details:
            'The page was successfully fetched, but no valid links were detected.'
        })
        return
      }

      setLinks(collectedLinks)
      setSummary(summary)
      setDomainGroups(domainGroups)
      setExtracting(false)

      if (rssLinks && rssLinks.length > 0) {
        const initialRssLinks = rssLinks.map((link: RssInfo) => ({
          ...link,
          checking: true
        }))
        setRssLinks(initialRssLinks)

        const checkedRssLinks = await getRssCheckResults({ rssLinks })
        setRssLinks(checkedRssLinks as RssInfo[])
      }

      const checkedResults = await getLinkCheckedResults({
        collectedLinks,
        setProgress,
        setResults // 新增
      })
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

  const workingCount = results.filter((link) => {
    return !link.checking && link.ok
  }).length
  const brokenCount = results.filter((link) => {
    return !link.checking && !link.ok
  }).length

  const filteredResults = getFinalFilteredResults({
    results,
    activeTab,
    resultFilter,
    selectedDomain
  })

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
