import React, { useState, useEffect } from 'react'
import { LayoutGrid, Tag, FileText, LogOut, BookOpen, Eye, Files, TrendingUp, ChevronRight, Database, HardDrive, RotateCcw, Menu, X, ArrowLeft } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import CategoriesPanel from './CategoriesPanel'
import SubjectsPanel from './SubjectsPanel'
import FilesPanel from './FilesPanel'
import { getCategories, getSubjects } from '../../lib/api'
import { isSupabaseConfigured } from '../../lib/supabase'
import { lsReset } from '../../lib/localStorage'

const TABS = [
  { key: 'overview', label: 'Tổng quan', Icon: LayoutGrid },
  { key: 'categories', label: 'Danh mục', Icon: Tag },
  { key: 'subjects', label: 'Môn học', Icon: BookOpen },
  { key: 'files', label: 'Tài liệu', Icon: FileText },
]

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3.5 sm:p-5 flex items-center gap-3 sm:gap-4 shadow-xs">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <div className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{value}</div>
        <div className="text-xs sm:text-sm text-gray-500 truncate">{label}</div>
      </div>
    </div>
  )
}

function Overview() {
  const [stats, setStats] = useState({ categories: 0, subjects: 0, files: 0, views: 0 })
  const configured = isSupabaseConfigured()

  useEffect(() => {
    Promise.all([getCategories(), getSubjects()]).then(([catRes, subjRes]) => {
      const cats = catRes.data || []
      const subjs = subjRes.data || []
      const totalViews = subjs.reduce((acc, s) => acc + (s.views || 0), 0)
      let totalFiles = subjs.reduce((acc, s) => acc + (s.file_count || 0), 0)
      setStats({ categories: cats.length, subjects: subjs.length, files: totalFiles, views: totalViews })
    })
  }, [])

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-base sm:text-lg font-bold text-gray-900">Tổng quan hệ thống</h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Thống kê nhanh dữ liệu hiện tại</p>
      </div>

      {/* DB status */}
      <div className={`rounded-xl border p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        configured ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'
      }`}>
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            {configured ? <Database size={18} className="text-green-600" /> : <HardDrive size={18} className="text-blue-600" />}
          </div>
          <div>
            <div className={`text-xs sm:text-sm font-semibold ${configured ? 'text-green-700' : 'text-blue-700'}`}>
              {configured ? '✅ Đã kết nối Supabase' : '💾 Lưu trữ cục bộ (localStorage)'}
            </div>
            <div className={`text-[11px] sm:text-xs mt-0.5 ${configured ? 'text-green-600' : 'text-blue-600'}`}>
              {configured
                ? 'Dữ liệu được lưu vào Supabase, bền vững và đồng bộ đa thiết bị'
                : 'Dữ liệu được lưu trong trình duyệt này — tồn tại qua reload, xóa khi xóa cache trình duyệt'}
            </div>
          </div>
        </div>
        {!configured && (
          <button
            onClick={() => {
              if (confirm('Reset toàn bộ dữ liệu về mặc định? Hành động này không thể hoàn tác.')) {
                lsReset()
                window.location.reload()
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors flex-shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <RotateCcw size={13} />
            Reset dữ liệu
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={Tag} label="Danh mục" value={stats.categories} color="bg-blue-50 text-blue-600" />
        <StatCard icon={BookOpen} label="Môn học" value={stats.subjects} color="bg-purple-50 text-purple-600" />
        <StatCard icon={Files} label="Tài liệu" value={stats.files} color="bg-green-50 text-green-600" />
        <StatCard icon={TrendingUp} label="Lượt xem" value={stats.views.toLocaleString()} color="bg-orange-50 text-orange-600" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-xs">
        <h3 className="text-sm font-bold text-gray-800 mb-3.5 sm:mb-4">Hướng dẫn nhanh</h3>
        <div className="space-y-3">
          {[
            { step: '1', text: 'Tạo Danh mục chuyên ngành (Logistics, IT, ...)' },
            { step: '2', text: 'Thêm Môn học vào từng danh mục' },
            { step: '3', text: 'Upload Tài liệu bằng link Google Drive Preview hoặc file PDF tự cắt 15%' },
            { step: '4', text: 'Sinh viên có thể xem 15% miễn phí, phần còn lại liên hệ qua Zalo' },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-start sm:items-center gap-3">
              <div className="w-6 h-6 sm:w-7 sm:h-7 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0">
                {step}
              </div>
              <span className="text-xs sm:text-sm text-gray-700 leading-snug">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { logout } = useAuth()

  const renderPanel = () => {
    switch (activeTab) {
      case 'overview': return <Overview />
      case 'categories': return <CategoriesPanel />
      case 'subjects': return <SubjectsPanel />
      case 'files': return <FilesPanel />
      default: return <Overview />
    }
  }

  const handleSelectTab = (key) => {
    setActiveTab(key)
    setIsSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Drawer Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Admin sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 flex flex-col transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              U
            </div>
            <div>
              <div className="text-white font-bold text-sm">UTH Admin</div>
              <div className="text-gray-500 text-[10px]">Quản trị nội dung</div>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-gray-400 hover:text-white p-1 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {TABS.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => handleSelectTab(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                activeTab === key
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-gray-800 space-y-1">
          <a
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <Eye size={16} />
            Xem trang người dùng
          </a>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-900/20 transition-colors cursor-pointer"
          >
            <LogOut size={16} />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top bar */}
        <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-3 sm:px-6 sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              aria-label="Mở menu quản trị"
            >
              <Menu size={20} />
            </button>
            <span>Admin</span>
            <ChevronRight size={14} />
            <span className="text-gray-900 font-bold truncate">
              {TABS.find(t => t.key === activeTab)?.label}
            </span>
          </div>

          <a
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <ArrowLeft size={13} />
            <span className="hidden sm:inline">Về trang chủ</span>
          </a>
        </div>

        {/* Panel content */}
        <div className="p-3.5 sm:p-6 max-w-6xl w-full">
          {renderPanel()}
        </div>
      </main>
    </div>
  )
}

