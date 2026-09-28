import { FileText, File, Sheet } from 'lucide-react'

export const TYPE_META = {
  pdf: { label: 'PDF', bg: 'bg-red-100', text: 'text-red-700', Icon: FileText },
  doc: { label: 'DOC', bg: 'bg-blue-100', text: 'text-blue-700', Icon: FileText },
  docx: { label: 'DOC', bg: 'bg-blue-100', text: 'text-blue-700', Icon: FileText },
  xls: { label: 'XLS', bg: 'bg-green-100', text: 'text-green-700', Icon: Sheet },
  xlsx: { label: 'XLS', bg: 'bg-green-100', text: 'text-green-700', Icon: Sheet },
  ppt: { label: 'PPT', bg: 'bg-orange-100', text: 'text-orange-700', Icon: File },
  pptx: { label: 'PPT', bg: 'bg-orange-100', text: 'text-orange-700', Icon: File },
}

export const TAG_META = {
  'Cơ bản': { bg: 'bg-blue-50', text: 'text-blue-700' },
  'Chuyên ngành': { bg: 'bg-purple-50', text: 'text-purple-700' },
  'Chuyên sâu': { bg: 'bg-indigo-50', text: 'text-indigo-700' },
  'Bắt buộc': { bg: 'bg-red-50', text: 'text-red-700' },
  'Thực hành': { bg: 'bg-green-50', text: 'text-green-700' },
  'Cơ sở': { bg: 'bg-orange-50', text: 'text-orange-700' },
}

export function getTypeMeta(type) {
  return TYPE_META[type?.toLowerCase()] || TYPE_META['pdf']
}

export function getTagMeta(tag) {
  return TAG_META[tag] || { bg: 'bg-gray-100', text: 'text-gray-600' }
}

export function formatViews(n) {
  if (!n) return '0'
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

export function formatDate(dateStr) {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    })
  } catch {
    return dateStr
  }
}
