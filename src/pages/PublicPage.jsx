import React, { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import Dashboard from '../components/Dashboard'
import FileExplorer from '../components/FileExplorer'
import DocumentViewer from '../components/DocumentViewer'
import { getCategories, getSubjects, incrementViews } from '../lib/api'

export default function PublicPage() {
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [subjectCounts, setSubjectCounts] = useState({})

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

  const handleSearch = (query) => {
    setSearchQuery(query)
    if (query) {
      setSelectedSubject(null)
      setSelectedFile(null)
      setActiveCategory(null)
    }
  }

  const handleCategoryChange = (catId) => {
    setActiveCategory(catId)
    setSearchQuery('')
    setSelectedSubject(null)
    setSelectedFile(null)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        subjectCounts={subjectCounts}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
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
            searchQuery={searchQuery}
            onSubjectClick={handleSubjectClick}
          />
        )}
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
