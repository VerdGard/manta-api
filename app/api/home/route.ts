import { NextResponse } from 'next/server'
import { parseBanner, parseWeekSchedule, parseCategorySections, parseHotRankings } from '@/lib/parser'

const BASE_URL = 'https://www.yinhuadm.xyz'

export async function GET() {
  try {
    const res = await fetch(BASE_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      },
      next: { revalidate: 300 } // 5分钟缓存
    })
    const html = await res.text()

    const banner = parseBanner(html)
    const weekSchedule = parseWeekSchedule(html)
    const categorySections = parseCategorySections(html)
    const hotRankings = parseHotRankings(html)

    return NextResponse.json({
      code: 0,
      message: 'success',
      data: {
        banner,
        weekSchedule,
        categorySections,
        hotRankings,
        updateCount: 49
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      code: 500,
      message: error.message || '服务器错误',
      data: null
    }, { status: 500 })
  }
}
