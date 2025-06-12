'use client'

import { AlertCircle, CheckCircle, Clock, Search, Settings } from 'lucide-react'
import { useState } from 'react'

export default function Test() {
  const [url, setUrl] = useState('')
  const [isAdvanced, setIsAdvanced] = useState(false)
  const [showResults, setShowResults] = useState(true) // Always show results

  // Advanced settings state
  const [maxDepth, setMaxDepth] = useState(1)
  const [timeout, setTimeout] = useState(5000)
  const [followRedirects, setFollowRedirects] = useState(true)
  const [checkExternal, setCheckExternal] = useState(false)

  const toggleMode = () => {
    setIsAdvanced(!isAdvanced)
  }

  const handleCheck = () => {
    // Bind functionality to results display
    setShowResults(true)
    console.log('Link check triggered with settings:', {
      url,
      isAdvanced,
      maxDepth: isAdvanced ? maxDepth : 1,
      timeout: isAdvanced ? timeout : 5000,
      followRedirects: isAdvanced ? followRedirects : true,
      checkExternal: isAdvanced ? checkExternal : false
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-600">
              <Search className="h-6 w-6 text-white" />
            </div>
            <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent">
              Link Checker Pro
            </h1>
          </div>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Check website links, identify broken links, and analyze different
            types of links
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="mb-8 flex justify-center">
          <div className="rounded-full border bg-white p-1 shadow-lg">
            <button
              onClick={toggleMode}
              className={`rounded-full px-6 py-2 transition-all duration-300 ${
                !isAdvanced
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Basic Mode
            </button>
            <button
              onClick={toggleMode}
              className={`rounded-full px-6 py-2 transition-all duration-300 ${
                isAdvanced
                  ? 'bg-purple-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Advanced Mode
            </button>
          </div>
        </div>

        {/* Card Container with 3D Flip Effect */}
        <div className="perspective-1000 mb-8">
          <div
            className={`transform-style-preserve-3d transition-transform duration-700 ${
              isAdvanced ? 'rotate-y-180' : ''
            }`}
          >
            {/* Basic Mode - Front */}
            <div className="backface-hidden">
              <div className="rounded-2xl border bg-white p-8 shadow-xl">
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="mb-2 text-2xl font-semibold text-gray-800">
                      Quick Link Check
                    </h2>
                    <p className="text-gray-600">
                      Enter a website URL and check all link statuses with one
                      click
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Enter website URL (e.g., https://example.com)"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 px-4 py-4 text-lg outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      onClick={handleCheck}
                      className="w-full transform rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:from-blue-600 hover:to-blue-700 active:scale-[0.98]"
                    >
                      <div className="flex items-center justify-center">
                        <Search className="mr-2 h-5 w-5" />
                        Check All Links
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced Mode - Back */}
            <div className="backface-hidden rotate-y-180 absolute inset-0">
              <div className="h-full rounded-2xl border bg-white p-8 shadow-xl">
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="mb-2 text-2xl font-semibold text-gray-800">
                      Advanced Link Analysis
                    </h2>
                    <p className="text-gray-600">
                      Customize check options for in-depth link analysis
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Enter website URL (e.g., https://example.com)"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 px-4 py-4 text-lg outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    {/* Advanced Settings */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Crawl Depth
                        </label>
                        <select
                          value={maxDepth}
                          onChange={(e) => setMaxDepth(Number(e.target.value))}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-purple-500"
                        >
                          <option value={1}>1 Level (Current page only)</option>
                          <option value={2}>2 Levels</option>
                          <option value={3}>3 Levels</option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Timeout (milliseconds)
                        </label>
                        <input
                          type="number"
                          value={timeout}
                          onChange={(e) => setTimeout(Number(e.target.value))}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-purple-500"
                          min="1000"
                          max="30000"
                          step="1000"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={followRedirects}
                          onChange={(e) => setFollowRedirects(e.target.checked)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Follow Redirects
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={checkExternal}
                          onChange={(e) => setCheckExternal(e.target.checked)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Check External Links
                        </span>
                      </label>
                    </div>

                    <button
                      onClick={handleCheck}
                      className="w-full transform rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4 font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:from-purple-600 hover:to-purple-700 active:scale-[0.98]"
                    >
                      <div className="flex items-center justify-center">
                        <Settings className="mr-2 h-5 w-5" />
                        Start Advanced Analysis
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Display - Only Recent Results */}
        {showResults && (
          <div className="overflow-hidden rounded-xl border bg-white shadow-md">
            <div className="border-b border-gray-200 px-4 py-3">
              <h3 className="text-base font-semibold text-gray-900">
                Recent Results
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                Mode: {isAdvanced ? 'Advanced' : 'Basic'} | Depth:{' '}
                {isAdvanced ? maxDepth : 1} | External:{' '}
                {isAdvanced && checkExternal ? 'Yes' : 'No'}
              </p>
            </div>
            <div className="divide-y divide-gray-100">
              {[
                {
                  url: 'https://example.com/about',
                  status: 200,
                  statusText: 'OK',
                  type: 'Internal'
                },
                {
                  url: 'https://example.com/old-page',
                  status: 404,
                  statusText: 'Not Found',
                  type: 'Internal'
                },
                {
                  url: 'https://external-site.com/dead-link',
                  status: 404,
                  statusText: 'Not Found',
                  type: 'External'
                }
              ].map((link, index) => (
                <div
                  key={index}
                  className="hover:bg-gray-25 px-4 py-3 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex min-w-0 flex-1 items-center space-x-2">
                      {link.status === 200 ? (
                        <CheckCircle className="h-3 w-3 flex-shrink-0 text-green-500" />
                      ) : link.status >= 300 && link.status < 400 ? (
                        <Clock className="h-3 w-3 flex-shrink-0 text-yellow-500" />
                      ) : (
                        <AlertCircle className="h-3 w-3 flex-shrink-0 text-red-500" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-gray-900">
                          {link.url}
                        </p>
                        <p className="text-xs text-gray-500">{link.type}</p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        link.status === 200
                          ? 'text-green-600'
                          : link.status >= 300 && link.status < 400
                            ? 'text-yellow-600'
                            : 'text-red-600'
                      }`}
                    >
                      {link.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .bg-gray-25 {
          background-color: #fafafa;
        }
      `
        }}
      />
    </div>
  )
}
