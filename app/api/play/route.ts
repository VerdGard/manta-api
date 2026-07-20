import { NextRequest, NextResponse } from 'next/server'
import { parsePlayPage } from '@/lib/parser'

const BASE_URL = 'https://www.yinhuadm.xyz'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const source = searchParams.get('source') || '1'
  const episode = searchParams.get('episode') || '1'

  if (!id) {
    return NextResponse.json({
      code: 400,
      message: '缺少参数 id',
      data: null
    }, { status: 400 })
  }

  try {
    const playUrl = `${BASE_URL}/p/${id}-${source}-${episode}.html`
    const res = await fetch(playUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
        'Accept-Language': 'zh-CN,zh;q=0.9',
      },
      next: { revalidate: 60 }
    })

    const html = await res.text()
    const playInfo = parsePlayPage(html)

    return NextResponse.json({
      code: 0,
      message: 'success',
      data: {
        id: parseInt(id),
        source: parseInt(source),
        episode: parseInt(episode),
        playUrl,
        ...playInfo
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
