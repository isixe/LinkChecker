declare module 'jsdom'

export type LinkStatus = LinkInfo & {
  status: number | null
  ok: boolean
  error?: string
  checking?: boolean
}

export type LinkSummary = {
  total: number
  external: number
  internal: number
  nofollow: number
  rss: number
}

export type LinkInfo = {
  url: string
  isExternal: boolean
  isNoFollow: boolean
  text: string
  category: string
  domain: string
}

export type RssInfo = {
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

export type DomainGroup = {
  domain: string
  count: number
}
