import React, { useState, useEffect, useRef } from 'react'
import { Plus, Pencil, Trash2, X, AlertCircle, Link, FileText, Eye } from 'lucide-react'
import { getFiles, createFile, updateFile, deleteFile, getSubjects, uploadFileToStorage, getCategories, createSubject } from '../../lib/api'
import { getTypeMeta, formatDate } from '../../lib/utils'
import { PDFDocument } from 'pdf-lib'
import { v4 as uuidv4 } from 'uuid'

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
  const [uploadFileObj, setUploadFileObj] = useState(null)
  
  // Bulk import state
  const [showBulk, setShowBulk] = useState(false)
  const [bulkSubjectId, setBulkSubjectId] = useState('')
  const [bulkStatus, setBulkStatus] = useState('')
  const [bulkProgress, setBulkProgress] = useState(0)
  const [bulkTotal, setBulkTotal] = useState(0)
  const folderInputRef = useRef(null)
  
  // Bulk delete state
  const [selectedIds, setSelectedIds] = useState([])

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
    setSelectedIds([]) // clear selection when filter changes
  }, [filterSubj])

  const resetForm = () => {
    setForm(INITIAL_FORM)
    setEditingId(null)
    setShowForm(false)
    setError('')
    setUploadFileObj(null)
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
    if (!form.name.trim() || !form.subject_id) {
      setError('Vui lòng điền đầy đủ: tên tệp, môn học.')
      return
    }
    if (!editingId && !uploadFileObj && !form.preview_url) {
      setError('Vui lòng chọn file tải lên hoặc nhập link preview.')
      return
    }
    
    setSaving(true)
    setError('')
    
    try {
      let finalPreviewUrl = form.preview_url
      
      if (uploadFileObj) {
        let finalFileToUpload = uploadFileObj
        
        // Nếu là PDF thì tự động cắt lấy 5% trang đầu
        if (uploadFileObj.type === 'application/pdf') {
          const arrayBuffer = await uploadFileObj.arrayBuffer()
          const pdfDoc = await PDFDocument.load(arrayBuffer)
          const pageCount = pdfDoc.getPageCount()
          const pagesToKeep = Math.max(1, Math.ceil(pageCount * 0.05)) // Cắt 5%
          
          const previewPdf = await PDFDocument.create()
          const copiedPages = await previewPdf.copyPages(pdfDoc, Array.from({length: pagesToKeep}, (_, i) => i))
          copiedPages.forEach(page => previewPdf.addPage(page))
          
          const previewBytes = await previewPdf.save()
          const previewBlob = new Blob([previewBytes], { type: 'application/pdf' })
          finalFileToUpload = new File([previewBlob], `preview_${uploadFileObj.name}`, { type: 'application/pdf' })
        }
        
        // Loại bỏ dấu tiếng Việt và ký tự đặc biệt để Supabase không báo lỗi Invalid key
        const safeName = finalFileToUpload.name
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "") // Bỏ dấu
          .replace(/đ/g, "d").replace(/Đ/g, "D") // Đổi đ thành d
          .replace(/[^a-zA-Z0-9.\-_]/g, "_") // Đổi ký tự lạ thành _
          
        const path = `previews/${uuidv4()}_${safeName}`
        finalPreviewUrl = await uploadFileToStorage(finalFileToUpload, path)
      }

      const payload = {
        ...form,
        subject_id: Number(form.subject_id),
        preview_url: finalPreviewUrl,
      }
      
      const fn = editingId ? updateFile(editingId, payload) : createFile(payload)
      const { error: err } = await fn
      
      if (err) throw err
      
      await load(filterSubj || null)
      resetForm()
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi tải lên.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Xóa tệp này?')) return
    const { error: err } = await deleteFile(id)
    if (err) setError(err.message)
    else {
      setSelectedIds(prev => prev.filter(x => x !== id))
      await load(filterSubj || null)
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} tệp đã chọn?`)) return
    
    let errCount = 0
    for (const id of selectedIds) {
      const { error: err } = await deleteFile(id)
      if (err) errCount++
    }
    
    if (errCount > 0) setError(`Có lỗi khi xóa ${errCount} tệp.`)
    setSelectedIds([])
    await load(filterSubj || null)
  }

  const toggleSelectAll = () => {
    if (files.length === 0) return
    if (selectedIds.length === files.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(files.map(f => f.id))
    }
  }

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const getSubjectName = (id) => subjects.find(s => s.id === id)?.name || '—'

  // --- Bulk Import Logic ---
  const handleBulkFolderSelect = async (e) => {
    const filesArray = Array.from(e.target.files)
    if (!filesArray.length) return
    if (!bulkSubjectId) {
      alert('Vui lòng chọn môn học trước khi tải lên thư mục!')
      return
    }

    // Filter documents - CHỈ CHẤP NHẬN FILE PDF
    const docFiles = filesArray.filter(f => f.name.match(/\.(pdf)$/i))
    if (!docFiles.length) {
      alert('Không tìm thấy tài liệu PDF nào trong thư mục này. Các loại file khác đã bị tự động bỏ qua.')
      return
    }

    setBulkTotal(docFiles.length)
    setBulkProgress(0)
    setBulkStatus('Đang xử lý...')

    let successCount = 0

    for (let i = 0; i < docFiles.length; i++) {
      const file = docFiles[i]
      setBulkStatus(`Đang xử lý file ${i+1}/${docFiles.length}: ${file.name}`)

      try {
        // Process file
        let finalFileToUpload = file
        if (file.type === 'application/pdf') {
          const arrayBuffer = await file.arrayBuffer()
          const pdfDoc = await PDFDocument.load(arrayBuffer)
          const pageCount = pdfDoc.getPageCount()
          const pagesToKeep = Math.max(1, Math.ceil(pageCount * 0.05))
          const previewPdf = await PDFDocument.create()
          const copiedPages = await previewPdf.copyPages(pdfDoc, Array.from({length: pagesToKeep}, (_, i) => i))
          copiedPages.forEach(p => previewPdf.addPage(p))
          const previewBytes = await previewPdf.save()
          finalFileToUpload = new File([previewBytes], `preview_${file.name}`, { type: 'application/pdf' })
        }

        const safeName = finalFileToUpload.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").replace(/[^a-zA-Z0-9.\-_]/g, "_")
        const storagePath = `previews/${uuidv4()}_${safeName}`
        const previewUrl = await uploadFileToStorage(finalFileToUpload, storagePath)

        // Determine extension for type
        const extMatch = file.name.match(/\.([a-z]+)$/i)
        const type = extMatch ? extMatch[1].toLowerCase() : 'pdf'

        await createFile({
          subject_id: Number(bulkSubjectId),
          name: file.name,
          type: type,
          size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
          preview_url: previewUrl
        })
        
        successCount++
      } catch (err) {
        console.error("Lỗi file", file.name, err)
      }
      setBulkProgress(i + 1)
    }

    setBulkStatus(`Hoàn tất! Đã tải lên thành công ${successCount}/${docFiles.length} file.`)
    await load(filterSubj || null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Quản lý Tài liệu</h2>
          <p className="text-sm text-gray-500 mt-0.5">Thêm link Google Drive preview hoặc thông tin tệp vào môn học</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowBulk(!showBulk)} className="btn-secondary">
            📁 Tải lên cả thư mục
          </button>
          <button onClick={startAdd} className="btn-primary">
            <Plus size={16} /> Thêm tài liệu
          </button>
        </div>
      </div>

      {/* Bulk Import UI */}
      {showBulk && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-blue-900">Tải lên hàng loạt từ thư mục</h3>
              <p className="text-xs text-blue-700 mt-1 max-w-xl">
                Tất cả các tài liệu (PDF, DOC...) trong thư mục bạn chọn sẽ được tải lên và gắn vào Môn học bạn chọn ở dưới đây. Các file PDF sẽ tự động được cắt 5%.
              </p>
            </div>
            <button onClick={() => setShowBulk(false)}><X size={18} className="text-blue-500"/></button>
          </div>
          
          <div className="flex items-center gap-3 mb-4">
            <select
              value={bulkSubjectId}
              onChange={e => setBulkSubjectId(e.target.value)}
              className="input-field bg-white max-w-xs"
            >
              <option value="">-- Chọn Môn học để thêm tài liệu --</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            
            <button 
              onClick={() => folderInputRef.current?.click()}
              className="btn-primary bg-blue-600 hover:bg-blue-700"
              disabled={!bulkSubjectId}
            >
              Chọn thư mục máy tính
            </button>
            <input 
              type="file" 
              ref={folderInputRef}
              webkitdirectory="" 
              directory="" 
              multiple 
              className="hidden"
              onChange={handleBulkFolderSelect}
            />
          </div>

          {bulkTotal > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-blue-800">
                <span>{bulkStatus}</span>
                <span>{bulkProgress} / {bulkTotal}</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${(bulkProgress / bulkTotal) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

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
                Tải lên tệp (Tự động cắt 5% nếu là PDF)
              </label>
              <input
                type="file"
                onChange={e => {
                  const file = e.target.files[0]
                  if (file) {
                    setUploadFileObj(file)
                    if (!form.name) {
                      setForm(f => ({ ...f, name: file.name, size: (file.size / 1024 / 1024).toFixed(2) + ' MB' }))
                    }
                  }
                }}
                className="input-field py-1.5"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              />
              <div className="mt-2 text-xs text-gray-400">
                Hoặc giữ nguyên link Google Drive hiện tại (nếu đang sửa tệp)
              </div>
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
        {selectedIds.length > 0 && (
          <div className="bg-blue-50 px-4 py-2 border-b border-blue-100 flex items-center justify-between">
            <span className="text-sm text-blue-800 font-medium">Đã chọn {selectedIds.length} tệp</span>
            <button onClick={handleBulkDelete} className="btn-danger !py-1.5 text-xs flex items-center gap-1.5">
              <Trash2 size={14} /> Xóa {selectedIds.length} tệp
            </button>
          </div>
        )}
        
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Đang tải...</div>
        ) : files.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">Chưa có tài liệu nào</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="table-th w-10 text-center">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={files.length > 0 && selectedIds.length === files.length} 
                    onChange={toggleSelectAll} 
                  />
                </th>
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
                  <tr key={file.id} className={`hover:bg-gray-50 transition-colors ${selectedIds.includes(file.id) ? 'bg-blue-50/50' : ''}`}>
                    <td className="table-td text-center">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={selectedIds.includes(file.id)} 
                        onChange={() => toggleSelect(file.id)} 
                      />
                    </td>
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
