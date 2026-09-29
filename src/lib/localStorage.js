// ─── LocalStorage persistence layer ──────────────────────────
// Dữ liệu được lưu vào localStorage để tồn tại qua các lần reload.
// Khi kết nối Supabase thật thì layer này không dùng nữa.

const KEYS = {
  categories: 'uth_categories',
  subjects: 'uth_subjects',
  files: 'uth_files',
}

// Seed data (chỉ dùng lần đầu khi localStorage chưa có gì)
const SEED_CATEGORIES = [
  { id: 1, name: 'Logistics & Chuỗi cung ứng', icon: 'Truck', slug: 'logistics' },
  { id: 2, name: 'Công nghệ Thông tin (IT)', icon: 'Code2', slug: 'it' },
  { id: 3, name: 'Kinh tế Vận tải', icon: 'BarChart3', slug: 'kinh-te' },
  { id: 4, name: 'Cơ sở & Đại cương', icon: 'BookOpen', slug: 'co-so' },
]

const SEED_SUBJECTS = [
  {
    id: 1, category_id: 1, name: 'Tư duy phân tích', slug: 'tu-duy-phan-tich',
    description: 'Kỹ thuật mô hình hóa dữ liệu, giải quyết tình huống vận hành chuỗi.',
    tags: ['Cơ bản'], type_tag: 'PDF', views: 12400, file_count: 0,
  },
  {
    id: 2, category_id: 1, name: 'Quản trị Chuỗi cung ứng', slug: 'quan-tri-chuoi-cung-ung',
    description: 'Nguyên lý SCM, hoạch định phân phối và quản trị tồn kho toàn diện.',
    tags: ['Chuyên ngành'], type_tag: 'PDF', views: 8700, file_count: 0,
  },
  {
    id: 3, category_id: 1, name: 'E-Logistics', slug: 'e-logistics',
    description: 'Hệ thống thương mại điện tử, tự động hóa kho hàng và chặng cuối.',
    tags: ['Chuyên sâu'], type_tag: 'DOC', views: 6300, file_count: 0,
  },
  {
    id: 4, category_id: 1, name: 'Logistics quốc tế', slug: 'logistics-quoc-te',
    description: 'Incoterms 2020, quy trình hải quan, cước vận tải biển & hàng không.',
    tags: ['Bắt buộc'], type_tag: 'PDF', views: 5800, file_count: 0,
  },
  {
    id: 5, category_id: 1, name: 'Marketing trong Logistics', slug: 'marketing-logistics',
    description: 'Chiến lược dịch vụ B2B, định giá giải pháp vận chuyển tích hợp.',
    tags: ['Cơ bản'], type_tag: 'PDF', views: 4800, file_count: 0,
  },
  {
    id: 6, category_id: 1, name: 'Vận tải đa phương thức', slug: 'van-tai-da-phuong-thuc',
    description: 'Tổ chức gom hàng, công ước quốc tế và chứng từ vận tải kết hợp.',
    tags: ['Chuyên ngành'], type_tag: 'PDF', views: 5100, file_count: 0,
  },
  {
    id: 7, category_id: 3, name: 'Kinh tế vận tải', slug: 'kinh-te-van-tai',
    description: 'Hạch toán chi phí chuyên đi, điểm hòa vốn đội xe và khai thác tuyến.',
    tags: ['Bắt buộc'], type_tag: 'PDF', views: 4200, file_count: 0,
  },
  {
    id: 8, category_id: 3, name: 'Excel trong công việc', slug: 'excel-cong-viec',
    description: 'File tính tự động, Pivot Table & hàm phân tích chi phí giao nhận.',
    tags: ['Thực hành'], type_tag: 'XLS', views: 5600, file_count: 0,
  },
  {
    id: 9, category_id: 2, name: 'Lập trình Python', slug: 'lap-trinh-python',
    description: 'Từ cơ bản đến nâng cao, ứng dụng trong phân tích dữ liệu logistics.',
    tags: ['Cơ sở'], type_tag: 'PDF', views: 3900, file_count: 0,
  },
  {
    id: 10, category_id: 2, name: 'Cơ sở dữ liệu', slug: 'co-so-du-lieu',
    description: 'SQL, thiết kế ERD và quản trị hệ thống thông tin quản lý.',
    tags: ['Cơ bản'], type_tag: 'PDF', views: 3100, file_count: 0,
  },
  {
    id: 11, category_id: 4, name: 'Toán cao cấp', slug: 'toan-cao-cap',
    description: 'Giải tích, ma trận và xác suất thống kê ứng dụng trong kinh tế.',
    tags: ['Bắt buộc'], type_tag: 'PDF', views: 7200, file_count: 0,
  },
  {
    id: 12, category_id: 4, name: 'Tiếng Anh chuyên ngành', slug: 'tieng-anh-chuyen-nganh',
    description: 'Từ vựng logistics, đọc hiểu tài liệu quốc tế và viết email thương mại.',
    tags: ['Cơ sở'], type_tag: 'PDF', views: 6800, file_count: 0,
  },
]

