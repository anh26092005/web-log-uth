// Mock data used when Supabase is not yet configured
export const mockCategories = [
  { id: 1, name: 'Logistics & Chuỗi cung ứng', icon: 'Truck', slug: 'logistics' },
  { id: 2, name: 'Công nghệ Thông tin (IT)', icon: 'Code2', slug: 'it' },
  { id: 3, name: 'Kinh tế Vận tải', icon: 'BarChart3', slug: 'kinh-te' },
  { id: 4, name: 'Cơ sở & Đại cương', icon: 'BookOpen', slug: 'co-so' },
]

export const mockSubjects = [
  {
    id: 1, category_id: 1, name: 'Tư duy phân tích', slug: 'tu-duy-phan-tich',
    description: 'Kỹ thuật mô hình hóa dữ liệu, giải quyết tình huống vận hành chuỗi.',
    tags: ['Cơ bản'], type_tag: 'PDF', views: 12400, file_count: 8,
    cover_color: '#EFF6FF',
  },
  {
    id: 2, category_id: 1, name: 'Quản trị Chuỗi cung ứng', slug: 'quan-tri-chuoi-cung-ung',
    description: 'Nguyên lý SCM, hoạch định phân phối và quản trị tồn kho toàn diện.',
    tags: ['Chuyên ngành'], type_tag: 'PDF', views: 8700, file_count: 12,
    cover_color: '#F0FDF4',
  },
  {
    id: 3, category_id: 1, name: 'E-Logistics', slug: 'e-logistics',
    description: 'Hệ thống thương mại điện tử, tự động hóa kho hàng và chặng cuối.',
    tags: ['Chuyên sâu'], type_tag: 'DOC', views: 6300, file_count: 8,
    cover_color: '#FFF7ED',
  },
  {
    id: 4, category_id: 1, name: 'Logistics quốc tế', slug: 'logistics-quoc-te',
    description: 'Incoterms 2020, quy trình hải quan, cước vận tải biển & hàng không.',
    tags: ['Bắt buộc'], type_tag: 'PDF', views: 5800, file_count: 15,
    cover_color: '#FDF4FF',
  },
  {
    id: 5, category_id: 1, name: 'Marketing trong Logistics', slug: 'marketing-logistics',
    description: 'Chiến lược dịch vụ B2B, định giá giải pháp vận chuyển tích hợp.',
    tags: ['Cơ bản'], type_tag: 'PDF', views: 4800, file_count: 6,
    cover_color: '#FFFBEB',
  },
  {
    id: 6, category_id: 1, name: 'Vận tải đa phương thức', slug: 'van-tai-da-phuong-thuc',
    description: 'Tổ chức gom hàng, công ước quốc tế và chứng từ vận tải kết hợp.',
    tags: ['Chuyên ngành'], type_tag: 'PDF', views: 5100, file_count: 11,
    cover_color: '#F0FDFA',
  },
  {
    id: 7, category_id: 3, name: 'Kinh tế vận tải', slug: 'kinh-te-van-tai',
    description: 'Hạch toán chi phí chuyên đi, điểm hòa vốn đội xe và khai thác tuyến.',
    tags: ['Bắt buộc'], type_tag: 'PDF', views: 4200, file_count: 9,
    cover_color: '#ECFDF5',
  },
  {
    id: 8, category_id: 3, name: 'Excel trong công việc', slug: 'excel-cong-viec',
    description: 'File tính tự động, Pivot Table & hàm phân tích chi phí giao nhận.',
    tags: ['Thực hành'], type_tag: 'XLS', views: 5600, file_count: 14,
    cover_color: '#F0FDF4',
  },
  {
    id: 9, category_id: 2, name: 'Lập trình Python', slug: 'lap-trinh-python',
    description: 'Từ cơ bản đến nâng cao, ứng dụng trong phân tích dữ liệu logistics.',
    tags: ['Cơ sở'], type_tag: 'PDF', views: 3900, file_count: 7,
    cover_color: '#EFF6FF',
  },
  {
    id: 10, category_id: 2, name: 'Cơ sở dữ liệu', slug: 'co-so-du-lieu',
    description: 'SQL, thiết kế ERD và quản trị hệ thống thông tin quản lý.',
    tags: ['Cơ bản'], type_tag: 'PDF', views: 3100, file_count: 5,
    cover_color: '#FFF7ED',
  },
  {
    id: 11, category_id: 4, name: 'Toán cao cấp', slug: 'toan-cao-cap',
    description: 'Giải tích, ma trận và xác suất thống kê ứng dụng trong kinh tế.',
    tags: ['Bắt buộc'], type_tag: 'PDF', views: 7200, file_count: 10,
    cover_color: '#F5F3FF',
  },
  {
    id: 12, category_id: 4, name: 'Tiếng Anh chuyên ngành', slug: 'tieng-anh-chuyen-nganh',
    description: 'Từ vựng logistics, đọc hiểu tài liệu quốc tế và viết email thương mại.',
    tags: ['Cơ sở'], type_tag: 'PDF', views: 6800, file_count: 13,
    cover_color: '#FDF4FF',
  },
]

export const mockFiles = [
  {
    id: 1, subject_id: 1, name: 'Chương 1 - Tổng quan tư duy phân tích.pdf',
    type: 'pdf', size: '2.4 MB', preview_url: 'https://drive.google.com/file/d/EXAMPLE/preview',
    created_at: '2024-01-15',
  },
  {
    id: 2, subject_id: 1, name: 'Chương 2 - Mô hình hóa dữ liệu.pdf',
    type: 'pdf', size: '3.1 MB', preview_url: 'https://drive.google.com/file/d/EXAMPLE/preview',
    created_at: '2024-01-20',
  },
  {
    id: 3, subject_id: 1, name: 'Đề cương ôn thi cuối kỳ.pdf',
    type: 'pdf', size: '1.2 MB', preview_url: 'https://drive.google.com/file/d/EXAMPLE/preview',
    created_at: '2024-02-01',
  },
  {
    id: 4, subject_id: 1, name: 'Bài tập thực hành tuần 5.docx',
    type: 'doc', size: '0.8 MB', preview_url: 'https://drive.google.com/file/d/EXAMPLE/preview',
    created_at: '2024-02-10',
  },
  {
    id: 5, subject_id: 2, name: 'Slide bài giảng SCM - Full.pdf',
    type: 'pdf', size: '5.7 MB', preview_url: 'https://drive.google.com/file/d/EXAMPLE/preview',
    created_at: '2024-01-10',
  },
  {
    id: 6, subject_id: 2, name: 'Case study - Tồn kho Toyota.pdf',
    type: 'pdf', size: '1.9 MB', preview_url: 'https://drive.google.com/file/d/EXAMPLE/preview',
    created_at: '2024-01-25',
  },
]

export const mockTips = [
  { id: 1, abbr: 'SD', color: '#3B82F6', title: 'Bypass Studocu', desc: 'Tải tài liệu trên studocu nhanh gọn', video_url: '' },
  { id: 2, abbr: 'SC', color: '#10B981', title: 'Tải Scribd Downloader', desc: 'tải xuống chỉ cần url', video_url: '' },
  { id: 3, abbr: 'QZ', color: '#F59E0B', title: 'Cách tra cứu Quiz UTH siêu nhanh', desc: 'tra cứu quiz UTH với AI siêu nhanh', video_url: '' },
  { id: 4, abbr: 'AI', color: '#8B5CF6', title: 'Deep Search Tiểu luận', desc: 'Gợi ý dàn bài chuẩn', video_url: '' },
]

 0987055081