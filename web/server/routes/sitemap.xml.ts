import { setResponseHeader } from 'h3'
import { buildSitemapIndex } from '../utils/sitemap'

export default defineEventHandler((event) => {
  setResponseHeader(event, 'content-type', 'application/xml; charset=utf-8')
  setResponseHeader(event, 'cache-control', 'public, max-age=3600')
  return buildSitemapIndex(String(useRuntimeConfig(event).public.siteUrl).replace(/\/+$/, ''))
})
