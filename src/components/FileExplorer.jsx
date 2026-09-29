import React, { useState, useEffect } from 'react'
import { ArrowLeft, FileText, File, Sheet, Eye, ChevronRight, Folder, MessageCircle } from 'lucide-react'
import { getFiles } from '../lib/api'
import { getTypeMeta, formatDate, getZaloLink } from '../lib/utils'

const FILE_ICON_MAP = {
  pdf: FileText,
  doc: FileText, docx: FileText,
  xls: Sheet, xlsx: Sheet,
  ppt: File, pptx: File,
}

function FileIcon({ type, size = 18 }) {
  const Icon = FILE_ICON_MAP[type?.toLowerCase()] || FileText
  const meta = getTypeMeta(type)
  return <Icon size={size} className={meta.text} />
}

export default function FileExplorer({ subject, onBack, onFileClick }) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!subject) return
    setLoading(true)
    getFiles(subject.id).then(({ data, error }) => {
      if (!error && data) setFiles(data)
      setLoading(false)
    })
  }, [subject?.id])

  if (!subject) return null

  const zaloLink = getZaloLink(subject)

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      {/* Breadcrumb & Header */}
      <div className="px-3.5 py-3 sm:px-8 sm:py-4 border-b border-gray-200 bg-white flex-shrink-0">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2 truncate">
          <button onClick={onBack} className="hover:text-blue-600 transition-colors font-medium flex-shrink-0 cursor-pointer">
            Trang chủ
          </button>
          <ChevronRight size={13} className="text-gray-400 flex-shrink-0" />
          <span className="text-gray-900 font-bold truncate">{subject.name}</span>
        </div>

        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={onBack}
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-semibold text-gray-700 hover:text-blue-600 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl transition-colors cursor-pointer flex-shrink-0"
              title="Quay lại"
            >
              <ArrowLeft size={15} />
              <span className="hidden xs:inline">Quay lại</span>
            </button>
            <span className="w-px h-5 bg-gray-200 flex-shrink-0 hidden xs:block" />
            <h2 className="text-base sm:text-xl font-extrabold text-gray-950 truncate">
              {subject.name}
            </h2>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href={zaloLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#0068FF] hover:bg-blue-700 px-3 py-1.5 sm:py-2 rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer"
              title="Liên hệ qua Zalo để biết chi tiết"
            >
              <MessageCircle size={14} />
              <span className="hidden sm:inline">Liên hệ qua Zalo để biết chi tiết</span>
              <span className="sm:hidden">Zalo chi tiết</span>
            </a>
            <span className="text-[11px] sm:text-xs font-bold text-gray-700 bg-gray-100 px-2.5 py-1 sm:py-2 rounded-xl whitespace-nowrap">
              {files.length} tệp
            </span>
          </div>
        </div>
      </div>


      {/* File list */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 md:p-8">
        {/* Banner liên hệ Zalo */}
        <div className="mb-4 sm:mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-3.5 sm:p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-blue-500/30">
              <MessageCircle size={20} />
            </div>
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-bold text-gray-900 leading-snug">
                Bạn cần trọn bộ tài liệu hoặc hỗ trợ môn học này?
              </div>
              <div className="text-[11px] sm:text-xs text-gray-600 truncate mt-0.5">
                Nhận full file tài liệu, bài tập, đề thi chi tiết qua Zalo
              </div>
            </div>
          </div>
          <a
            href={zaloLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-[#0068FF] hover:bg-blue-700 px-4 py-2 sm:py-2.5 rounded-xl transition-all shadow-sm active:scale-95 flex-shrink-0 cursor-pointer"
          >
            <MessageCircle size={15} />
            <span>Liên hệ qua Zalo để biết chi tiết</span>
          </a>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48 text-gray-500">
            <div className="animate-spin w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full mr-3" />
            <span className="text-sm sm:text-base font-medium">Đang tải tài liệu...</span>
          </div>
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-gray-500 bg-white rounded-2xl border border-gray-200 px-4">
            <Folder size={44} className="mb-3 text-gray-300" />
            <p className="text-sm sm:text-base font-semibold text-gray-700">Chưa có tài liệu trong môn học này</p>
          </div>
        ) : (
          <>
            {/* Mobile Card List (< sm) */}
            <div className="sm:hidden space-y-2.5">
              {files.map(file => {
                const meta = getTypeMeta(file.type)
                return (
                  <div
                    key={file.id}
                    onClick={() => onFileClick(file)}
                    className="bg-white border border-gray-200 rounded-xl p-3.5 shadow-xs flex flex-col gap-2 hover:border-blue-300 active:bg-blue-50/30 transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5 border border-gray-100">
                        <FileIcon type={file.type} size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">
                          {file.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500">
                          <span className={`inline-flex items-center px-1.5 py-0.2 rounded font-bold ${meta.bg} ${meta.text}`}>
                            {meta.label}
                          </span>
                          {file.size && <span>• {file.size}</span>}
                          {file.created_at && <span>• {formatDate(file.created_at)}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 gap-2">
                      <a
                        href={zaloLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800"
                      >
                        <MessageCircle size={13} />
                        <span>Liên hệ Zalo</span>
                      </a>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onFileClick(file)
                        }}
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Eye size={13} />
                        <span>Xem ngay</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Desktop / Tablet Table (>= sm) */}
            <div className="hidden sm:block bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100/75 border-b border-gray-200">
                    <tr>
                      <th className="px-5 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-12"></th>
                      <th className="px-5 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Tên tài liệu</th>
                      <th className="px-5 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Loại</th>
                      <th className="px-5 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider hidden md:table-cell">Kích thước</th>
                      <th className="px-5 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider hidden md:table-cell">Ngày tải lên</th>
                      <th className="px-5 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {files.map(file => {
                      const meta = getTypeMeta(file.type)
                      return (
                        <tr
                          key={file.id}
                          className="cursor-pointer hover:bg-blue-50/40 transition-colors"
                          onClick={() => onFileClick(file)}
                        >
                          <td className="px-5 py-4 text-center">
                            <FileIcon type={file.type} size={20} />
                          </td>
                          <td className="px-5 py-4">
                            <span className="font-semibold text-gray-900 text-sm hover:text-blue-600 transition-colors leading-snug">
                              {file.name}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${meta.bg} ${meta.text}`}>
                              {meta.label}
                            </span>
                          </td>
                          <td className="px-5 py-4 hidden md:table-cell text-gray-600 text-xs font-medium">
                            {file.size || '—'}
                          </td>
                          <td className="px-5 py-4 hidden md:table-cell text-gray-600 text-xs font-medium">
                            {formatDate(file.created_at)}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              <a
                                href={zaloLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline px-2 py-1"
                                title="Liên hệ qua Zalo để biết chi tiết"
                              >
                                <MessageCircle size={13} />
                                <span className="hidden lg:inline">Liên hệ Zalo</span>
                              </a>
                              <button
                                onClick={e => { e.stopPropagation(); onFileClick(file) }}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-white bg-blue-50 hover:bg-blue-600 px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
                              >
                                <Eye size={14} />
                                <span>Xem ngay</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

