import { XMLParser } from 'fast-xml-parser'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch(url, {
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        return NextResponse.json({
          url,
          status: response.status,
          ok: false,
          error: `HTTP error: ${response.status} ${response.statusText}`
        })
      }

      const contentType = response.headers.get('content-type') || ''
      if (
        !contentType.includes('xml') &&
        !contentType.includes('rss') &&
        !contentType.includes('atom')
      ) {
        return NextResponse.json({
          url,
          status: response.status,
          ok: false,
          error: `Not a valid RSS/XML feed (content-type: ${contentType})`
        })
      }

      const text = await response.text()

      // Try to parse as XML to validate
      try {
        const parser = new XMLParser({
          ignoreAttributes: false,
          isArray: (name: string) => ['item', 'entry'].includes(name)
        })

        const result = parser.parse(text)

        // Check for RSS elements
        const isRss = Boolean(
          result.rss ||
            result.feed ||
            result.channel ||
            (result.rdf && result.rdf.channel)
        )

        if (!isRss) {
          return NextResponse.json({
            url,
            status: response.status,
            ok: false,
            error: 'XML file does not appear to be a valid RSS or Atom feed'
          })
        }

        // Get feed title and item count if available
        let title = 'Unknown'
        let itemCount = 0

        if (result.rss && result.rss.channel) {
          title = result.rss.channel.title || 'Unknown'
          itemCount = Array.isArray(result.rss.channel.item)
            ? result.rss.channel.item.length
            : 0
        } else if (result.feed) {
          title = result.feed.title || 'Unknown'
          itemCount = Array.isArray(result.feed.entry)
            ? result.feed.entry.length
            : 0
        } else if (result.channel) {
          title = result.channel.title || 'Unknown'
          itemCount = Array.isArray(result.channel.item)
            ? result.channel.item.length
            : 0
        } else if (result.rdf && result.rdf.channel) {
          title = result.rdf.channel.title || 'Unknown'
          itemCount = Array.isArray(result.rdf.item)
            ? result.rdf.item.length
            : 0
        }

        return NextResponse.json({
          url,
          status: response.status,
          ok: true,
          feedInfo: {
            title,
            itemCount
          }
        })
      } catch (parseError) {
        return NextResponse.json({
          url,
          status: response.status,
          ok: false,
          error: 'Failed to parse XML content'
        })
      }
    } catch (error) {
      return NextResponse.json({
        url,
        status: null,
        ok: false,
        error:
          error instanceof Error
            ? error.name === 'AbortError'
              ? 'Request timeout'
              : error.message
            : 'Unknown error'
      })
    }
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to check RSS feed'
      },
      { status: 500 }
    )
  }
}
