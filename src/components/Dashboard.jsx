import React, { useState, useEffect, useCallback } from 'react'
import { SortAsc, Star, Zap, LayoutGrid } from 'lucide-react'
import SubjectCard from './SubjectCard'
import { mockTips } from '../lib/mockData'
import { getSubjects } from '../lib/api'

const SORTS = [
  { key: 'views', label: 'Lượt xem nhiều nhất' },
  { key: 'name', label: 'Tên A–Z' },
  { key: 'file_count', label: 'Nhiều tài liệu nhất' },
]

export default function Dashboard({
  activeCategory,
  categories,

  onSubjectClick,
  onCategoryChange,
  subjectCounts,
}) {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('views')

  const fetchSubjects = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getSubjects(activeCategory)
      if (!result.error && result.data) {
        setSubjects(result.data)
      }
    } finally {
      setLoading(false)
    }
  }, [activeCategory])

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



  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 flex flex-col">
      {/* Mobile / Tablet Horizontal Category Scroll Pills */}
      <div className="md:hidden bg-white border-b border-gray-200 px-3 py-2.5 overflow-x-auto flex-shrink-0 flex items-center gap-1.5 scrollbar-none">
        <button
          onClick={() => onCategoryChange && onCategoryChange(null)}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeCategory === null
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <LayoutGrid size={13} />
          <span>Tất cả</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeCategory === null ? 'bg-white/25 text-white' : 'bg-gray-200 text-gray-600'}`}>
            {subjectCounts?.total || 0}
          </span>
        </button>

        {categories.map((cat) => {
          const isActive = activeCategory === cat.id
          const count = subjectCounts?.[cat.id] || 0
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange && onCategoryChange(cat.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{cat.name}</span>
              {count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/25 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}

        <button
          onClick={() => onCategoryChange && onCategoryChange('tips')}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
            activeCategory === 'tips'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
          }`}
        >
          <Zap size={13} className={activeCategory === 'tips' ? 'text-yellow-300' : 'text-amber-500'} />
          <span>⚡ Thủ thuật</span>
        </button>
      </div>

      {activeCategory === 'tips' ? (
        <div className="p-3.5 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-xs">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-amber-50 text-amber-800 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-2.5">
              <span>⚡ Tiện ích & Thủ thuật học tập</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-950 mb-1.5">
              Vài thủ thuật cho học tập
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 max-w-2xl leading-relaxed">
              Tổng hợp các tiện ích và thủ thuật hữu ích giúp sinh viên UTH mở khóa tài liệu học tập, tra cứu câu hỏi trắc nghiệm và hỗ trợ nghiên cứu tiểu luận.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-5">
            {mockTips.map(tip => {
              const hasVideo = Boolean(tip.video_url?.trim())
              return (
                <div
                  key={tip.id}
                  onClick={() => {
                    if (hasVideo) {
                      window.open(tip.video_url, '_blank', 'noopener,noreferrer')
                    }
                  }}
                  className={`bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 flex items-start gap-3.5 sm:gap-4 transition-all duration-200 ${
                    hasVideo
                      ? 'hover:shadow-lg hover:border-blue-300 hover:-translate-y-0.5 cursor-pointer'
                      : 'hover:border-gray-300'
                  }`}
                >
                  <div
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0 shadow-xs"
                    style={{ backgroundColor: tip.color }}
                  >
                    {tip.abbr}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm sm:text-base text-gray-900 mb-1 leading-snug">{tip.title}</div>
                    <div className="text-xs sm:text-sm text-gray-600 leading-relaxed">{tip.desc}</div>
                    {hasVideo && (
                      <div className="mt-2.5">
                        <span className="inline-flex items-center text-xs font-semibold text-red-600 hover:text-red-700 gap-1">
                          ▶ Xem video hướng dẫn →
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <>
          {/* Top hero */}
          {!activeCategory && (
            <div className="bg-white border-b border-gray-200 px-4 py-4 sm:px-8 sm:py-6 shadow-xs">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-2">
                <span>🏛️ ĐH Giao thông vận tải TP.HCM</span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-950 mb-1.5 tracking-tight">
                Tài liệu học tập UTH — Logistics & CNTT
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 max-w-3xl leading-relaxed">
                Tổng hợp bài giảng, đề thi mẫu, đề cương chi tiết và tài liệu đồ án chuyên ngành. (Lưu ý: Phiên bản xem trước này chỉ chứa một phần tài liệu).
              </p>
            </div>
          )}

          <div className="px-3.5 py-4 sm:px-8 sm:py-7 space-y-6 sm:space-y-8 flex-1">
            {/* Subject Grid */}
            <section>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 mb-4 sm:mb-5">
                <div>
                  <h2 className="flex items-center gap-2 text-base sm:text-lg font-bold text-gray-950">
                    <Star size={18} className="text-amber-500 fill-amber-400 flex-shrink-0" />
                    <span className="truncate">{categoryName ? `Môn học — ${categoryName}` : 'MÔN HỌC NỔI BẬT'}</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                    Đang hiển thị {subjects.length} môn học
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-xl px-2.5 py-1.5 shadow-xs self-start sm:self-auto">
                  <SortAsc size={15} className="text-gray-500 flex-shrink-0" />
                  <span className="text-[11px] sm:text-xs font-medium text-gray-500 flex-shrink-0">Sắp xếp:</span>
                  <select
                    value={sort}
                    onChange={e => setSort(e.target.value)}
                    className="text-[11px] sm:text-xs font-semibold text-gray-800 bg-transparent focus:outline-none cursor-pointer"
                  >
                    {SORTS.map(s => (
                      <option key={s.key} value={s.key}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 animate-pulse min-h-[160px]">
                      <div className="flex gap-2 mb-3">
                        <div className="h-5 w-12 bg-gray-200 rounded" />
                        <div className="h-5 w-16 bg-gray-200 rounded" />
                      </div>
                      <div className="h-5 bg-gray-200 rounded mb-2 w-3/4" />
                      <div className="h-4 bg-gray-100 rounded mb-2" />
                      <div className="h-4 bg-gray-100 rounded w-2/3" />
                    </div>
                  ))}
                </div>
              ) : sortedSubjects.length === 0 ? (
                <div className="text-center py-12 sm:py-16 text-gray-500 bg-white rounded-2xl border border-gray-200 px-4">
                  <Star size={40} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-sm sm:text-base font-semibold text-gray-700">Không tìm thấy môn học nào</p>

                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
                  {sortedSubjects.map(subject => (
                    <SubjectCard key={subject.id} subject={subject} onClick={onSubjectClick} />
                  ))}
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  )
}