const SEED_FILES = []

// ─── Generic helpers ──────────────────────────────────────────
function load(key, seed) {
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw)
  } catch {}
  // First run: seed and save
  localStorage.setItem(key, JSON.stringify(seed))
  return seed
}

function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data))
}

function nextId(items) {
  return items.length === 0 ? 1 : Math.max(...items.map(i => i.id)) + 1
}

// ─── Categories ───────────────────────────────────────────────
export function lsGetCategories() {
  return load(KEYS.categories, SEED_CATEGORIES)
}
export function lsCreateCategory(name) {
  const items = lsGetCategories()
  const newItem = { id: nextId(items), name, icon: 'BookOpen', slug: name.toLowerCase().replace(/\s+/g, '-') }
  items.push(newItem)
  save(KEYS.categories, items)
  return newItem
}
export function lsUpdateCategory(id, name) {
  const items = lsGetCategories()
  const item = items.find(i => i.id === id)
  if (item) { item.name = name; save(KEYS.categories, items) }
  return item
}
export function lsDeleteCategory(id) {
  const items = lsGetCategories().filter(i => i.id !== id)
  save(KEYS.categories, items)
}

// ─── Subjects ─────────────────────────────────────────────────
export function lsGetSubjects(categoryId = null) {
  const items = load(KEYS.subjects, SEED_SUBJECTS)
  const categories = lsGetCategories()
  const catMap = {}
  categories.forEach(c => { catMap[c.id] = c })
  // Sync file_count from files & categories info
  const files = lsGetFiles()
  items.forEach(s => {
    s.file_count = files.filter(f => f.subject_id === s.id).length
    if (catMap[s.category_id]) {
      s.categories = { name: catMap[s.category_id].name }
    }
  })
  return categoryId ? items.filter(s => s.category_id === categoryId) : items
}
export function lsCreateSubject(payload) {
  const items = load(KEYS.subjects, SEED_SUBJECTS)
  if (Array.isArray(payload)) {
    let currentMaxId = items.length === 0 ? 0 : Math.max(...items.map(i => i.id))
    const created = payload.map(p => {
      currentMaxId += 1
      return { id: currentMaxId, views: 0, file_count: 0, ...p }
    })
    items.push(...created)
    save(KEYS.subjects, items)
    return created
  }
  const newItem = { id: nextId(items), views: 0, file_count: 0, ...payload }
  items.push(newItem)
  save(KEYS.subjects, items)
  return newItem
}
export function lsUpdateSubject(id, payload) {
  const items = load(KEYS.subjects, SEED_SUBJECTS)
  const item = items.find(i => i.id === id)
  if (item) { Object.assign(item, payload); save(KEYS.subjects, items) }
  return item
}
export function lsDeleteSubject(id) {
  const items = load(KEYS.subjects, SEED_SUBJECTS).filter(i => i.id !== id)
  save(KEYS.subjects, items)
  // Also delete related files
  const files = lsGetFiles().filter(f => f.subject_id !== id)
  save(KEYS.files, files)
}
export function lsDeleteSubjects(ids) {
  const idSet = new Set(ids.map(Number))
  const items = load(KEYS.subjects, SEED_SUBJECTS).filter(i => !idSet.has(Number(i.id)))
  save(KEYS.subjects, items)
  const files = lsGetFiles().filter(f => !idSet.has(Number(f.subject_id)))
  save(KEYS.files, files)
}
export function lsIncrementViews(id) {
  const items = load(KEYS.subjects, SEED_SUBJECTS)
  const item = items.find(i => i.id === id)
  if (item) { item.views = (item.views || 0) + 1; save(KEYS.subjects, items) }
}
export function lsSearchSubjects(query) {
  const q = query.toLowerCase()
  return lsGetSubjects().filter(
    s => s.name.toLowerCase().includes(q) || (s.description || '').toLowerCase().includes(q)
  )
}

// ─── Files ────────────────────────────────────────────────────
export function lsGetFiles(subjectId = null) {
  const items = load(KEYS.files, SEED_FILES)
  return subjectId ? items.filter(f => f.subject_id === subjectId) : items
}
export function lsCreateFile(payload) {
  const items = load(KEYS.files, SEED_FILES)
  const newItem = {
    id: nextId(items),
    created_at: new Date().toISOString().split('T')[0],
    ...payload,
  }
  items.push(newItem)
  save(KEYS.files, items)
  return newItem
}
export function lsUpdateFile(id, payload) {
  const items = load(KEYS.files, SEED_FILES)
  const item = items.find(i => i.id === id)
  if (item) { Object.assign(item, payload); save(KEYS.files, items) }
  return item
}
export function lsDeleteFile(id) {
  const items = load(KEYS.files, SEED_FILES).filter(i => i.id !== id)
  save(KEYS.files, items)
}

// ─── Reset (xóa toàn bộ về mặc định) ─────────────────────────
export function lsReset() {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k))
}
