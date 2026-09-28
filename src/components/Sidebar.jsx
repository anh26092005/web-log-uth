import React from 'react'
import { LayoutGrid, Truck, Code2, BarChart3, BookOpen, ChevronRight, Zap } from 'lucide-react'

const ICON_MAP = {
  Truck, Code2, BarChart3, BookOpen,
  default: LayoutGrid,
}

function CategoryIcon({ name }) {
  const Icon = ICON_MAP[name] || ICON_MAP.default
  return <Icon size={16} />
}

export default function Sidebar({ categories, activeCategory, onCategoryChange, subjectCounts }) {
  return (
    <aside className="w-56 flex-shrink-0 h-full bg-white border-r border-gray-100 flex flex-col overflow-y-auto">
      {/* Logo */}
      <div className="px-4 pt-5 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
            U
          </div>
          <div>
            <div className="font-bold text-gray-900 text-sm leading-tight">UTH Learning</div>
            <div className="text-[10px] text-gray-400 leading-tight">Materials v2.4</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-3 text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
          Danh mục chuyên ngành
        </p>

        {/* All subjects */}
        <button
          onClick={() => onCategoryChange(null)}
          className={`sidebar-link w-full text-left ${activeCategory === null ? 'active' : ''}`}
        >
          <LayoutGrid size={16} />
          <span className="flex-1">Tất cả môn học</span>
          <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${
            activeCategory === null ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
          }`}>
            {subjectCounts?.total || 0}
          </span>
        </button>

        {categories.map(cat => {
          const count = subjectCounts?.[cat.id] || 0
          const isActive = activeCategory === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`sidebar-link w-full text-left ${isActive ? 'active' : ''}`}
            >
              <CategoryIcon name={cat.icon} />
              <span className="flex-1 truncate">{cat.name}</span>
              {count > 0 && (
                <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Bottom notice */}
      <div className="px-3 py-4 border-t border-gray-100">
        <div className="bg-green-50 rounded-lg px-3 py-2.5">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-green-700">Hệ thống dữ liệu học kỳ 2</span>
          </div>
          <p className="text-[11px] text-green-600 leading-snug">
            Cập nhật ngân hàng đề thi & slide tuần 12. Mọi thắc mắc liên hệ ban học tập.
          </p>
        </div>
      </div>
    </aside>
  )
}
