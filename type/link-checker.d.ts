declare module 'jsdom'

type LinkStatus = LinkInfo & {
  status: number | null
  ok: boolean
  error?: string
  checking?: boolean
}

type LinkSummary = {
  total: number
  external: number
  internal: number
  social: number
  video: number
  general: number
  rss: number
}

type LinkInfo = {
  url: string
  isExternal: boolean
  text: string
  category: string
  domain: string
}

type RssInfo = {
  url: string
  title: string
  feedInfo?: {
    title: string
    itemCount: number
  }
  status?: number
  ok?: boolean
  error?: string
  checking?: boolean
}

type DomainGroup = {
  domain: string
  count: number
}
