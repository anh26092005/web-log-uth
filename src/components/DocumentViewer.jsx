import React, { useState, useEffect } from 'react'
import { X, MessageCircle, Lock, ArrowLeft, Download, ExternalLink, RefreshCw, Eye } from 'lucide-react'

const DEFAULT_ZALO_LINK = import.meta.env.VITE_ZALO_LINK || 'https://zalo.me/0827526857'
const DAI_CUONG_ZALO_LINK = 'https://zalo.me/0987055081'

export default function DocumentViewer({ file, subject, onClose }) {
  const [mobileTab, setMobileTab] = useState('preview') // 'preview' or 'paywall'
  const [isMobile, setIsMobile] = useState(false)
  const [viewerMode, setViewerMode] = useState('google') // 'google' or 'direct'
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Phát hiện thiết bị di động
    const checkMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent || navigator.vendor || window.opera
    )
    setIsMobile(checkMobile)
    // Nếu là mobile, mặc định dùng Google Docs Viewer để tránh bị tự động tải file
    setViewerMode(checkMobile ? 'google' : 'direct')
  }, [])

  if (!file) return null

  // Xác định link Zalo dựa theo danh mục môn học
  let currentZaloLink = DEFAULT_ZALO_LINK
  if (subject && subject.categories && subject.categories.name === 'Cơ sở & Đại cương') {
    currentZaloLink = DAI_CUONG_ZALO_LINK
  }

  // Tạo URL iframe xem tài liệu
  const getIframeSrc = () => {
    if (!file.preview_url) return ''
    if (viewerMode === 'google') {
      return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(file.preview_url)}`
    }
    return file.preview_url
  }

  const handleDownloadPreview = () => {
    if (!file.preview_url) return
    const link = document.createElement('a')
    link.href = file.preview_url
    link.target = '_blank'
    link.download = `${file.name.replace(/\.[^/.]+$/, '')}_XemThu.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="fixed inset-0 z-50 bg-gray-950 flex flex-col">
      {/* Top bar */}
      <div className="h-12 bg-gray-900 border-b border-gray-800 flex items-center px-3 sm:px-4 gap-2 sm:gap-3 flex-shrink-0">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-400 hover:text-white transition-colors cursor-pointer flex-shrink-0"
        >
          <ArrowLeft size={16} />
          <span className="hidden xs:inline">Quay lại</span>
        </button>

        <span className="w-px h-4 bg-gray-700 flex-shrink-0 hidden xs:block" />

        <span className="text-xs sm:text-sm text-gray-300 truncate flex-1 min-w-0 font-medium">
          {file.name}
        </span>

        {/* Nút tải bản xem thử */}
        {file.preview_url && (
          <button
            onClick={handleDownloadPreview}
            title="Tải bản xem thử PDF"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs font-medium transition-colors border border-gray-700 flex-shrink-0 cursor-pointer"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Tải PDF xem thử</span>
          </button>
        )}

        {/* Mobile Tab Toggle (< md) */}
        <div className="flex md:hidden items-center bg-gray-800 p-0.5 rounded-lg border border-gray-700 flex-shrink-0">
          <button
            onClick={() => setMobileTab('preview')}
            className={`px-2 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${mobileTab === 'preview'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-gray-200'
              }`}
          >
            Xem thử
          </button>
          <button
            onClick={() => setMobileTab('paywall')}
            className={`px-2 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${mobileTab === 'paywall'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-gray-200'
              }`}
          >
            Mở khóa
          </button>
        </div>

        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-gray-800 flex-shrink-0 cursor-pointer ml-1"
          aria-label="Đóng"
        >
          <X size={18} />
        </button>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col md:flex-row relative overflow-hidden bg-gray-100">
        {/* PDF Iframe (Full view on desktop, visible on mobile when mobileTab === 'preview') */}
        <div
          className={`flex-1 relative w-full h-full ${mobileTab === 'preview' ? 'flex flex-col' : 'hidden md:flex flex-col'
            }`}
        >
          {file.preview_url ? (
            <div className="relative w-full flex-1 flex flex-col bg-gray-100">
              {/* Thanh công cụ phụ trợ cho xem tài liệu */}
              <div className="bg-gray-800/90 backdrop-blur-xs text-gray-300 px-3 py-1.5 flex items-center justify-between text-xs border-b border-gray-700/50">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                  <span className="font-medium text-gray-200">Bản xem thử (15% nội dung)</span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Chuyển đổi chế độ xem nếu cần */}
                  <button
                    onClick={() => {
                      setIsLoading(true)
                      setViewerMode(viewerMode === 'google' ? 'direct' : 'google')
                    }}
                    className="text-[11px] text-gray-300 hover:text-white underline cursor-pointer"
                    title="Đổi trình xem nếu không tải được"
                  >
                    {viewerMode === 'google' ? 'Xem trực tiếp' : 'Xem qua Google Docs'}
                  </button>
                  <a
                    href={file.preview_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 ml-1"
                    title="Mở trong tab mới"
                  >
                    <ExternalLink size={12} />
                    <span className="hidden sm:inline">Mở tab mới</span>
                  </a>
                </div>
              </div>

              {/* Loading indicator */}
              {isLoading && (
                <div className="absolute inset-0 top-8 flex flex-col items-center justify-center bg-gray-50 z-10">
                  <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-xs text-gray-500 font-medium">Đang tải bản xem thử...</p>
                  <p className="text-[11px] text-gray-400 mt-1">Nếu tải lâu, bạn có thể bấm "Tải PDF xem thử" ở trên</p>
                </div>
              )}

              <iframe
                key={viewerMode + file.preview_url}
                src={getIframeSrc()}
                className="w-full flex-1 border-0 bg-white"
                title={file.name}
                onLoad={() => setIsLoading(false)}
              />
            </div>
          ) : (
            <div className="w-full flex-1 flex items-center justify-center bg-gray-50 p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Lock size={22} className="text-blue-600" />
                </div>
                <p className="text-sm text-gray-700 font-medium">{file.name}</p>
                <p className="text-xs text-gray-400 mt-1">Tài liệu chưa có bản xem trước trực tuyến</p>
              </div>
            </div>
          )}

          {/* Mobile Bottom Sticky Zalo CTA Bar (< md only) */}
          <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 px-3.5 py-2.5 flex items-center justify-between gap-3 shadow-lg flex-shrink-0">
            <div className="min-w-0">
              <div className="text-xs font-bold text-gray-900 leading-tight">Mở khóa toàn bộ tài liệu</div>
              <div className="text-[10px] text-gray-500 truncate mt-0.5">Nhận file gốc chất lượng cao qua Zalo</div>
            </div>
            <a
              href={currentZaloLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-white font-bold text-xs flex-shrink-0 shadow-md shadow-blue-500/20 active:scale-95 transition-all"
              style={{ backgroundColor: '#0068FF' }}
            >
              <MessageCircle size={15} />
              <span>Zalo Admin</span>
            </a>
          </div>
        </div>

        {/* Paywall Sidebar (Always visible on desktop, visible on mobile when mobileTab === 'paywall') */}
        <div
          className={`w-full md:w-[380px] lg:w-[400px] bg-white border-t md:border-t-0 md:border-l border-gray-200 p-5 sm:p-8 flex flex-col justify-center flex-shrink-0 z-10 shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.05)] overflow-y-auto ${mobileTab === 'paywall' ? 'flex flex-1' : 'hidden md:flex'
            }`}
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-5 flex-shrink-0">
            <Lock size={26} className="text-blue-600" />
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 text-center">
            Tài liệu đầy đủ
          </h3>

          <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-5 sm:mb-6 text-center">
            Đây là bản xem thử (15% nội dung). Tài liệu được biên soạn kĩ càng nên có phát sinh phí nếu có nhu cầu vui lòng liên hệ.
          </p>

          <div className="bg-gray-50 rounded-xl p-3.5 sm:p-4 mb-6 sm:mb-8 text-left border border-gray-100">
            <div className="text-[11px] text-gray-500 mb-1.5 font-medium uppercase tracking-wide">
              Tài liệu bạn đang xem
            </div>
            <div className="text-xs sm:text-sm font-semibold text-gray-800 line-clamp-2">
              {file.name}
            </div>
            {subject && (
              <div className="text-[11px] sm:text-xs text-gray-500 mt-1">
                Môn: <span className="font-medium text-gray-700">{subject.name}</span>
              </div>
            )}
          </div>

          <a
            href={currentZaloLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 w-full py-3.5 sm:py-4 px-5 rounded-xl text-white font-bold text-xs sm:text-sm transition-all hover:opacity-90 active:scale-95 shadow-lg shadow-blue-500/20"
            style={{ backgroundColor: '#0068FF' }}
          >
            <MessageCircle size={18} />
            <span>Liên hệ qua Zalo</span>
          </a>

          <p className="text-[11px] text-gray-400 mt-4 sm:mt-5 text-center px-4">
            Phản hồi nhanh chóng qua Zalo
          </p>

          {/* Quick back to preview on mobile */}
          <div className="md:hidden mt-4 text-center">
            <button
              onClick={() => setMobileTab('preview')}
              className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
            >
              ← Quay lại đọc bản xem thử
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

