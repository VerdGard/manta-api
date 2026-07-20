import { NextRequest, NextResponse } from 'next/server'
import { parseCategoryPage } from '@/lib/parser'

const BASE_URL = 'https://www.yinhuadm.xyz'

/** 分类映射 */
const CATEGORY_MAP: Record<string, string> = {
  '1': '动漫',
  '9': '国产动漫',
  '10': '日本动漫',
  '11': '欧美动漫',
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || '1'
  const page = parseInt(searchParams.get('page') || '1')
  const area = searchParams.get('area') || ''
  const year = searchParams.get('year') || ''

  try {
    let url = `${BASE_URL}/s/${type}.html`
    if (page > 1) url = `${BASE_URL}/s/${type}-${page}.html`
    if (area || year) {
      url = `${BASE_URL}/w/${type}`
      if (area) url += `/area/${encodeURIComponent(area)}`
      if (year) url += `/year/${year}`
      url += '.html'
    }

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
        'Accept-Language': 'zh-CN,zh;q=0.9',
      },
      next: { revalidate: 300 }
    })

    const html = await res.text()
    const list = parseCategoryPage(html)

    return NextResponse.json({
      code: 0,
      message: 'success',
      data: {
        type: parseInt(type),
        typeName: CATEGORY_MAP[type] || '未知',
        page,
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
