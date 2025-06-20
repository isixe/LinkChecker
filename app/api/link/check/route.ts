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
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      })

      clearTimeout(timeoutId)

      const responseText = await response.text()
      const titleMatch = responseText.match(/<title>([^<]*)<\/title>/i)
      const titleText = titleMatch ? titleMatch[1].trim() : ''

      return NextResponse.json({
        url,
        text: titleText,
        status: response.status,
        ok: response.ok
      })
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
        error: error instanceof Error ? error.message : 'Failed to check link'
      },
      { status: 500 }
    )
  }
}
