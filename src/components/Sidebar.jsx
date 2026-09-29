import React from 'react'
import { LayoutGrid, Truck, Code2, BarChart3, BookOpen, Zap, X } from 'lucide-react'

const ICON_MAP = {
  Truck, Code2, BarChart3, BookOpen,
  default: LayoutGrid,
}

function CategoryIcon({ name }) {
  const Icon = ICON_MAP[name] || ICON_MAP.default
  return <Icon size={16} />
}

export default function Sidebar({
  categories,
  activeCategory,
  onCategoryChange,
  subjectCounts,
  isOpen,
  onClose,
}) {
  const handleSelect = (catId) => {
    onCategoryChange(catId)
    if (onClose) onClose()
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out md:static md:translate-x-0 md:z-auto ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Mobile Sidebar Header */}
        <div className="md:hidden flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              U
            </div>
            <span className="font-bold text-sm text-gray-900">Danh mục tài liệu</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Đóng danh mục"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
          <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Chuyên ngành
          </p>

          {/* All subjects */}
          <button
            onClick={() => handleSelect(null)}
            className={`w-full text-left flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
              activeCategory === null
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-950'
            }`}
          >
            <LayoutGrid size={18} />
            <span className="flex-1">Tất cả môn học</span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                activeCategory === null ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {subjectCounts?.total || 0}
            </span>
          </button>

          {categories.map((cat) => {
            const count = subjectCounts?.[cat.id] || 0
            const isActive = activeCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => handleSelect(cat.id)}
                className={`w-full text-left flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-950'
                }`}
              >
                <CategoryIcon name={cat.icon} />
                <span className="flex-1 leading-snug">{cat.name}</span>
                {count > 0 && (
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}

          <div className="pt-2">
            <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Hỗ trợ
            </p>
            {/* Vài thủ thuật cho học tập */}
            <button
              onClick={() => handleSelect('tips')}
              className={`w-full text-left flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeCategory === 'tips'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-950'
              }`}
            >
              <Zap
                size={18}
                className={activeCategory === 'tips' ? 'text-yellow-300' : 'text-amber-500'}
              />
              <span className="flex-1 leading-snug">Vài thủ thuật cho học tập</span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  activeCategory === 'tips' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                4
              </span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  )
}

