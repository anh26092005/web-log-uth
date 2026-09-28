import React from 'react'
import { X, MessageCircle, Lock, ArrowLeft } from 'lucide-react'

const DEFAULT_ZALO_LINK = import.meta.env.VITE_ZALO_LINK || 'https://zalo.me/0827526857'
const DAI_CUONG_ZALO_LINK = 'https://zalo.me/0898307785'

export default function DocumentViewer({ file, subject, onClose }) {
  if (!file) return null
  
  // Xác định link Zalo dựa theo danh mục môn học
  let currentZaloLink = DEFAULT_ZALO_LINK
  if (subject && subject.categories && subject.categories.name === 'Cơ sở & Đại cương') {
    currentZaloLink = DAI_CUONG_ZALO_LINK
  }

  return (
    <div className="fixed inset-0 z-50 bg-gray-950 flex flex-col">
      {/* Top bar */}
      <div className="h-12 bg-gray-900 border-b border-gray-800 flex items-center px-4 gap-3 flex-shrink-0">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Quay lại</span>
        </button>
        <span className="w-px h-4 bg-gray-700" />
        <span className="text-sm text-gray-300 truncate">{file.name}</span>
        <button
          onClick={onClose}
          className="ml-auto text-gray-400 hover:text-white transition-colors p-1"
        >
          <X size={18} />
        </button>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col md:flex-row relative overflow-hidden bg-gray-100">

        {/* Left/Top: PDF Iframe */}
        <div className="flex-1 relative w-full h-full min-h-[50vh]">
          {file.preview_url ? (
            <iframe
              src={file.preview_url}
              className="w-full h-full border-0 bg-gray-50"
              title={file.name}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Lock size={22} className="text-blue-600" />
                </div>
                <p className="text-sm text-gray-500 font-medium">{file.name}</p>
                <p className="text-xs text-gray-400 mt-1">Bản xem trước</p>
              </div>
            </div>
          )}

          {/* Preview label */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-xs font-bold text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            Bản xem thử (15%)
          </div>
        </div>

        {/* Right/Bottom: Paywall Sidebar */}
        <div className="w-full md:w-[400px] bg-white border-t md:border-t-0 md:border-l border-gray-200 p-8 flex flex-col justify-center flex-shrink-0 z-10 shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.05)] overflow-y-auto">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Lock size={28} className="text-blue-600" />
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
            Tài liệu đầy đủ
          </h3>

          <p className="text-gray-600 text-sm leading-relaxed mb-6 text-center">
            Đây là bản xem thử (15% nội dung). Tài liệu được biên soạn kĩ càng nên có phát sinh phí vui lòng liên hệ admin.
          </p>

          <div className="bg-gray-50 rounded-xl p-4 mb-8 text-left border border-gray-100">
            <div className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Tài liệu bạn đang xem</div>
            <div className="text-sm font-semibold text-gray-800 line-clamp-2">{file.name}</div>
            {subject && <div className="text-xs text-gray-500 mt-1">Môn: {subject.name}</div>}
          </div>

          <a
            href={currentZaloLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full py-4 px-6 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 active:scale-95 shadow-lg shadow-blue-500/20"
            style={{ backgroundColor: '#0068FF' }}
          >
            <MessageCircle size={20} />
            <span>Liên hệ Admin qua Zalo</span>
          </a>

          <p className="text-[11px] text-gray-400 mt-5 text-center px-4">
            Phản hồi nhanh chóng
          </p>
        </div>
      </div>
    </div>
  )
}
