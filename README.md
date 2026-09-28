# UTH Learning Materials 📚

Nền tảng chia sẻ tài liệu học tập cho sinh viên Đại học Giao thông vận tải TP.HCM.

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19 + Vite |
| Styling | Tailwind CSS v3 |
| Icons | Lucide React |
| Routing | React Router v6 |
| Database | Supabase (optional — falls back to mock data) |

---

## Quick Start

```bash
npm install
npm run dev
```

The app runs at **http://localhost:5173** in Mock Data mode (no database needed).

Admin panel: **http://localhost:5173/admin** — password: `admin123`

---

## Connect to Supabase (Production)

1. Create a project at [supabase.com](https://supabase.com)
2. Copy your **Project URL** and **anon public key** from *Settings → API*
3. Paste them into `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_ADMIN_PASSWORD=your_secure_password
VITE_ZALO_LINK=https://zalo.me/YOUR_PHONE_NUMBER
```

4. Run the schema in *Supabase → SQL Editor*: see `supabase_schema.sql`

---

## Configuration

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `VITE_ADMIN_PASSWORD` | Admin panel password (default: `admin123`) |
| `VITE_ZALO_LINK` | Your Zalo link (e.g. `https://zalo.me/0123456789`) |

---

## Features

### Public Frontend
- **Dashboard** — Responsive grid of subject cards with category sidebar
- **File Explorer** — Google Drive-style file list per subject
- **Document Viewer** — 20% iframe preview + blurred paywall with Zalo CTA

### Admin Panel (`/admin`)
- Password-protected login
- **Manage Categories** — Add/edit/delete subject categories
- **Manage Subjects** — Full CRUD with category assignment, tags, description
- **Manage Files** — Paste Google Drive preview links per subject

---

## How to get a Google Drive preview link

1. Open your file on Google Drive
2. Click **Share** -> **Copy link**
3. Replace `/view` with `/preview` at the end of the URL

Example:
```
Before: https://drive.google.com/file/d/FILE_ID/view
After:  https://drive.google.com/file/d/FILE_ID/preview
```

---

## Project Structure

```
src/
+-- components/
|   +-- Sidebar.jsx          # Category nav sidebar
|   +-- Header.jsx           # Search + top nav
|   +-- Dashboard.jsx        # Subject grid + tips section
|   +-- SubjectCard.jsx      # Individual subject card
|   +-- FileExplorer.jsx     # Drive-style file list
|   +-- DocumentViewer.jsx   # Paywall viewer
+-- pages/
|   +-- PublicPage.jsx       # Public root (orchestrates states)
|   +-- AdminLogin.jsx       # Admin login
|   +-- admin/
|       +-- AdminDashboard.jsx
|       +-- CategoriesPanel.jsx
|       +-- SubjectsPanel.jsx
|       +-- FilesPanel.jsx
+-- contexts/
|   +-- AuthContext.jsx      # Session auth
+-- lib/
    +-- supabase.js          # Supabase client
    +-- api.js               # Data access layer (mock + real)
    +-- mockData.js          # Sample data
    +-- utils.js             # Helpers
```
