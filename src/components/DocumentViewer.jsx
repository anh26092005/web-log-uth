import React from 'react'
import { X, MessageCircle, Lock, ArrowLeft } from 'lucide-react'

const ZALO_LINK = import.meta.env.VITE_ZALO_LINK || 'https://zalo.me/0123456789'

export default function DocumentViewer({ file, subject, onClose }) {
  if (!file) return null

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
      <div className="flex-1 relative overflow-hidden">
        {/* Preview iframe — 20% height */}
        <div style={{ height: '20%', minHeight: '120px' }} className="relative bg-white">
          {file.preview_url && file.preview_url !== 'https://drive.google.com/file/d/EXAMPLE/preview' ? (
            <iframe
              src={file.preview_url}
              className="w-full h-full border-0"
              title={file.name}
              allow="autoplay"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 border-b border-gray-200">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Lock size={22} className="text-blue-600" />
                </div>
                <p className="text-sm text-gray-500 font-medium">{file.name}</p>
                <p className="text-xs text-gray-400 mt-1">Xem trước — 20%</p>
              </div>
            </div>
          )}

          {/* Preview label */}
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-xs font-semibold text-gray-600 px-2 py-1 rounded-md border border-gray-200 shadow-sm">
            Xem trước 20%
          </div>
        </div>

        {/* Blurred 80% — paywall */}
        <div
          className="paywall-blur"
          style={{ height: '80%', minHeight: '0' }}
        >
          {/* Fake document rows visible behind blur */}
          <div className="absolute inset-0 bg-white overflow-hidden pointer-events-none select-none">
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 px-8 py-1.5 border-b border-gray-50">
                <div className="w-5 h-3 bg-gray-100 rounded mt-0.5 flex-shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className={`h-2 bg-gray-100 rounded`} style={{ width: `${60 + (i * 17) % 35}%` }} />
                  {i % 3 === 0 && <div className="h-2 bg-gray-100 rounded w-3/4" />}
                </div>
              </div>
            ))}
          </div>

          {/* Blur overlay */}
          <div className="absolute inset-0 paywall-blur bg-white/30" />

          {/* Paywall card — centered */}
          <div className="absolute inset-0 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 max-w-md w-full text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Lock size={28} className="text-blue-600" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Tài liệu đầy đủ
              </h3>

              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                Tài liệu được biên soạn kĩ càng nên có phát sinh phí vui lòng liên hệ admin.
              </p>

              <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                <div className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Tài liệu bạn muốn xem</div>
                <div className="text-sm font-semibold text-gray-800">{file.name}</div>
                {subject && <div className="text-xs text-gray-500 mt-1">Môn: {subject.name}</div>}
              </div>

              <a
                href={ZALO_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-3.5 px-6 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-95 shadow-lg"
                style={{ backgroundColor: '#0068FF' }}
              >
                <MessageCircle size={20} />
                <span>Liên hệ admin qua Zalo</span>
              </a>

              <p className="text-[11px] text-gray-400 mt-4">
                Phản hồi nhanh trong giờ hành chính • Thanh toán linh hoạt
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
