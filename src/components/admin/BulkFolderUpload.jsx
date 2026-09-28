import React, { useState, useRef } from 'react'
import { X, UploadCloud, FolderCheck, AlertCircle, CheckCircle2 } from 'lucide-react'
import { PDFDocument } from 'pdf-lib'
import { v4 as uuidv4 } from 'uuid'
import { uploadFileToStorage, createSubject, createFile, getSubjects } from '../../lib/api'

export default function BulkFolderUpload({ categories, subjects, onComplete, onClose }) {
  const [mode, setMode] = useState('multi') // 'multi' (subfolders = subjects) or 'single' (all files into 1 subject)
  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0]?.id || '')
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '')
  const [previewGroups, setPreviewGroups] = useState(null)
  
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [total, setTotal] = useState(0)
  const [statusText, setStatusText] = useState('')
  const [completeSummary, setCompleteSummary] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  const fileInputRef = useRef(null)

  const handleFolderSelect = (e) => {
    const rawFiles = Array.from(e.target.files || [])
    if (!rawFiles.length) return

    setErrorMessage('')
    setCompleteSummary(null)

    // Filter strictly PDF files
    const pdfFiles = rawFiles.filter(f => f.name.match(/\.(pdf)$/i))
    if (!pdfFiles.length) {
      setErrorMessage('Không tìm thấy tài liệu PDF nào trong thư mục được chọn. Các file khác đã được tự động bỏ qua.')
      return
    }

    if (mode === 'single') {
      if (!selectedSubjectId) {
        setErrorMessage('Vui lòng chọn môn học đích trước khi tải lên!')
        return
      }
      const subj = subjects.find(s => String(s.id) === String(selectedSubjectId))
      setPreviewGroups({
        [subj?.name || 'Môn học đã chọn']: pdfFiles
      })
    } else {
      // Multi-subject mode: group by immediate subfolder name
      const groups = {}
      for (const file of pdfFiles) {
        const parts = file.webkitRelativePath ? file.webkitRelativePath.split('/') : [file.name]
        let subjName = ''
        if (parts.length >= 3) {
          // Folder/SubjectName/.../file.pdf
          subjName = parts[1].trim()
        } else if (parts.length === 2) {
          // SubjectName/file.pdf
          subjName = parts[0].trim()
        } else {
          subjName = 'Chung'
        }

        if (!groups[subjName]) groups[subjName] = []
        groups[subjName].push(file)
      }
      setPreviewGroups(groups)
    }
  }

  const handleStartUpload = async () => {
    if (!previewGroups) return
    if (mode === 'multi' && !selectedCategoryId) {
      setErrorMessage('Vui lòng chọn Danh mục chuyên ngành cho các môn học mới!')
      return
    }

    setIsUploading(true)
    setErrorMessage('')
    const entries = Object.entries(previewGroups)
    let totalFiles = 0
    entries.forEach(([_, list]) => { totalFiles += list.length })

    setTotal(totalFiles)
    setProgress(0)
    setStatusText('Đang kiểm tra danh sách môn học...')

    try {
      // Fetch latest subjects list from server
      const { data: latestSubjects } = await getSubjects()
      const currentSubjects = latestSubjects ? [...latestSubjects] : [...subjects]

      let processedFiles = 0
      let successFiles = 0
      let createdSubjectsCount = 0

      for (let sIdx = 0; sIdx < entries.length; sIdx++) {
        const [subjName, fileList] = entries[sIdx]
        let targetSubjId = null

        if (mode === 'single') {
          targetSubjId = Number(selectedSubjectId)
        } else {
          const norm = str => str.trim().toLowerCase()
          let existing = currentSubjects.find(s => norm(s.name) === norm(subjName))
          
          if (!existing) {
            setStatusText(`Đang tạo môn học mới: "${subjName}"...`)
            const { data: newSubj, error: cErr } = await createSubject({
              name: subjName,
              category_id: Number(selectedCategoryId),
              type_tag: 'PDF'
            })
            if (cErr) throw cErr
            if (newSubj) {
              existing = Array.isArray(newSubj) ? newSubj[0] : newSubj
              currentSubjects.push(existing)
              createdSubjectsCount++
            }
          }

          if (existing) {
            targetSubjId = existing.id
          }
        }

        if (!targetSubjId) {
          processedFiles += fileList.length
          setProgress(processedFiles)
          continue
        }

        // Process files in this subject
        for (const file of fileList) {
          setStatusText(`[Môn ${sIdx + 1}/${entries.length}: ${subjName}] Đang cắt 15% & tải lên: ${file.name}`)

          try {
            let finalFileToUpload = file

            // Slice PDF to 15% preview
            if (file.type === 'application/pdf') {
              const arrayBuffer = await file.arrayBuffer()
              const pdfDoc = await PDFDocument.load(arrayBuffer)
              const pageCount = pdfDoc.getPageCount()
              const pagesToKeep = Math.max(1, Math.ceil(pageCount * 0.15))

              const previewPdf = await PDFDocument.create()
              const copiedPages = await previewPdf.copyPages(pdfDoc, Array.from({ length: pagesToKeep }, (_, i) => i))
              copiedPages.forEach(p => previewPdf.addPage(p))

              const previewBytes = await previewPdf.save()
              finalFileToUpload = new File([previewBytes], `preview_${file.name}`, { type: 'application/pdf' })
            }

            const safeName = finalFileToUpload.name
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .replace(/đ/g, "d").replace(/Đ/g, "D")
              .replace(/[^a-zA-Z0-9.\-_]/g, "_")

            const storagePath = `previews/${uuidv4()}_${safeName}`
            const previewUrl = await uploadFileToStorage(finalFileToUpload, storagePath)

            await createFile({
              subject_id: targetSubjId,
              name: file.name,
              type: 'pdf',
              size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
              preview_url: previewUrl
            })

            successFiles++
          } catch (fileErr) {
            console.error(`Lỗi khi tải file ${file.name}:`, fileErr)
          }

          processedFiles++
          setProgress(processedFiles)
        }
      }

      setCompleteSummary({
        subjectsCount: entries.length,
        createdSubjectsCount,
        totalFiles,
        successFiles
      })
      setPreviewGroups(null)
      if (onComplete) await onComplete()
    } catch (err) {
      setErrorMessage(err.message || 'Đã xảy ra lỗi trong quá trình tải lên.')
    } finally {
      setIsUploading(false)
    }
  }

  const totalPreviewFiles = previewGroups
    ? Object.values(previewGroups).reduce((acc, list) => acc + list.length, 0)
    : 0

  return (
    <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-6 shadow-sm">
      <div className="flex justify-between items-start mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📁</span>
            <h3 className="text-base font-bold text-gray-900">Tải lên hàng loạt từ Thư mục máy tính</h3>
          </div>
          <p className="text-xs text-gray-600 mt-1 max-w-2xl leading-relaxed">
            Hỗ trợ chọn thư mục lớn chứa nhiều thư mục con. Hệ thống sẽ tự động lấy tên mỗi thư mục con làm tên môn học, tự tạo môn học mới và tải các file PDF (đã tự động cắt 15% trang đầu) vào đúng môn.
          </p>
        </div>
        {onClose && !isUploading && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
            <X size={20} />
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-xl mb-4">
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage('')} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      {/* Mode Selector */}
      <div className="flex items-center gap-2 p-1 bg-white border border-blue-200 rounded-xl mb-5 w-fit">
        <button
          type="button"
          disabled={isUploading}
          onClick={() => { setMode('multi'); setPreviewGroups(null); }}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            mode === 'multi'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🌟 Thư mục nhiều môn (Mỗi thư mục con = 1 môn)
        </button>
        <button
          type="button"
          disabled={isUploading}
          onClick={() => { setMode('single'); setPreviewGroups(null); }}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            mode === 'single'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📄 Thư mục của 1 môn cụ thể
        </button>
      </div>

      {/* Configuration row */}
      {!previewGroups && !completeSummary && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
          {mode === 'multi' ? (
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Danh mục chuyên ngành cho các môn học mới:
              </label>
              <select
                value={selectedCategoryId}
                onChange={e => setSelectedCategoryId(e.target.value)}
                className="input-field bg-white"
                disabled={isUploading}
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Chọn Môn học nhận tài liệu:
              </label>
              <select
                value={selectedSubjectId}
                onChange={e => setSelectedSubjectId(e.target.value)}
                className="input-field bg-white"
                disabled={isUploading}
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="sm:self-end">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-primary w-full sm:w-auto h-[42px] justify-center gap-2 bg-blue-600 hover:bg-blue-700 font-bold"
              disabled={isUploading}
            >
              <UploadCloud size={18} />
              <span>Chọn thư mục từ máy tính</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              webkitdirectory=""
              directory=""
              multiple
              className="hidden"
              onChange={handleFolderSelect}
            />
          </div>
        </div>
      )}

      {/* Preview Breakdown Card */}
      {previewGroups && (
        <div className="bg-white rounded-xl border border-blue-200 p-5 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <FolderCheck size={20} className="text-emerald-600" />
              <span className="font-bold text-sm text-gray-900">
                Tìm thấy {Object.keys(previewGroups).length} môn học ({totalPreviewFiles} file PDF hợp lệ):
              </span>
            </div>
            {!isUploading && (
              <button
                type="button"
                onClick={() => setPreviewGroups(null)}
                className="text-xs font-semibold text-red-600 hover:underline"
              >
                Chọn thư mục khác
              </button>
            )}
          </div>

          <div className="max-h-56 overflow-y-auto space-y-1.5 pr-2 mb-4">
            {Object.entries(previewGroups).map(([name, fileList]) => (
              <div
                key={name}
                className="flex items-center justify-between bg-gray-50 border border-gray-200/70 px-3.5 py-2 rounded-lg text-xs"
              >
                <span className="font-semibold text-gray-800 truncate max-w-md">
                  📁 {name}
                </span>
                <span className="font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">
                  {fileList.length} file PDF
                </span>
              </div>
            ))}
          </div>

          {!isUploading && (
            <button
              type="button"
              onClick={handleStartUpload}
              className="btn-primary w-full justify-center bg-emerald-600 hover:bg-emerald-700 font-bold py-3 text-sm shadow-md shadow-emerald-600/20"
            >
              🚀 Bắt đầu tải lên & Tự động tạo môn ({totalPreviewFiles} file PDF)
            </button>
          )}
        </div>
      )}

      {/* Live Upload Progress */}
      {isUploading && total > 0 && (
        <div className="bg-white rounded-xl border border-blue-200 p-4 space-y-3">
          <div className="flex justify-between items-center text-xs font-bold text-blue-900">
            <span className="truncate max-w-lg">{statusText}</span>
            <span>{progress} / {total} files</span>
          </div>
          <div className="w-full bg-blue-100 rounded-full h-3 overflow-hidden">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(progress / total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Complete Summary Card */}
      {completeSummary && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex items-start gap-3">
          <CheckCircle2 size={24} className="text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-emerald-900 text-sm">Tải lên hoàn tất thành công!</h4>
            <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
              Đã xử lý <strong>{completeSummary.subjectsCount} môn học</strong> (tạo mới {completeSummary.createdSubjectsCount} môn), tải lên và cắt 15% thành công <strong>{completeSummary.successFiles}/{completeSummary.totalFiles} file PDF</strong>.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setCompleteSummary(null)}
                className="btn-primary !py-1.5 !px-3 text-xs bg-emerald-600 hover:bg-emerald-700"
              >
                Tải lên thư mục khác
              </button>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary !py-1.5 !px-3 text-xs"
                >
                  Đóng
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
