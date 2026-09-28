import React, { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, AlertCircle, Eye, Files } from 'lucide-react'
import { getSubjects, createSubject, updateSubject, deleteSubject, deleteSubjects, getCategories } from '../../lib/api'
import { formatViews, getTagMeta } from '../../lib/utils'
import BulkFolderUpload from '../../components/admin/BulkFolderUpload'

const INITIAL_FORM = {
  name: '', category_id: '', description: '',
  tags: '', type_tag: 'PDF',
}

const TYPE_OPTIONS = ['PDF', 'DOC', 'XLS', 'PPT']
const TAG_OPTIONS = ['Cơ bản', 'Chuyên ngành', 'Chuyên sâu', 'Bắt buộc', 'Thực hành', 'Cơ sở']

export default function SubjectsPanel() {
  const [subjects, setSubjects] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(INITIAL_FORM)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [showBulkFolder, setShowBulkFolder] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [filterCat, setFilterCat] = useState('')

  const load = async () => {
    setLoading(true)
    const [subjRes, catRes] = await Promise.all([
      getSubjects(),
      getCategories(),
    ])
    if (subjRes.data) setSubjects(subjRes.data)
    if (catRes.data) setCategories(catRes.data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const resetForm = () => {
    setForm(INITIAL_FORM)
    setEditingId(null)
    setShowForm(false)
    setError('')
  }

  const startAdd = () => {
    setForm(INITIAL_FORM)
    setEditingId(null)
    setShowForm(true)
  }

  const startEdit = (subj) => {
    setForm({
      name: subj.name || '',
      category_id: subj.category_id || '',
      description: subj.description || '',
      tags: Array.isArray(subj.tags) ? subj.tags.join(', ') : (subj.tags || ''),
      type_tag: subj.type_tag || 'PDF',
    })
    setEditingId(subj.id)
    setShowForm(true)
  }

  const subjectNames = form.name
    .split('\n')
    .map(n => n.trim())
    .filter(Boolean)
  const isMultiple = !editingId && subjectNames.length > 1

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.category_id) {
      setError('Vui lòng điền tên môn học và chọn danh mục.')
      return
    }

    const names = form.name
      .split('\n')
      .map(n => n.trim())
      .filter(Boolean)

    if (names.length === 0) {
      setError('Vui lòng nhập ít nhất 1 tên môn học.')
      return
    }

    setSaving(true)
    setError('')
    const catId = Number(form.category_id)
    const parsedTags = form.tags.split(',').map(t => t.trim()).filter(Boolean)

    if (editingId) {
      const payload = {
        name: names[0],
        category_id: catId,
        description: form.description?.trim() || '',
        type_tag: form.type_tag || 'PDF',
        tags: parsedTags,
      }
      const { error: err } = await updateSubject(editingId, payload)
      if (err) { setError(err.message); setSaving(false); return }
    } else {
      if (names.length === 1) {
        const payload = {
          name: names[0],
          category_id: catId,
          description: form.description?.trim() || '',
          type_tag: form.type_tag || 'PDF',
          tags: parsedTags,
        }
        const { error: err } = await createSubject(payload)
        if (err) { setError(err.message); setSaving(false); return }
      } else {
        const payloads = names.map(name => ({
          name,
          category_id: catId,
          description: form.description?.trim() || '',
          type_tag: form.type_tag || 'PDF',
          tags: parsedTags,
        }))
        const { error: err } = await createSubject(payloads)
        if (err) { setError(err.message); setSaving(false); return }
      }
    }

    await load()
    resetForm()
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Xóa môn học này? Các tệp liên quan cũng sẽ bị xóa.')) return
    const { error: err } = await deleteSubject(id)
    if (err) setError(err.message)
    else {
      setSelectedIds(prev => prev.filter(x => x !== id))
      await load()
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return
    if (!confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} môn học đã chọn? Các tệp liên quan cũng sẽ bị xóa vĩnh viễn.`)) return
    
    setLoading(true)
    const { error: err } = await deleteSubjects(selectedIds)
    if (err) setError(err.message)
    setSelectedIds([])
    await load()
  }

  const handleDeleteAll = async () => {
    if (filtered.length === 0) return
    const msg = filterCat
      ? `Bạn có chắc chắn muốn xóa TẤT CẢ ${filtered.length} môn học trong danh mục này? Mọi tài liệu bên trong cũng sẽ bị xóa vĩnh viễn!`
      : `⚠️ CẢNH BÁO NGUY HIỂM:\nBạn có chắc chắn muốn xóa TOÀN BỘ ${subjects.length} môn học trên hệ thống?\nMọi tài liệu bên trong các môn này cũng sẽ bị xóa vĩnh viễn!`
    
    if (!confirm(msg)) return
    setLoading(true)
    const { error: err } = await deleteSubjects(filtered.map(s => s.id))
    if (err) setError(err.message)
    setSelectedIds([])
    await load()
  }

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const toggleSelectAll = () => {
    if (filtered.length === 0) return
    if (selectedIds.length === filtered.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filtered.map(s => s.id))
    }
  }

  const filtered = filterCat
    ? subjects.filter(s => String(s.category_id) === filterCat)
    : subjects

  useEffect(() => {
    setSelectedIds([])
  }, [filterCat])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Quản lý Môn học</h2>
          <p className="text-sm text-gray-500 mt-0.5">Thêm, sửa, xóa môn học và gắn vào danh mục</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowBulkFolder(!showBulkFolder)} className="btn-secondary">
            📁 Tải lên thư mục nhiều môn
          </button>
          <button onClick={startAdd} className="btn-primary">
            <Plus size={16} /> Thêm môn học
          </button>
        </div>
      </div>

      {/* Bulk Multi-Folder Upload UI */}
      {showBulkFolder && (
        <BulkFolderUpload
          categories={categories}
          subjects={subjects}
          onComplete={async () => {
            await load()
          }}
          onClose={() => setShowBulkFolder(false)}
        />
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-lg">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-blue-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-gray-800">
              {editingId ? 'Chỉnh sửa môn học' : 'Thêm môn học mới'}
            </h3>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 p-1 rounded">
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-700">
                  {editingId ? 'Tên môn học *' : 'Tên môn học (1 dòng = 1 môn) *'}
                </label>
                {isMultiple && (
                  <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    ⚡ {subjectNames.length} môn được thêm cùng lúc
                  </span>
                )}
              </div>
              {editingId ? (
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="vd: Quản trị Chuỗi cung ứng"
                  className="input-field"
                  required
                />
              ) : (
                <textarea
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder={`Nhập hoặc dán danh sách môn học (mỗi dòng 1 môn):\nKinh tế vi mô\nKinh tế vĩ mô\nNguyên lý kế toán\nLogistics đại cương`}
                  rows={4}
                  className="input-field font-medium leading-relaxed resize-y"
                  required
                />
              )}
              {!editingId && (
                <p className="text-[11px] text-gray-400 mt-1">
                  💡 Nhấn Enter xuống dòng để nhập thêm môn khác hoặc dán nhiều môn từ Excel/Word.
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Danh mục *</label>
              <select
                value={form.category_id}
                onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                className="input-field"
                required
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Mô tả</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Mô tả ngắn về nội dung môn học..."
                rows={2}
                className="input-field resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Loại tài liệu</label>
              <select
                value={form.type_tag}
                onChange={e => setForm(f => ({ ...f, type_tag: e.target.value }))}
                className="input-field"
              >
                {TYPE_OPTIONS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tags (phân cách bằng dấu phẩy)</label>
              <input
                value={form.tags}
                onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                placeholder="vd: Cơ bản, Bắt buộc"
                className="input-field"
                list="tag-suggestions"
              />
              <datalist id="tag-suggestions">
                {TAG_OPTIONS.map(t => <option key={t} value={t} />)}
              </datalist>
            </div>
            <div className="md:col-span-2 flex gap-3 pt-2 border-t border-gray-100">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {isMultiple ? `Đang thêm ${subjectNames.length} môn...` : 'Đang lưu...'}
                  </span>
                ) : editingId ? (
                  'Lưu thay đổi'
                ) : isMultiple ? (
                  `Thêm ${subjectNames.length} môn học`
                ) : (
                  'Thêm môn học'
                )}
              </button>
              <button type="button" onClick={resetForm} className="btn-secondary">Hủy</button>
            </div>
          </form>
        </div>
      )}

      {/* Filter & Bulk Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Lọc theo danh mục:</span>
          <select
            value={filterCat}
            onChange={e => setFilterCat(e.target.value)}
            className="input-field w-auto font-medium"
          >
            <option value="">Tất cả ({subjects.length})</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({subjects.filter(s => String(s.category_id) === String(c.id)).length})
              </option>
            ))}
          </select>
        </div>

        {/* Delete action buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {selectedIds.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="btn-danger flex items-center gap-1.5 text-xs font-semibold py-2 px-3.5 shadow-sm"
            >
              <Trash2 size={14} />
              <span>Xóa {selectedIds.length} môn đã chọn</span>
            </button>
          )}

          {filtered.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold rounded-lg transition-colors border border-red-200 cursor-pointer shadow-sm"
            >
              <Trash2 size={14} />
              <span>Xóa toàn bộ {filtered.length} môn học</span>
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">Chưa có môn học nào</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="table-th w-10 text-center">
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && selectedIds.length === filtered.length}
                    onChange={toggleSelectAll}
                    className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="table-th">Tên môn học</th>
                <th className="table-th hidden md:table-cell">Danh mục</th>
                <th className="table-th hidden lg:table-cell">Tags</th>
                <th className="table-th hidden sm:table-cell">Loại</th>
                <th className="table-th hidden sm:table-cell">Lượt xem</th>
                <th className="table-th hidden sm:table-cell">Tệp</th>
                <th className="table-th text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(subj => {
                const tag = Array.isArray(subj.tags) ? subj.tags[0] : subj.tags
                const tagMeta = getTagMeta(tag)
                const catName = categories.find(c => c.id === subj.category_id)?.name || '—'
                const isSelected = selectedIds.includes(subj.id)
                return (
                  <tr key={subj.id} className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50/40' : ''}`}>
                    <td className="table-td w-10 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(subj.id)}
                        className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                    <td className="table-td">
                      <div className="font-semibold text-gray-800">{subj.name}</div>
                      <div className="text-xs text-gray-400 line-clamp-1 mt-0.5">{subj.description}</div>
                    </td>
                    <td className="table-td hidden md:table-cell text-xs text-gray-500">{catName}</td>
                    <td className="table-td hidden lg:table-cell">
                      {tag && (
                        <span className={`tag-badge ${tagMeta.bg} ${tagMeta.text}`}>{tag}</span>
                      )}
                    </td>
                    <td className="table-td hidden sm:table-cell">
                      <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {subj.type_tag || 'PDF'}
                      </span>
                    </td>
                    <td className="table-td hidden sm:table-cell">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Eye size={12} />
                        {formatViews(subj.views)}
                      </div>
                    </td>
                    <td className="table-td hidden sm:table-cell">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Files size={12} />
                        {subj.file_count || 0}
                      </div>
                    </td>
                    <td className="table-td text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => startEdit(subj)} className="btn-secondary !py-1.5 !px-3 text-xs">
                          <Pencil size={13} /> Sửa
                        </button>
                        <button onClick={() => handleDelete(subj.id)} className="btn-danger">
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
