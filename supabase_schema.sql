-- =============================================
-- UTH Learning Materials — Supabase Schema
-- Run this in your Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Categories ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id        BIGSERIAL PRIMARY KEY,
  name      TEXT NOT NULL,
  icon      TEXT DEFAULT 'BookOpen',
  slug      TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Subjects ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subjects (
  id          BIGSERIAL PRIMARY KEY,
  category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  slug        TEXT,
  description TEXT,
  tags        TEXT[] DEFAULT '{}',
  type_tag    TEXT DEFAULT 'PDF',
  views       BIGINT DEFAULT 0,
  file_count  INT DEFAULT 0,
  cover_color TEXT DEFAULT '#EFF6FF',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ─── Files ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS files (
  id          BIGSERIAL PRIMARY KEY,
  subject_id  BIGINT REFERENCES subjects(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  type        TEXT DEFAULT 'pdf',
  size        TEXT,
  preview_url TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ─── RLS Policies (public read, no auth needed for students) ──
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects    ENABLE ROW LEVEL SECURITY;
ALTER TABLE files       ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read
CREATE POLICY "public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "public read subjects"   ON subjects   FOR SELECT USING (true);
CREATE POLICY "public read files"      ON files      FOR SELECT USING (true);

-- Allow all inserts/updates/deletes via anon key (admin uses same anon key with password check in app)
CREATE POLICY "anon write categories"  ON categories FOR ALL    USING (true) WITH CHECK (true);
CREATE POLICY "anon write subjects"    ON subjects   FOR ALL    USING (true) WITH CHECK (true);
CREATE POLICY "anon write files"       ON files      FOR ALL    USING (true) WITH CHECK (true);

-- ─── Helper function to increment views ───────────────────────
CREATE OR REPLACE FUNCTION increment_views(subject_id BIGINT)
RETURNS VOID AS $$
  UPDATE subjects SET views = views + 1 WHERE id = subject_id;
$$ LANGUAGE SQL SECURITY DEFINER;

-- ─── Trigger to sync file_count ───────────────────────────────
CREATE OR REPLACE FUNCTION update_file_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE subjects SET file_count = file_count + 1 WHERE id = NEW.subject_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE subjects SET file_count = GREATEST(0, file_count - 1) WHERE id = OLD.subject_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_file_count_insert
  AFTER INSERT ON files
  FOR EACH ROW EXECUTE FUNCTION update_file_count();

CREATE TRIGGER trg_file_count_delete
  AFTER DELETE ON files
  FOR EACH ROW EXECUTE FUNCTION update_file_count();

-- ─── Seed Data ────────────────────────────────────────────────
INSERT INTO categories (name, icon, slug) VALUES
  ('Logistics & Chuỗi cung ứng', 'Truck',    'logistics'),
  ('Công nghệ Thông tin (IT)',    'Code2',    'it'),
  ('Kinh tế Vận tải',             'BarChart3','kinh-te'),
  ('Cơ sở & Đại cương',          'BookOpen', 'co-so');

INSERT INTO subjects (category_id, name, description, tags, type_tag, views) VALUES
  (1, 'Tư duy phân tích',       'Kỹ thuật mô hình hóa dữ liệu, giải quyết tình huống vận hành chuỗi.',            ARRAY['Cơ bản'],      'PDF', 12400),
  (1, 'Quản trị Chuỗi cung ứng','Nguyên lý SCM, hoạch định phân phối và quản trị tồn kho toàn diện.',             ARRAY['Chuyên ngành'],'PDF', 8700),
  (1, 'E-Logistics',             'Hệ thống thương mại điện tử, tự động hóa kho hàng và chặng cuối.',              ARRAY['Chuyên sâu'],  'DOC', 6300),
  (1, 'Logistics quốc tế',       'Incoterms 2020, quy trình hải quan, cước vận tải biển & hàng không.',           ARRAY['Bắt buộc'],    'PDF', 5800),
  (1, 'Marketing trong Logistics','Chiến lược dịch vụ B2B, định giá giải pháp vận chuyển tích hợp.',              ARRAY['Cơ bản'],      'PDF', 4800),
  (1, 'Vận tải đa phương thức',  'Tổ chức gom hàng, công ước quốc tế và chứng từ vận tải kết hợp.',              ARRAY['Chuyên ngành'],'PDF', 5100),
  (3, 'Kinh tế vận tải',         'Hạch toán chi phí chuyên đi, điểm hòa vốn đội xe và khai thác tuyến.',         ARRAY['Bắt buộc'],    'PDF', 4200),
  (3, 'Excel trong công việc',   'File tính tự động, Pivot Table & hàm phân tích chi phí giao nhận.',             ARRAY['Thực hành'],   'XLS', 5600),
  (2, 'Lập trình Python',        'Từ cơ bản đến nâng cao, ứng dụng trong phân tích dữ liệu logistics.',           ARRAY['Cơ sở'],       'PDF', 3900),
  (2, 'Cơ sở dữ liệu',          'SQL, thiết kế ERD và quản trị hệ thống thông tin quản lý.',                     ARRAY['Cơ bản'],      'PDF', 3100),
  (4, 'Toán cao cấp',            'Giải tích, ma trận và xác suất thống kê ứng dụng trong kinh tế.',               ARRAY['Bắt buộc'],    'PDF', 7200),
  (4, 'Tiếng Anh chuyên ngành',  'Từ vựng logistics, đọc hiểu tài liệu quốc tế và viết email thương mại.',       ARRAY['Cơ sở'],       'PDF', 6800);
