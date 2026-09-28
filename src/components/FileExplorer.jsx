import React, { useState, useEffect } from 'react'
import { ArrowLeft, FileText, File, Sheet, Clock, Download, Eye, ChevronRight, Folder } from 'lucide-react'
import { getFiles } from '../lib/api'
import { getTypeMeta, formatDate } from '../lib/utils'

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

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Breadcrumb & Header */}
      <div className="px-8 py-5 border-b border-gray-200 bg-white flex-shrink-0">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <button onClick={onBack} className="hover:text-blue-600 transition-colors font-medium">
            Đại học Giao thông vận tải TP Hồ Chí Minh
          </button>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="text-gray-900 font-bold">{subject.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-blue-600 bg-gray-100 hover:bg-gray-200 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>Quay lại</span>
            </button>
            <span className="w-px h-6 bg-gray-200" />
            <h2 className="text-xl font-extrabold text-gray-950">{subject.name}</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
              {files.length} tệp tài liệu
            </span>
          </div>
        </div>
      </div>

      {/* File list */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-6 md:p-8">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-gray-500">
            <div className="animate-spin w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full mr-3" />
            <span className="text-base font-medium">Đang tải tài liệu...</span>
          </div>
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500 bg-white rounded-2xl border border-gray-200">
            <Folder size={48} className="mb-3 text-gray-300" />
            <p className="text-base font-semibold text-gray-700">Chưa có tài liệu trong môn học này</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full">
              <thead className="bg-gray-100/75 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-12"></th>
                  <th className="px-5 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Tên tài liệu</th>
                  <th className="px-5 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider hidden sm:table-cell">Loại</th>
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
                      <td className="px-5 py-4 hidden sm:table-cell">
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
                        <button
                          onClick={e => { e.stopPropagation(); onFileClick(file) }}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-white bg-blue-50 hover:bg-blue-600 px-3.5 py-2 rounded-xl transition-all shadow-sm"
                        >
                          <Eye size={14} />
                          <span>Xem ngay</span>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
