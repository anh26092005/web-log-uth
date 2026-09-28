import React, { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, AlertCircle, Link, FileText, Eye } from 'lucide-react'
import { getFiles, createFile, updateFile, deleteFile, getSubjects } from '../../lib/api'
import { getTypeMeta, formatDate } from '../../lib/utils'

const INITIAL_FORM = {
  subject_id: '',
  name: '',
  type: 'pdf',
  size: '',
  preview_url: '',
}

const TYPE_OPTIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx']

export default function FilesPanel() {
  const [files, setFiles] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState(INITIAL_FORM)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [filterSubj, setFilterSubj] = useState('')

  const load = async (subjectId) => {
    setLoading(true)
    if (subjectId) {
      const { data } = await getFiles(subjectId)
      if (data) setFiles(data)
    } else {
      // Load all files from all subjects (mock mode)
      const { data: allSubjects } = await getSubjects()
      if (!allSubjects) { setLoading(false); return }
      const allFiles = []
      for (const s of allSubjects) {
        const { data } = await getFiles(s.id)
        if (data) allFiles.push(...data)
      }
      setFiles(allFiles)
    }
    setLoading(false)
  }

  const loadSubjects = async () => {
    const { data } = await getSubjects()
    if (data) setSubjects(data)
  }

  useEffect(() => {
    loadSubjects()
    load(null)
  }, [])

  useEffect(() => {
    load(filterSubj || null)
  }, [filterSubj])

  const resetForm = () => {
    setForm(INITIAL_FORM)
    setEditingId(null)
    setShowForm(false)
    setError('')
  }

  const startAdd = () => {
    setForm({ ...INITIAL_FORM, subject_id: filterSubj || '' })
    setEditingId(null)
    setShowForm(true)
  }

  const startEdit = (file) => {
    setForm({
      subject_id: file.subject_id || '',
      name: file.name || '',
      type: file.type || 'pdf',
      size: file.size || '',
      preview_url: file.preview_url || '',
    })
    setEditingId(file.id)
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.subject_id || !form.preview_url.trim()) {
      setError('Vui lòng điền đầy đủ: tên tệp, môn học, và đường dẫn preview.')
      return
    }
    setSaving(true)
    setError('')
    const payload = {
      ...form,
      subject_id: Number(form.subject_id),
    }
    const fn = editingId ? updateFile(editingId, payload) : createFile(payload)
    const { error: err } = await fn
    if (err) { setError(err.message); setSaving(false); return }
    await load(filterSubj || null)
    resetForm()
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Xóa tệp này?')) return
    const { error: err } = await deleteFile(id)
    if (err) setError(err.message)
    else await load(filterSubj || null)
  }

  const getSubjectName = (id) => subjects.find(s => s.id === id)?.name || '—'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Quản lý Tài liệu</h2>
          <p className="text-sm text-gray-500 mt-0.5">Thêm link Google Drive preview hoặc thông tin tệp vào môn học</p>
        </div>
        <button onClick={startAdd} className="btn-primary">
          <Plus size={16} /> Thêm tài liệu
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-lg">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      {/* Google Drive tip */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <Link size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700">
          <strong>Cách lấy link preview từ Google Drive:</strong>
          {' '}Mở file trên Drive → Chia sẻ → Sao chép link → Thay{' '}
          <code className="bg-blue-100 px-1 rounded font-mono text-xs">/view</code> bằng{' '}
          <code className="bg-blue-100 px-1 rounded font-mono text-xs">/preview</code>
          {' '}ở cuối URL.
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-blue-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-gray-800">
              {editingId ? 'Chỉnh sửa tài liệu' : 'Thêm tài liệu mới'}
            </h3>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 p-1 rounded">
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Môn học *</label>
              <select
                value={form.subject_id}
                onChange={e => setForm(f => ({ ...f, subject_id: e.target.value }))}
                className="input-field"
                required
              >
                <option value="">-- Chọn môn học --</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Loại tệp</label>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="input-field"
              >
                {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tên tài liệu *</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="vd: Chương 1 - Tổng quan tư duy phân tích.pdf"
                className="input-field"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Link Google Drive Preview *
              </label>
              <input
                value={form.preview_url}
                onChange={e => setForm(f => ({ ...f, preview_url: e.target.value }))}
                placeholder="https://drive.google.com/file/d/FILE_ID/preview"
                className="input-field font-mono text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Kích thước (tùy chọn)</label>
              <input
                value={form.size}
                onChange={e => setForm(f => ({ ...f, size: e.target.value }))}
                placeholder="vd: 2.4 MB"
                className="input-field"
              />
            </div>
            <div className="flex items-end gap-3">
              {form.preview_url && (
                <a
                  href={form.preview_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary h-[42px]"
                >
                  <Eye size={14} /> Xem thử
                </a>
              )}
            </div>
            <div className="md:col-span-2 flex gap-3 pt-2 border-t border-gray-100">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang lưu...
                  </span>
                ) : editingId ? 'Lưu thay đổi' : 'Thêm tài liệu'}
              </button>
              <button type="button" onClick={resetForm} className="btn-secondary">Hủy</button>
            </div>
          </form>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">Lọc theo môn học:</span>
        <select
          value={filterSubj}
          onChange={e => setFilterSubj(e.target.value)}
          className="input-field w-auto max-w-xs"
        >
          <option value="">Tất cả ({files.length} tệp)</option>
          {subjects.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Đang tải...</div>
        ) : files.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">Chưa có tài liệu nào</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="table-th">Tên tài liệu</th>
                <th className="table-th hidden md:table-cell">Môn học</th>
                <th className="table-th hidden sm:table-cell">Loại</th>
                <th className="table-th hidden lg:table-cell">Kích thước</th>
                <th className="table-th hidden lg:table-cell">Ngày thêm</th>
                <th className="table-th text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {files.map(file => {
                const meta = getTypeMeta(file.type)
                return (
                  <tr key={file.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <FileText size={15} className={meta.text} />
                        <span className="font-medium text-gray-800 text-sm">{file.name}</span>
                      </div>
                      {file.preview_url && (
                        <a
                          href={file.preview_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-blue-500 hover:text-blue-700 mt-0.5 flex items-center gap-1"
                          onClick={e => e.stopPropagation()}
                        >
                          <Link size={10} /> Xem preview
                        </a>
                      )}
                    </td>
                    <td className="table-td hidden md:table-cell text-xs text-gray-500">
                      {getSubjectName(file.subject_id)}
                    </td>
                    <td className="table-td hidden sm:table-cell">
                      <span className={`tag-badge ${meta.bg} ${meta.text}`}>{meta.label}</span>
                    </td>
                    <td className="table-td hidden lg:table-cell text-xs text-gray-400">{file.size || '—'}</td>
                    <td className="table-td hidden lg:table-cell text-xs text-gray-400">
                      {formatDate(file.created_at)}
                    </td>
                    <td className="table-td text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => startEdit(file)} className="btn-secondary !py-1.5 !px-3 text-xs">
                          <Pencil size={13} /> Sửa
                        </button>
                        <button onClick={() => handleDelete(file.id)} className="btn-danger">
                          <Trash2 size={13} /> Xóa
                        </button>
                      </div>
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
