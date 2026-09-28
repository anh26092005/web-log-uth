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
      {/* Breadcrumb */}
      <div className="px-6 py-4 border-b border-gray-100 bg-white flex-shrink-0">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
          <button onClick={onBack} className="hover:text-blue-600 transition-colors font-medium">
            Kho tri thức chính quy
          </button>
          <ChevronRight size={14} />
          <button onClick={onBack} className="hover:text-blue-600 transition-colors">
            Đại học Giao thông vận tải TP.HCM
          </button>
          <ChevronRight size={14} />
          <span className="text-gray-700 font-medium">{subject.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Quay lại</span>
            </button>
            <span className="w-px h-4 bg-gray-200" />
            <h2 className="text-lg font-bold text-gray-900">{subject.name}</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
              {files.length} tệp
            </span>
          </div>
        </div>
      </div>

      {/* File list */}
      <div className="flex-1 overflow-y-auto bg-white">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-gray-400">
            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mr-3" />
            <span className="text-sm">Đang tải...</span>
          </div>
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <Folder size={40} className="mb-3 text-gray-300" />
            <p className="text-sm">Chưa có tài liệu trong môn học này</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100 sticky top-0">
              <tr>
                <th className="table-th w-8"></th>
                <th className="table-th">Tên tài liệu</th>
                <th className="table-th hidden sm:table-cell">Loại</th>
                <th className="table-th hidden md:table-cell">Kích thước</th>
                <th className="table-th hidden md:table-cell">Ngày tải lên</th>
                <th className="table-th text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {files.map(file => {
                const meta = getTypeMeta(file.type)
                return (
                  <tr
                    key={file.id}
                    className="file-row cursor-pointer"
                    onClick={() => onFileClick(file)}
                  >
                    <td className="table-td pl-4">
                      <FileIcon type={file.type} />
                    </td>
                    <td className="table-td">
                      <span className="font-medium text-gray-800 hover:text-blue-700 transition-colors">
                        {file.name}
                      </span>
                    </td>
                    <td className="table-td hidden sm:table-cell">
                      <span className={`tag-badge ${meta.bg} ${meta.text}`}>{meta.label}</span>
                    </td>
                    <td className="table-td hidden md:table-cell text-gray-400 text-xs">
                      {file.size || '—'}
                    </td>
                    <td className="table-td hidden md:table-cell text-gray-400 text-xs">
                      {formatDate(file.created_at)}
                    </td>
                    <td className="table-td text-right">
                      <button
                        onClick={e => { e.stopPropagation(); onFileClick(file) }}
                        className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium px-2.5 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        <Eye size={13} />
                        <span>Xem</span>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
