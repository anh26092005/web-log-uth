import React, { useState, useRef, useEffect } from 'react'
import { Search, Zap, LifeBuoy, User, X } from 'lucide-react'

export default function Header({ onSearch }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef()

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handleChange = (e) => {
    setQuery(e.target.value)
    onSearch(e.target.value)
  }

  const clearSearch = () => {
    setQuery('')
    onSearch('')
    inputRef.current?.focus()
  }

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center px-6 gap-4 flex-shrink-0 z-10">
      {/* Search */}
      <div className="relative flex-1 max-w-lg">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Tìm tên môn học, mã học phần, tên bài giảng..."
          className="w-full pl-9 pr-20 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query && (
            <button onClick={clearSearch} className="text-gray-400 hover:text-gray-600 p-0.5">
              <X size={13} />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px] text-gray-500 font-mono">
            Ctrl K
          </kbd>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3 ml-auto">
        <button className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition-colors">
          <Zap size={15} />
          <span className="hidden md:inline">Tiện ích học tập</span>
        </button>
        <span className="w-px h-5 bg-gray-200" />
        <button className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition-colors">
          <LifeBuoy size={15} />
          <span className="hidden md:inline">Hỗ trợ trực tuyến</span>
        </button>
        <span className="w-px h-5 bg-gray-200" />
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg">
          <User size={14} className="text-blue-600" />
          <span className="text-sm font-medium text-blue-700">Sinh viên UTH</span>
        </div>
      </div>
    </header>
  )
}
