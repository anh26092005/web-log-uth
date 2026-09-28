import React, { useState, useEffect } from 'react'
import { LayoutGrid, Tag, FileText, LogOut, BookOpen, Eye, Files, TrendingUp, ChevronRight, Database, HardDrive, RotateCcw } from 'lucide-react'
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
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} />
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-500">{label}</div>
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
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Tổng quan hệ thống</h2>
        <p className="text-sm text-gray-500 mt-0.5">Thống kê nhanh dữ liệu hiện tại</p>
      </div>

      {/* DB status */}
      <div className={`rounded-xl border px-5 py-4 flex items-center gap-3 ${
        configured ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'
      }`}>
        {configured ? <Database size={18} className="text-green-600" /> : <HardDrive size={18} className="text-blue-600" />}
        <div className="flex-1">
          <div className={`text-sm font-semibold ${configured ? 'text-green-700' : 'text-blue-700'}`}>
            {configured ? '✅ Đã kết nối Supabase' : '💾 Lưu trữ cục bộ (localStorage)'}
          </div>
          <div className={`text-xs mt-0.5 ${configured ? 'text-green-600' : 'text-blue-600'}`}>
            {configured
              ? 'Dữ liệu được lưu vào Supabase, bền vững và đồng bộ đa thiết bị'
              : 'Dữ liệu được lưu trong trình duyệt này — tồn tại qua reload, xóa khi xóa cache trình duyệt'}
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
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors flex-shrink-0"
          >
            <RotateCcw size={13} />
            Reset dữ liệu
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Tag} label="Danh mục" value={stats.categories} color="bg-blue-50 text-blue-600" />
        <StatCard icon={BookOpen} label="Môn học" value={stats.subjects} color="bg-purple-50 text-purple-600" />
        <StatCard icon={Files} label="Tài liệu" value={stats.files} color="bg-green-50 text-green-600" />
        <StatCard icon={TrendingUp} label="Lượt xem" value={stats.views.toLocaleString()} color="bg-orange-50 text-orange-600" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-bold text-gray-800 mb-4">Hướng dẫn nhanh</h3>
        <div className="space-y-3">
          {[
            { step: '1', text: 'Tạo Danh mục chuyên ngành (Logistics, IT, ...)' },
            { step: '2', text: 'Thêm Môn học vào từng danh mục' },
            { step: '3', text: 'Upload Tài liệu bằng link Google Drive Preview' },
            { step: '4', text: 'Sinh viên có thể xem 20% miễn phí, phần còn lại yêu cầu liên hệ Zalo' },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-center gap-3">
              <div className="w-7 h-7 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
                {step}
              </div>
              <span className="text-sm text-gray-700">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Admin sidebar */}
      <aside className="w-60 flex-shrink-0 bg-gray-900 flex flex-col">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              U
            </div>
            <div>
              <div className="text-white font-bold text-sm">UTH Admin</div>
              <div className="text-gray-500 text-[10px]">Quản trị nội dung</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {TABS.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
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
        <div className="px-3 py-4 border-t border-gray-800">
          <a
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors mb-1"
          >
            <Eye size={16} />
            Xem trang học sinh
          </a>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-900/20 transition-colors"
          >
            <LogOut size={16} />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="h-14 bg-white border-b border-gray-200 flex items-center px-6 gap-2 text-sm text-gray-500 sticky top-0 z-10">
          <span>Admin</span>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-medium">
            {TABS.find(t => t.key === activeTab)?.label}
          </span>
        </div>

        {/* Panel content */}
        <div className="p-6 max-w-6xl">
          {renderPanel()}
        </div>
      </main>
    </div>
  )
}
