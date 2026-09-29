import React, { useState, useEffect } from 'react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import Dashboard from '../components/Dashboard'
import FileExplorer from '../components/FileExplorer'
import DocumentViewer from '../components/DocumentViewer'
import { getCategories, getSubjects, incrementViews } from '../lib/api'

export default function PublicPage() {
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState(null)

  const [selectedSubject, setSelectedSubject] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [subjectCounts, setSubjectCounts] = useState({})
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Load categories
  useEffect(() => {
    getCategories().then(({ data }) => {
      if (data) setCategories(data)
    })
  }, [])

  // Compute subject counts per category for sidebar badges
  useEffect(() => {
    getSubjects().then(({ data }) => {
      if (!data) return
      const counts = { total: data.length }
      data.forEach(s => {
        counts[s.category_id] = (counts[s.category_id] || 0) + 1
      })
      setSubjectCounts(counts)
    })
  }, [])

  const handleSubjectClick = async (subject) => {
    setSelectedSubject(subject)
    setSelectedFile(null)
    // Increment view count in background
    incrementViews(subject.id).catch(() => {})
  }

  const handleFileClick = (file) => {
    setSelectedFile(file)
  }

  const handleBackToDashboard = () => {
    setSelectedSubject(null)
    setSelectedFile(null)
  }



  const handleCategoryChange = (catId) => {
    setActiveCategory(catId)

    setSelectedSubject(null)
    setSelectedFile(null)
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      {/* Top Header */}
      <Header
        onOpenSidebar={() => setIsSidebarOpen(true)}
      />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Responsive Sidebar (Fixed on desktop, drawer on mobile) */}
        <Sidebar
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          subjectCounts={subjectCounts}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden w-full">
          {selectedSubject ? (
            <FileExplorer
              subject={selectedSubject}
              onBack={handleBackToDashboard}
              onFileClick={handleFileClick}
            />
          ) : (
            <Dashboard
              activeCategory={activeCategory}
              categories={categories}
              onSubjectClick={handleSubjectClick}
              onCategoryChange={handleCategoryChange}
              subjectCounts={subjectCounts}
            />
          )}
        </div>
      </div>

      {/* Document viewer (full-screen overlay) */}
      {selectedFile && (
        <DocumentViewer
          file={selectedFile}
          subject={selectedSubject}
          onClose={() => setSelectedFile(null)}
        />
      )}
    </div>
  )
}

