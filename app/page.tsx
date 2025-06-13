'use client'

import type React from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import AdvancedResultView, {
  AdvancedResultViewState
} from '@/components/view/advanced-result-view'
import BasicResultView, {
  BasicResultViewState
} from '@/components/view/basic-result-view'
import LandingView from '@/components/view/landing-view'
import {
  AdvancedLinkInfo,
  AdvancedLinkStatus,
  AdvancedLinkSummary,
  BasicLinkStatus,
  DomainGroup,
  RssInfo
} from '@/type/link'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, Info, Loader2, Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface PreProcessFormResult {
  valid: boolean
  urlToCheck?: string
}

interface GetFinalFilteredResultsParams {
  results: AdvancedLinkStatus[]
  activeTab: string
  resultFilter: string
  selectedDomain: string
}

export default function Home() {
  const [url, setUrl] = useState('')
  const [error, setError] = useState<{
    message: string
    details?: string
  } | null>(null)

  const [loading, setLoading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [hasInputChecking, setHasInputChecking] = useState(false)

  const [activeTab, setActiveTab] = useState('all')

  const [rssLinks, setRssLinks] = useState<RssInfo[]>([])
  const [summary, setSummary] = useState<AdvancedLinkSummary | null>(null)
  const [resultFilter, setResultFilter] = useState('all')
  const [mainTab, setMainTab] = useState('links')
  const [domainGroups, setDomainGroups] = useState<DomainGroup[]>([])
  const [selectedDomain, setSelectedDomain] = useState<string>('all')

  const basicInputRef = useRef<HTMLTextAreaElement>(null)
  const [basicInput, setBasicInput] = useState('')
  const [basicResults, setBasicResults] = useState<BasicLinkStatus[]>([])
  const [basicLoading, setBasicLoading] = useState(false)
  const [basicProgress, setBasicProgress] = useState(0)

  const [advancedProgress, setAdvancedProgress] = useState(0)
  const [advancedLinkList, setAdvancedLinkList] = useState<AdvancedLinkInfo[]>(
    []
  )
  const [advancedResults, setAdvancedResults] = useState<AdvancedLinkStatus[]>(
    []
  )

  const [isAdvanced, setIsAdvanced] = useState(false)
  const [shouldAutoCheck, setShouldAutoCheck] = useState(false)

  useEffect(() => {
    if (shouldAutoCheck && isAdvanced && url) {
      setShouldAutoCheck(false)
      // Simulate form submit
      setTimeout(() => {
        const form = document.querySelector('form')
        if (form) {
          form.dispatchEvent(
            new Event('submit', { cancelable: true, bubbles: true })
          )
        }
      }, 1000)
    }
  }, [shouldAutoCheck, isAdvanced, url])

  const quickAdvancedCheck = (url: string) => {
    setIsAdvanced(true)
    setUrl(url)
    setShouldAutoCheck(true)
    setTimeout(() => {
      if (basicInputRef.current) {
        basicInputRef.current.blur()
      }
    }, 100)
  }

  function isValidUrl(url: string): boolean {
    return /^https?:\/\/\S+$/i.test(url.trim())
  }

  const preProcessBasicForm = (input: string) => {
    const urls = input
      .split('\n')
      .map((u) => u.trim())
      .filter((u) => isValidUrl(u))
    if (urls.length === 0) {
      return {
        valid: false,
        urls,
        error: {
          message: 'Invalid URL',
          details: 'Please enter a valid URL starting with http:// or https://'
        }
      }
    }
    return { valid: true, urls }
  }

  const preProcessAdvancedForm = (): PreProcessFormResult => {
    setLoading(true)
    setExtracting(true)
    setError(null)
    setAdvancedLinkList([])
    setAdvancedResults([])
    setRssLinks([])
    setAdvancedProgress(0)
    setSummary(null)
    setActiveTab('all')
    setResultFilter('all')
    setMainTab('links')
    setDomainGroups([])
    setSelectedDomain('all')
    setHasInputChecking(true)

    const urlToCheck = url
    if (!isValidUrl(url)) {
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
    collectedLinks
  }: {
    collectedLinks: AdvancedLinkInfo[]
  }) => {
    const results: AdvancedLinkStatus[] = collectedLinks.map((link) => ({
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
      setAdvancedProgress(((i + 1) / collectedLinks.length) * 100)
      setAdvancedResults([...results])
    }
    return results
  }

  const getFinalFilteredResults = ({
    results,
    activeTab,
    resultFilter,
    selectedDomain
  }: GetFinalFilteredResultsParams): AdvancedLinkStatus[] => {
    const isChecking = (link: AdvancedLinkStatus) => link.checking
    const matchTab = (link: AdvancedLinkStatus) => {
      return (
        activeTab === 'all' ||
        (activeTab === 'external' && link.isExternal) ||
        (activeTab === 'internal' && !link.isExternal) ||
        (activeTab === 'nofollow' && link.isNoFollow)
      )
    }
    const matchResult = (link: AdvancedLinkStatus) => {
      return (
        resultFilter === 'all' ||
        (resultFilter === 'working' && link.ok) ||
        (resultFilter === 'broken' && !link.ok) ||
        (resultFilter === 'nofollow' && link.isNoFollow)
      )
    }
    const matchDomain = (link: AdvancedLinkStatus) => {
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

  const submitBasicToChecking = async (e: React.FormEvent) => {
    e.preventDefault()
    setHasInputChecking(true)
    setBasicResults([])
    setBasicLoading(true)
    setBasicProgress(0)
    setError(null)

    const { valid, urls, error: preError } = preProcessBasicForm(basicInput)
    if (!valid) {
      if (preError) {
        setError(preError)
      }
      setBasicLoading(false)
      return
    }

    const results: BasicLinkStatus[] = []
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i]
      try {
        const res = await fetch('/api/link/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        })
        if (!res.ok) {
          const err = await res.json()
          results.push({
            url,
            ok: false,
            error: err.error || 'Request failed',
            status: res.status
          })
        } else {
          const data = await res.json()
          results.push({ url, ok: data.ok, status: data.status })
        }
      } catch (err) {
        results.push({
          url,
          ok: false,
          error: err instanceof Error ? err.message : 'Request error',
          status: null
        })
      }
      setBasicProgress(((i + 1) / urls.length) * 100)
      setBasicResults([...results])
    }
    setBasicLoading(false)
  }

  const submitAdvancedToChecking = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!url) {
      return
    }

    const { valid, urlToCheck } = preProcessAdvancedForm()

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

      setAdvancedLinkList(collectedLinks)
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

      await getLinkCheckedResults({
        collectedLinks
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

  const workingCount = advancedResults.filter((link) => {
    return !link.checking && link.ok
  }).length
  const brokenCount = advancedResults.filter((link) => {
    return !link.checking && !link.ok
  }).length

  const filteredResults = getFinalFilteredResults({
    results: advancedResults,
    activeTab,
    resultFilter,
    selectedDomain
  })

  const BasicResultViewState: BasicResultViewState = {
    workingCount: basicResults.filter((r) => r.ok).length,
    brokenCount: basicResults.filter((r) => !r.ok).length,
    loading: basicLoading,
    progress: basicProgress,
    results: basicResults,
    onQuickAdvancedCheck: quickAdvancedCheck
  }

  const AdvancedResultViewState: AdvancedResultViewState = {
    summary,
    workingCount,
    brokenCount,
    loading,
    progress: advancedProgress,
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
    links: advancedLinkList
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          {!isAdvanced ? (
            <>
              <h1 className="text-3xl font-bold md:text-4xl">
                Basic Link Checker
              </h1>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                Check all links list, identify broken links.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold md:text-4xl">
                Advanced Link Checker
              </h1>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                Check all links on a website, identify broken links, and analyze
                different links.
              </p>
            </>
          )}
        </div>

        {/* Mode Toggle */}
        <div className="mb-8 flex justify-center">
          <div className="rounded-full border bg-white p-1 shadow-lg">
            <button
              onClick={() => setIsAdvanced(false)}
              className={`rounded-full px-3 py-2 text-sm transition-all duration-300 md:px-6 md:text-base ${
                !isAdvanced
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Basic Mode
            </button>
            <button
              onClick={() => setIsAdvanced(true)}
              className={`rounded-full px-3 py-2 text-sm transition-all duration-300 md:px-6 md:text-base ${
                isAdvanced
                  ? 'bg-purple-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Advanced Mode
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-6xl pt-6" style={{ perspective: 1200 }}>
          <AnimatePresence mode="wait" initial={false}>
            {!isAdvanced ? (
              <motion.div
                key="basic"
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: -90, opacity: 0 }}
                transition={{ duration: 0.5 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <form
                  onSubmit={submitBasicToChecking}
                  className="flex flex-col gap-3"
                >
                  <Textarea
                    ref={basicInputRef}
                    className="min-h-[120px] rounded p-2 font-mono text-sm outline-none focus-visible:outline-none focus-visible:ring-0"
                    placeholder="Input one valid link per line, e.g. https://example.com"
                    value={basicInput}
                    onChange={(e) => setBasicInput(e.target.value)}
                    disabled={basicLoading}
                  />
                  <Button
                    type="submit"
                    disabled={basicLoading || !basicInput.trim()}
                  >
                    {basicLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Check Links
                      </>
                    )}
                  </Button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="advanced"
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: -90, opacity: 0 }}
                transition={{ duration: 0.5 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <form
                  onSubmit={submitAdvancedToChecking}
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
              </motion.div>
            )}
          </AnimatePresence>
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

        {!hasInputChecking && <LandingView />}

        {hasInputChecking && !isAdvanced && basicResults.length > 0 && (
          <BasicResultView state={BasicResultViewState} />
        )}

        {hasInputChecking &&
          isAdvanced &&
          (advancedLinkList.length > 0 || rssLinks.length > 0) && (
            <AdvancedResultView state={AdvancedResultViewState} />
          )}
      </div>
    </div>
  )
}
