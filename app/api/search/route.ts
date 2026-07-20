import { NextRequest, NextResponse } from 'next/server'
import { parseAnimeList } from '@/lib/parser'

const BASE_URL = 'https://www.yinhuadm.xyz'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const keyword = searchParams.get('keyword')

  if (!keyword) {
    return NextResponse.json({
      code: 400,
      message: '缺少参数 keyword',
      data: null
    }, { status: 400 })
  }

  try {
    const encoded = encodeURIComponent(keyword)
    const res = await fetch(`${BASE_URL}/vch/${encoded}.html`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
        'Accept-Language': 'zh-CN,zh;q=0.9',
      },
      next: { revalidate: 60 }
    })

    const html = await res.text()
    const list = parseAnimeList(html)

    return NextResponse.json({
      code: 0,
      message: 'success',
      data: {
        keyword,
        total: list.length,
        list
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
