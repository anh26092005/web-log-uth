import React, { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Check, X, AlertCircle } from 'lucide-react'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../lib/api'

export default function CategoriesPanel() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    const { data } = await getCategories()
    if (data) setCategories(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    setSaving(true)
    setError('')
    const { error: err } = await createCategory(newName.trim())
    if (err) setError(err.message)
    else { setNewName(''); await load() }
    setSaving(false)
  }

  const startEdit = (cat) => {
    setEditingId(cat.id)
    setEditName(cat.name)
  }

  const cancelEdit = () => { setEditingId(null); setEditName('') }

  const handleEdit = async (id) => {
    if (!editName.trim()) return
    setSaving(true)
    setError('')
    const { error: err } = await updateCategory(id, editName.trim())
    if (err) setError(err.message)
    else { cancelEdit(); await load() }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Xóa danh mục này? Các môn học thuộc danh mục sẽ không bị xóa.')) return
    const { error: err } = await deleteCategory(id)
    if (err) setError(err.message)
    else await load()
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900">Quản lý Danh mục</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Thêm, sửa, xóa danh mục chuyên ngành</p>
        </div>
        <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full self-start sm:self-auto">
          {categories.length} danh mục
        </span>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs sm:text-sm text-red-600 bg-red-50 border border-red-200 px-3.5 py-2.5 rounded-lg">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError('')} className="p-1 cursor-pointer"><X size={14} /></button>
        </div>
      )}

      {/* Add form */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-xs">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2.5">Thêm danh mục mới</h3>
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Tên danh mục (vd: Logistics & Chuỗi cung ứng)"
            className="input-field flex-1"
          />
          <button type="submit" disabled={saving || !newName.trim()} className="btn-primary justify-center flex-shrink-0">
            <Plus size={16} />
            <span>Thêm danh mục</span>
          </button>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Đang tải...</div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">Chưa có danh mục nào</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="table-th w-10">#</th>
                  <th className="table-th">Tên danh mục</th>
                  <th className="table-th text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {categories.map((cat, i) => (
                  <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-td text-gray-400 text-xs w-10">{i + 1}</td>
                    <td className="table-td">
                      {editingId === cat.id ? (
                        <input
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          onKeyDown={e => e.key === 'Escape' && cancelEdit()}
                          className="input-field w-full max-w-sm"
                          autoFocus
                        />
                      ) : (
                        <span className="font-semibold text-gray-900 text-sm">{cat.name}</span>
                      )}
                    </td>
                    <td className="table-td text-right">
                      <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                        {editingId === cat.id ? (
                          <>
                            <button
                              onClick={() => handleEdit(cat.id)}
                              disabled={saving}
                              className="btn-primary !py-1 !px-2.5 text-xs"
                            >
                              <Check size={13} /> Lưu
                            </button>
                            <button onClick={cancelEdit} className="btn-secondary !py-1 !px-2.5 text-xs">
                              <X size={13} /> Hủy
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(cat)} className="btn-secondary !py-1 !px-2.5 text-xs">
                              <Pencil size={13} /> Sửa
                            </button>
                            <button onClick={() => handleDelete(cat.id)} className="btn-danger !py-1 !px-2.5 text-xs">
                              <Trash2 size={13} /> Xóa
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

