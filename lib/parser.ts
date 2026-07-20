/**
 * 樱花动漫 HTML 解析器
 * 使用正则/字符串解析，无需额外依赖
 */

const BASE_URL = 'https://www.yinhuadm.xyz'

/** 提取第一个匹配 */
function matchFirst(html: string, regex: RegExp): string {
  const m = regex.exec(html)
  return m ? (m[1]?.trim() || '') : ''
}

/** 解码 HTML 实体 */
function decodeHtml(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(parseInt(d)))
}

/** 解析动漫卡片列表 */
export function parseAnimeList(html: string): any[] {
  const list: any[] = []
  const itemRegex = /<a href="\/v\/(\d+)\.html"[^>]*title="([^"]*)"[^>]*class="module-poster-item[^"]*"[^>]*>[\s\S]*?<div class="module-item-note">([^<]*)<\/div>[\s\S]*?<img[^>]*data-original="([^"]*)"[\s\S]*?<div class="module-poster-item-title"[^>]*>([^<]*)<\/div>/g

  let m: RegExpExecArray | null
  while ((m = itemRegex.exec(html)) !== null) {
    const idx = m.index
    const prefix = html.substring(Math.max(0, idx - 100), idx)
    const isNew = prefix.includes('module-item-new') || prefix.includes('>New<')
    list.push({
      id: parseInt(m[1]),
      title: decodeHtml(m[2]),
      episode: m[3]?.trim() || '',
      cover: m[4] || '',
      isNew: isNew,
      url: `${BASE_URL}/v/${m[1]}.html`
    })
  }
  return list
}

/** 解析首页轮播 */
export function parseBanner(html: string) {
  const banners: any[] = []
  const bigMatch = html.match(/<div class="swiper swiper-big">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/)
  if (!bigMatch) return banners

  const items = bigMatch[0].match(/<div class="swiper-slide">[\s\S]*?<\/div>\s*<\/div>/g) || []
  items.forEach(item => {
    const id = matchFirst(item, /href="\/v\/(\d+)\.html"/)
    const img = matchFirst(item, /style="background:\s*url\(([^)]+)\)/)
    const title = matchFirst(item, /<span>([^<]+)<\/span>/)
    const notes = item.match(/<p>([^<]*)<\/p>/g) || []
    const episode = notes[0] ? notes[0].replace(/<\/?p>/g, '') : ''
    const desc = notes[1] ? notes[1].replace(/<\/?p>/g, '') : ''
    if (id) {
      banners.push({
        id: parseInt(id),
        title: decodeHtml(title),
        cover: img,
        episode: episode.trim(),
        description: desc.trim(),
        url: `${BASE_URL}/v/${id}.html`
      })
    }
  })
  return banners
}

/** 解析追番周表 */
export function parseWeekSchedule(html: string) {
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const schedule: Record<string, any[]> = {}
  const tabLists = html.match(/<div class="module-main tab-list[^"]*">[\s\S]*?<div class="module-items[^>]*>[\s\S]*?<\/div>\s*<\/div>/g) || []
  tabLists.forEach((tabHtml, index) => {
    if (index < days.length) {
      schedule[days[index]] = parseAnimeList(tabHtml)
    }
  })
  return schedule
}

/** 解析分类区块 */
export function parseCategorySections(html: string) {
  const sections: any[] = []
  const moduleRegex = /<div class="module">\s*<div class="module-heading">[\s\S]*?<h2 class="module-title"><a[^>]*>([^<]+)<span[^>]*>([^<]*)<\/span>[\s\S]*?<div class="module-main tab-list active">[\s\S]*?<div class="module-items[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g
  let m: RegExpExecArray | null
  while ((m = moduleRegex.exec(html)) !== null) {
    const title = decodeHtml(m[1]?.trim() || '')
    const enTitle = m[2]?.trim() || ''
    const itemsHtml = m[3] || ''
    if (title && !title.includes('热榜') && !title.includes('追番')) {
      sections.push({ title, enTitle, list: parseAnimeList(itemsHtml) })
    }
  }
  return sections
}

/** 解析热榜 */
export function parseHotRankings(html: string) {
  const rankings: any[] = []
  const paperRegex = /<div class="module-paper-item module-item">[\s\S]*?<h3 class="module-paper-item-title">([^<]+)<\/h3>[\s\S]*?<div class="module-paper-item-main">([\s\S]*?)<\/div>\s*<\/div>/g
  let m: RegExpExecArray | null
  while ((m = paperRegex.exec(html)) !== null) {
    const title = m[1]?.trim() || ''
    const itemsHtml = m[2] || ''
    const items: any[] = []
    const itemRegex = /<a href="\/v\/(\d+)\.html">[\s\S]*?<div class="module-paper-item-num[^"]*">(\d+)<\/div>[\s\S]*?<span class="module-paper-item-infotitle">([^<]+)<\/span><p>([^<]*)<\/p>/g
    let i: RegExpExecArray | null
    while ((i = itemRegex.exec(itemsHtml)) !== null) {
      items.push({ id: parseInt(i[1]), rank: parseInt(i[2]), title: decodeHtml(i[3]), episode: i[4]?.trim() || '' })
    }
    if (title) rankings.push({ title, list: items })
  }
  return rankings
}

