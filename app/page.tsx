'use client'

import { useEffect, useState } from 'react'

const API_BASE = typeof window !== 'undefined' ? window.location.origin : ''

export default function Home() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`${API_BASE}/api/home`)
      .then(r => r.json())
      .then(d => {
        setData(d)
        setLoading(false)
      })
      .catch(e => {
        setError(e.message)
        setLoading(false)
      })
  }, [])

  const endpoints = [
    { method: 'GET', path: '/api/home', desc: '获取首页数据（轮播、周表、分类、热榜）' },
    { method: 'GET', path: '/api/detail?id={id}', desc: '获取动漫详情（简介、分集）' },
    { method: 'GET', path: '/api/search?keyword={keyword}', desc: '搜索动漫' },
    { method: 'GET', path: '/api/category?type={type}&page={page}', desc: '分类列表（type: 1=动漫, 9=国产, 10=日本, 11=欧美）' },
    { method: 'GET', path: '/api/play?id={id}&source={s}&episode={e}', desc: '获取播放地址' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-950 to-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            🎬 樱花动漫 API
          </h1>
          <p className="text-gray-400">抓取 yinhuadm.xyz 数据，提供 RESTful JSON 接口</p>
        </div>

        {/* API 文档卡片 */}
        <div className="space-y-4 mb-12">
          <h2 className="text-xl font-semibold text-purple-300 mb-4">📡 API 接口列表</h2>
          {endpoints.map((ep, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-0.5 bg-green-600/80 text-xs font-mono rounded">{ep.method}</span>
                <code className="text-sm text-purple-300 font-mono break-all">{ep.path}</code>
              </div>
              <p className="text-sm text-gray-400 ml-14">{ep.desc}</p>
            </div>
          ))}
        </div>

        {/* 首页数据预览 */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-purple-300 mb-4">📊 首页数据预览</h2>
          {loading && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-400">正在抓取数据...</p>
            </div>
          )}
          {error && (
            <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-6 text-center">
              <p className="text-red-400">❌ {error}</p>
            </div>
          )}
          {data && data.data && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-purple-900/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-300">{data.data.banner?.length || 0}</div>
                  <div className="text-xs text-gray-400 mt-1">轮播项</div>
                </div>
                <div className="bg-pink-900/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-pink-300">{data.data.updateCount || 0}</div>
                  <div className="text-xs text-gray-400 mt-1">今日更新</div>
                </div>
                <div className="bg-blue-900/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-300">{data.data.categorySections?.length || 0}</div>
                  <div className="text-xs text-gray-400 mt-1">分类板块</div>
                </div>
                <div className="bg-cyan-900/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-cyan-300">{data.data.hotRankings?.length || 0}</div>
                  <div className="text-xs text-gray-400 mt-1">热榜板块</div>
                </div>
              </div>

              {/* 轮播预览 */}
              {data.data.banner?.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-300 mb-2">🎠 轮播动画</h3>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {data.data.banner.slice(0, 6).map((b: any) => (
                      <div key={b.id} className="flex-shrink-0 w-36 bg-black/40 rounded-lg overflow-hidden">
                        <div className="h-20 bg-gradient-to-br from-purple-800 to-pink-800 flex items-center justify-center text-xs text-center p-1">
                          {b.title}
                        </div>
                        <div className="p-1.5 text-xs text-gray-400 truncate">{b.episode}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 热榜预览 */}
              {data.data.hotRankings?.map((rank: any, i: number) => (
                <div key={i} className="mb-3 last:mb-0">
                  <h3 className="text-sm font-medium text-gray-300 mb-1">🔥 {rank.title}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-1.5">
                    {rank.list.slice(0, 5).map((item: any) => (
                      <div key={item.id} className="bg-black/30 rounded px-2 py-1 text-xs text-gray-400 truncate">
                        #{item.rank} {item.title}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 使用示例 */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-purple-300 mb-4">🔧 使用示例</h2>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-gray-400 mb-1">获取首页数据：</p>
              <code className="block bg-black/40 rounded-lg p-3 text-green-300 font-mono text-xs">
                curl {API_BASE}/api/home
              </code>
            </div>
            <div>
              <p className="text-gray-400 mb-1">获取动漫详情：</p>
              <code className="block bg-black/40 rounded-lg p-3 text-green-300 font-mono text-xs">
                curl {API_BASE}/api/detail?id=5527
              </code>
            </div>
            <div>
              <p className="text-gray-400 mb-1">搜索动漫：</p>
              <code className="block bg-black/40 rounded-lg p-3 text-green-300 font-mono text-xs">
                curl {API_BASE}/api/search?keyword=海贼王
              </code>
            </div>
            <div>
              <p className="text-gray-400 mb-1">获取分类列表：</p>
              <code className="block bg-black/40 rounded-lg p-3 text-green-300 font-mono text-xs">
                curl "{API_BASE}/api/category?type=10&page=1"
              </code>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-600 text-xs">
          <p>数据来源：www.yinhuadm.xyz | 仅供学习研究使用</p>
        </div>
      </div>
    </div>
  )
}
