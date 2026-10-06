import { localeSitemap } from '../utils/sitemapRoute'

export default defineEventHandler(event => localeSitemap(event, 'en'))
