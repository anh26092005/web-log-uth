import React from 'react'
import { Eye, Files } from 'lucide-react'
import { getTypeMeta, getTagMeta, formatViews } from '../lib/utils'

export default function SubjectCard({ subject, onClick }) {
  const typeMeta = getTypeMeta(subject.type_tag)
  const tag = Array.isArray(subject.tags) ? subject.tags[0] : subject.tags
  const tagMeta = getTagMeta(tag)

  return (
    <div
      className="group flex flex-col bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 hover:border-blue-400 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer min-h-[160px] sm:min-h-[180px] justify-between"
      onClick={() => onClick(subject)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick(subject)}
    >
      <div>
        {/* Top row: type badge + tag */}
        <div className="flex items-center justify-between gap-2 mb-2.5 sm:mb-3">
          <span className={`inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[11px] sm:text-xs font-bold ${typeMeta.bg} ${typeMeta.text}`}>
            {typeMeta.label}
          </span>
          {tag && (
            <span className={`inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[11px] sm:text-xs font-semibold ${tagMeta.bg} ${tagMeta.text} truncate max-w-[140px]`}>
              {tag}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-950 text-sm sm:text-base leading-snug mb-1.5 sm:mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
          {subject.name}
        </h3>

        {/* Description */}
        {subject.description && (
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-2 sm:line-clamp-3 mb-3 sm:mb-4">
            {subject.description}
          </p>
        )}
      </div>

      {/* Footer stats */}
      <div className="pt-3 sm:pt-4 border-t border-gray-100 flex items-center justify-between mt-auto gap-2">
        <div className="flex items-center gap-2.5 sm:gap-3 text-[11px] sm:text-xs font-medium text-gray-600">
          <span className="flex items-center gap-1">
            <Eye size={13} className="text-gray-400" />
            <span>{formatViews(subject.views)} xem</span>
          </span>
          {subject.file_count > 0 && (
            <span className="flex items-center gap-1">
              <Files size={13} className="text-gray-400" />
              <span>{subject.file_count} tệp</span>
            </span>
          )}
        </div>
        <span className="text-[11px] sm:text-xs font-semibold text-blue-700 bg-blue-50 group-hover:bg-blue-600 group-hover:text-white px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg transition-all flex items-center gap-1 flex-shrink-0">
          <span>Xem</span>
          <span className="hidden xs:inline">thư mục</span>
          <span>→</span>
        </span>
      </div>
    </div>
  )
}

