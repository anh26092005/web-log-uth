import React from 'react'
import { Eye, Files } from 'lucide-react'
import { getTypeMeta, getTagMeta, formatViews } from '../lib/utils'

export default function SubjectCard({ subject, onClick }) {
  const typeMeta = getTypeMeta(subject.type_tag)
  const tag = Array.isArray(subject.tags) ? subject.tags[0] : subject.tags
  const tagMeta = getTagMeta(tag)

  return (
    <div
      className="subject-card group flex flex-col"
      onClick={() => onClick(subject)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick(subject)}
    >
      {/* Top row: type badge + tag */}
      <div className="flex items-center justify-between mb-3">
        <span className={`tag-badge ${typeMeta.bg} ${typeMeta.text}`}>
          {typeMeta.label}
        </span>
        {tag && (
          <span className={`tag-badge ${tagMeta.bg} ${tagMeta.text}`}>
            {tag}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1.5 group-hover:text-blue-700 transition-colors line-clamp-2">
        {subject.name}
      </h3>

      {/* Description */}
      {subject.description && (
        <p className="text-[12px] text-gray-500 leading-relaxed line-clamp-3 flex-1 mb-3">
          {subject.description}
        </p>
      )}

      {/* Footer stats */}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
        <div className="flex items-center gap-1 text-[11px] text-gray-400">
          <Eye size={12} />
          <span>{formatViews(subject.views)} xem</span>
        </div>
        <button className="text-[11px] text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors">
          Xem thư mục →
        </button>
      </div>

      {subject.file_count > 0 && (
        <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-1.5">
          <Files size={12} />
          <span>{subject.file_count} tệp</span>
        </div>
      )}
    </div>
  )
}