/** 解析详情页 */
export function parseDetail(html: string) {
  const detail: any = {}
  detail.title = decodeHtml(matchFirst(html, /<h1>([^<]+)<\/h1>/))
  detail.cover = matchFirst(html, /module-item-pic[^>]*>[\s\S]*?<img[^>]*data-original="([^"]+)"/)
  detail.description = decodeHtml(matchFirst(html, /module-info-introduction-content[\s\S]*?<p>([\s\S]*?)<\/p>/))
  detail.year = matchFirst(html, /<a[^>]*title="(\d{4})"/)
  detail.area = matchFirst(html, /<a[^>]*title="([^"]*)"[^>]*href="\/w\/\d+\/area\//)

  const tags: string[] = []
  const tagRegex = /<a href="\/w\/\d+\/class\/([^"]+)\.html">([^<]+)<\/a>/g
  let t: RegExpExecArray | null
  while ((t = tagRegex.exec(html)) !== null) tags.push(t[2])
  detail.tags = [...new Set(tags)]

  const directors: string[] = []
  const directorRegex = /<a href="\/vch\/\/director\/([^"]+)\.html"[^>]*>([^<]+)<\/a>/g
  let d: RegExpExecArray | null
  while ((d = directorRegex.exec(html)) !== null) directors.push(d[2])
  detail.director = directors.join(' / ')

  const actors: string[] = []
  const actorRegex = /<a href="\/vch\/\/actor\/([^"]+)\.html"[^>]*>([^<]+)<\/a>/g
  let a: RegExpExecArray | null
  while ((a = actorRegex.exec(html)) !== null) actors.push(a[2])
  detail.actor = actors.join(' / ')

  detail.episode_status = matchFirst(html, /备注：[\s\S]*?<div class="module-info-item-content">([^<]+)<\/div>/)
  if (!detail.episode_status) {
    detail.episode_status = matchFirst(html, /备注[^>]*>[\s\S]*?<div class="module-info-item-content">([^<]+)<\/div>/)
  }
  detail.update_time = matchFirst(html, /更新[^>]*>[\s\S]*?<div class="module-info-item-content">([^<]+)<\/div>/)
  detail.douban = matchFirst(html, /<a href="([^"]+)"[^>]*title="到豆瓣页面查看"/)

  // 播放源
  const sources: any[] = []
  const sourceRegex = /<div class="module-tab-item tab-item"[^>]*data-dropdown-value="([^"]+)">[\s\S]*?<span>([^<]+)<\/span><small>(\d+)<\/small>/g
  let s: RegExpExecArray | null
  while ((s = sourceRegex.exec(html)) !== null) {
    sources.push({ name: s[1], display: s[2], count: parseInt(s[3]) })
  }
  detail.sources = sources

  // 分集列表
  const episodes: any[] = []
  const episodeRegex = /<a class="module-play-list-link"[^>]*href="\/p\/(\d+-\d+-\d+)\.html"[^>]*title="[^"]*">\s*<span>([^<]+)<\/span>/g
  let e: RegExpExecArray | null
  while ((e = episodeRegex.exec(html)) !== null) {
    episodes.push({
      playUrl: `/p/${e[1]}.html`,
      episode: e[2]?.trim() || '',
      fullUrl: `${BASE_URL}/p/${e[1]}.html`
    })
  }
  detail.episodes = episodes
  return detail
}

/** 分类列表解析 */
export function parseCategoryPage(html: string) {
  return parseAnimeList(html)
}

/** 播放页解析 */
export function parsePlayPage(html: string) {
  const iframeUrl = matchFirst(html, /<iframe[^>]*src="([^"]+)"[^>]*>/)
  const videoUrl = matchFirst(html, /<video[^>]*src="([^"]+)"[^>]*>/)
  const dataUrl = matchFirst(html, /data-url="([^"]+)"/)
  const playerUrl = matchFirst(html, /player\.html\?url=([^"&\s]+)/)
  return {
    iframe: iframeUrl || undefined,
    video: videoUrl || undefined,
    dataUrl: dataUrl || undefined,
    playerUrl: playerUrl ? decodeURIComponent(playerUrl) : undefined
  }
}
