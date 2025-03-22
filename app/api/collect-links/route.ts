import { JSDOM } from 'jsdom'
import { type NextRequest, NextResponse } from 'next/server'

const groupLinksByDomain = (
  links: any[]
): { domain: string; count: number }[] => {
  const domainCounts: Record<string, number> = {}

  links.forEach((link) => {
    const url = new URL(link.url)
    const domain = url.hostname
    if (domain) {
      domainCounts[domain] = (domainCounts[domain] || 0) + 1
    }
  })

  return Object.entries(domainCounts)
    .map(([domain, count]) => ({ domain, count }))
    .sort((a, b) => b.count - a.count)
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Extract the domain from the URL for comparing internal with external links
    const urlObj = new URL(url)
    const baseUrl = urlObj.origin
    const sourceDomain = urlObj.hostname

    // Fetch the HTML content of the page with better error handling
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        return NextResponse.json(
          {
            error: `Failed to fetch the website: ${response.status} ${response.statusText}`,
            statusCode: response.status,
            statusText: response.statusText
          },
          { status: 500 }
        )
      }

      const contentType = response.headers.get('content-type') || ''
      if (!contentType.includes('text/html')) {
        return NextResponse.json(
          {
            error: `The URL does not return HTML content (got ${contentType})`
          },
          { status: 400 }
        )
      }

      const html = await response.text()

      // Parse the HTML using JSDOM
      const dom = new JSDOM(html, { url })
      const document = dom.window.document

      const links: Array<{
        url: string
        isExternal: boolean
        text: string
        domain: string
      }> = []
      let rssLinks: Array<{ url: string; title: string }> = []

      // Extract RSS links from link tags
      const rssLinkElements = document.querySelectorAll(
        'link[type="application/rss+xml"], link[type="application/atom+xml"]'
      )
      rssLinkElements.forEach(
        async (element: { getAttribute: (arg0: string) => string }) => {
          const href = element.getAttribute('href')
          const title = element.getAttribute('title') || 'RSS Feed'

          if (href) {
            const absoluteUrl = new URL(href, url).href
            rssLinks.push({
              url: absoluteUrl,
              title: title
            })
          }
        }
      )

      // Extract all href attributes from a tags
      const linkElements = document.querySelectorAll('a[href]')
      linkElements.forEach(
        async (element: {
          getAttribute: (arg0: string) => any
          textContent: string
        }) => {
          const href = element.getAttribute('href')
          const linkText = element.textContent?.trim() || ''
          const invalidPrefixPattern = /^(#|javascript:|mailto:|tel:)/

          if (href && !invalidPrefixPattern.test(href)) {
            // Convert relative URLs to absolute
            try {
              const absoluteUrl = new URL(href, url).href
              const linkDomain = new URL(absoluteUrl).hostname

              // Check if the link is external (different domain)
              const isExternal = linkDomain !== sourceDomain

              links.push({
                url: absoluteUrl,
                isExternal,
                text: linkText || absoluteUrl,
                domain: linkDomain
              })
              const rssPatterns = [
                '/feed',
                '/rss',
                '/atom',
                'atom.xml',
                'feed.xml',
                'rss.xml',
                '.xml'
              ]
              const isRssUrl = rssPatterns.some((pattern) =>
                absoluteUrl.includes(pattern)
              )
              // Check if this is an RSS link by its path
              if (isRssUrl) {
                // Check if it's not already in the RSS links
                if (!rssLinks.some((rss) => rss.url === absoluteUrl)) {
                  rssLinks.push({
                    url: absoluteUrl,
                    title: linkText || 'RSS Feed'
                  })
                }
              }
            } catch (e) {
              // Skip invalid URLs
            }
          }
        }
      )

      // // try common RSS paths
      // const commonRssPaths = [
      //   '/feed',
      //   '/rss',
      //   '/feed.xml',
      //   '/atom.xml',
      //   '/rss.xml',
      //   '/index.xml',
      //   '/feeds/posts/default',
      //   '/?feed=rss2'
      // ]

      // // Create potential RSS URLs to check
      // const potentialRssUrls = commonRssPaths.map((path) => {
      //   return {
      //     url: new URL(path, baseUrl).href,
      //     title: 'RSS Feed'
      //   }
      // })

      // // Check each potential RSS URL
      // for (const rssUrl of potentialRssUrls) {
      //   rssLinks.push(rssUrl)
      // }

      //unique rssLinks
      rssLinks = rssLinks.filter((rss, index, self) => {
        return (
          index ===
          self.findIndex((t) => {
            return t.url === rss.url && t.title === rss.title
          })
        )
      })

      // Count internal and external links
      const externalCount = links.filter((link) => link.isExternal).length
      const internalCount = links.length - externalCount

      // Group links by domain
      const domainGroups = groupLinksByDomain(links)

      return NextResponse.json({
        links,
        rssLinks,
        domainGroups,
        summary: {
          total: links.length,
          external: externalCount,
          internal: internalCount,
          rss: rssLinks.length
        }
      })
    } catch (error) {
      // Provide more detailed error information
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return NextResponse.json(
            { error: 'Request timed out after 15 seconds' },
            { status: 408 }
          )
        }

        if (error.message.includes('ENOTFOUND')) {
          return NextResponse.json(
            {
              error:
                'Domain not found. The website may not exist or DNS resolution failed.'
            },
            { status: 404 }
          )
        }

        if (error.message.includes('ECONNREFUSED')) {
          return NextResponse.json(
            {
              error:
                'Connection refused. The server actively refused the connection.'
            },
            { status: 503 }
          )
        }

        if (error.message.includes('certificate')) {
          return NextResponse.json(
            {
              error:
                'SSL/TLS certificate error. The website has an invalid or expired certificate.'
            },
            { status: 525 }
          )
        }
      }

      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? `Failed to extract links: ${error.message}`
              : 'Failed to extract links: Unknown error',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to process request'
      },
      { status: 500 }
    )
  }
}
