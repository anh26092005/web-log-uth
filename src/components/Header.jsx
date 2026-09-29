import React from 'react'
import { Menu, X, BookOpen, Sparkles } from 'lucide-react'

export default function Header({ onOpenSidebar }) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 px-3 sm:px-6 flex items-center justify-between gap-3 flex-shrink-0 z-20 sticky top-0 shadow-xs">
      {/* Left: Mobile hamburger & Logo */}
      <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
        <button
          onClick={onOpenSidebar}
          type="button"
          aria-label="Mở danh mục"
          className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
        >
          <Menu size={22} />
        </button>

        <a href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-600 group-hover:bg-blue-700 rounded-xl flex items-center justify-center text-white font-extrabold text-base sm:text-lg shadow-sm shadow-blue-500/30 transition-all">
            U
          </div>
          <div className="hidden xs:block">
            <div className="font-extrabold text-sm sm:text-base text-gray-950 leading-tight tracking-tight flex items-center gap-1.5">
              <span>UTH Docs</span>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.2 bg-blue-50 text-blue-700 rounded text-[10px] font-bold">
                2026
              </span>
            </div>
            <div className="text-[11px] text-gray-500 hidden sm:block leading-none mt-0.5 font-medium">
              Kho tài liệu học tập sinh viên
            </div>
          </div>
        </a>
      </div>


    </header>
  )
}

