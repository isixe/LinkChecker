declare module 'jsdom'

export type BasicLinkStatus = {
  url: string
  text: string
  status: number | null
  ok: boolean
  error?: string
  checking?: boolean
}

export type AdvancedLinkStatus = AdvancedLinkInfo & {
  status: number | null
  ok: boolean
  error?: string
  checking?: boolean
}

export type AdvancedLinkSummary = {
  total: number
  external: number
  internal: number
  nofollow: number
  rss: number
}

export type AdvancedLinkInfo = {
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
