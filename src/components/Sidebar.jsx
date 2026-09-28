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
    <aside className="w-72 flex-shrink-0 h-full bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        <p className="px-3 text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
          Danh mục chuyên ngành
        </p>

        {/* All subjects */}
        <button
          onClick={() => onCategoryChange(null)}
          className={`w-full text-left flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
            activeCategory === null
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-950'
          }`}
        >
          <LayoutGrid size={18} />
          <span className="flex-1">Tất cả môn học</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            activeCategory === null ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
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
              className={`w-full text-left flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-950'
              }`}
            >
              <CategoryIcon name={cat.icon} />
              <span className="flex-1 leading-snug">{cat.name}</span>
              {count > 0 && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
                }`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
