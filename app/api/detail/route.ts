import { NextRequest, NextResponse } from 'next/server'
import { parseDetail } from '@/lib/parser'

const BASE_URL = 'https://www.yinhuadm.xyz'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({
      code: 400,
      message: '缺少参数 id',
      data: null
    }, { status: 400 })
  }

  try {
    const res = await fetch(`${BASE_URL}/v/${id}.html`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
        'Accept-Language': 'zh-CN,zh;q=0.9',
      },
      next: { revalidate: 300 }
    })

    if (!res.ok) {
      return NextResponse.json({
        code: 404,
        message: '动漫不存在',
        data: null
      }, { status: 404 })
    }

    const html = await res.text()
    const detail = parseDetail(html)

    if (!detail.title) {
      return NextResponse.json({
        code: 404,
        message: '解析失败，未找到动漫信息',
        data: null
      }, { status: 404 })
    }

    return NextResponse.json({
      code: 0,
      message: 'success',
      data: {
        ...detail,
        id: parseInt(id)
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
