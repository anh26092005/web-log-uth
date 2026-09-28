import React, { useState, useEffect, useCallback } from 'react'
import { SortAsc, ChevronRight, Star } from 'lucide-react'
import SubjectCard from './SubjectCard'
import { mockTips } from '../lib/mockData'
import { getSubjects, searchSubjects } from '../lib/api'

const SORTS = [
  { key: 'views', label: 'Lượt xem nhiều nhất' },
  { key: 'name', label: 'Tên A–Z' },
  { key: 'file_count', label: 'Nhiều tài liệu nhất' },
]

function TipCard({ tip }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3 hover:shadow-md hover:border-blue-200 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
        style={{ backgroundColor: tip.color }}
      >
        {tip.abbr}
      </div>
      <div className="min-w-0">
        <div className="font-semibold text-sm text-gray-800 truncate">{tip.title}</div>
        <div className="text-[11px] text-gray-500 truncate">{tip.desc}</div>
      </div>
    </div>
  )
}

export default function Dashboard({ activeCategory, categories, searchQuery, onSubjectClick }) {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('views')

  const fetchSubjects = useCallback(async () => {
    setLoading(true)
    try {
      let result
      if (searchQuery?.trim()) {
        result = await searchSubjects(searchQuery.trim())
      } else {
        result = await getSubjects(activeCategory)
      }
      if (!result.error && result.data) {
        setSubjects(result.data)
      }
    } finally {
      setLoading(false)
    }
  }, [activeCategory, searchQuery])

  useEffect(() => { fetchSubjects() }, [fetchSubjects])

  const sortedSubjects = [...subjects].sort((a, b) => {
    if (sort === 'views') return (b.views || 0) - (a.views || 0)
    if (sort === 'file_count') return (b.file_count || 0) - (a.file_count || 0)
    if (sort === 'name') return a.name.localeCompare(b.name, 'vi')
    return 0
  })

  const categoryName = activeCategory
    ? categories.find(c => c.id === activeCategory)?.name
    : null

  const isSearching = searchQuery?.trim()

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      {/* Top hero */}
      {!isSearching && !activeCategory && (
        <div className="bg-white border-b border-gray-100 px-6 py-5">
          <div className="flex items-center gap-2 text-sm text-blue-600 mb-2">
            <span className="text-gray-500">Kho tri thức chính quy</span>
            <ChevronRight size={14} />
            <span>Đại học Giao thông vận tải TP.HCM</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Tài liệu học tập UTH — Logistics & CNTT
          </h1>
          <p className="text-sm text-gray-500 max-w-2xl">
            Tổng hợp bài giảng, đề thi mẫu, đề cương chi tiết và tài liệu đồ án chuyên ngành được biên soạn bởi
            giảng viên và ban cán sự học tập.
          </p>
        </div>
      )}

      <div className="px-6 py-5 space-y-8">
        {/* Subject Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="flex items-center gap-2 text-base font-bold text-gray-900">
                {isSearching ? (
                  <>
                    <Star size={16} className="text-yellow-500" />
                    Kết quả tìm kiếm "{searchQuery}"
                  </>
                ) : (
                  <>
                    <Star size={16} className="text-yellow-500" />
                    {categoryName ? `Môn học — ${categoryName}` : 'MÔN HỌC NỔI BẬT'}
                  </>
                )}
              </h2>
              {!isSearching && (
                <p className="text-xs text-gray-400 mt-0.5">
                  Đang hiển thị {subjects.length} môn học phổ biến
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <SortAsc size={14} className="text-gray-400" />
              <span className="text-xs text-gray-500">Sắp xếp theo:</span>
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="text-xs text-gray-700 bg-white border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                {SORTS.map(s => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
                  <div className="flex gap-2 mb-3">
                    <div className="h-5 w-10 bg-gray-100 rounded" />
                    <div className="h-5 w-14 bg-gray-100 rounded" />
                  </div>
                  <div className="h-4 bg-gray-100 rounded mb-2 w-3/4" />
                  <div className="h-3 bg-gray-50 rounded mb-1" />
                  <div className="h-3 bg-gray-50 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : sortedSubjects.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Star size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm">Không tìm thấy môn học nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sortedSubjects.map(subject => (
                <SubjectCard key={subject.id} subject={subject} onClick={onSubjectClick} />
              ))}
            </div>
          )}
        </section>

        {/* Tips Section */}
        {!isSearching && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="flex items-center gap-2 text-base font-bold text-gray-900">
                <span>⚡</span>
                GÓC THỦ THUẬT & TIỆN ÍCH SINH VIÊN
              </h2>
              <button className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors">
                Xem tất cả 12 công cụ →
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {mockTips.map(tip => <TipCard key={tip.id} tip={tip} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
