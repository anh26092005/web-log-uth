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
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8 gap-4 flex-shrink-0 z-10">
      {/* Search (Removed by user request) */}
      <div className="relative flex-1 max-w-lg"></div>

      {/* Right actions */}
      <div className="flex items-center gap-3 ml-auto">
        <button className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-blue-600 px-3.5 py-2 rounded-xl hover:bg-gray-100 transition-colors">
          <Zap size={16} className="text-amber-500" />
          <span className="hidden md:inline">Tiện ích học tập</span>
        </button>
        <span className="w-px h-5 bg-gray-200" />
        <button className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-blue-600 px-3.5 py-2 rounded-xl hover:bg-gray-100 transition-colors">
          <LifeBuoy size={16} className="text-blue-600" />
          <span className="hidden md:inline">Hỗ trợ trực tuyến</span>
        </button>
      </div>
    </header>
  )
}
