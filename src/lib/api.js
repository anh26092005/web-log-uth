import { supabase, isSupabaseConfigured } from './supabase'
import {
  lsGetCategories, lsCreateCategory, lsUpdateCategory, lsDeleteCategory,
  lsGetSubjects, lsCreateSubject, lsUpdateSubject, lsDeleteSubject,
  lsIncrementViews, lsSearchSubjects,
  lsGetFiles, lsCreateFile, lsUpdateFile, lsDeleteFile,
} from './localStorage'

// ─── Categories ──────────────────────────────────────────────────────────────
export async function getCategories() {
  if (!isSupabaseConfigured()) return { data: lsGetCategories(), error: null }
  return supabase.from('categories').select('*').order('name')
}

export async function createCategory(name) {
  if (!isSupabaseConfigured()) {
    return { data: lsCreateCategory(name), error: null }
  }
  return supabase.from('categories').insert({ name }).select().single()
}

export async function updateCategory(id, name) {
  if (!isSupabaseConfigured()) {
    return { data: lsUpdateCategory(id, name), error: null }
  }
  return supabase.from('categories').update({ name }).eq('id', id).select().single()
}

export async function deleteCategory(id) {
  if (!isSupabaseConfigured()) {
    lsDeleteCategory(id)
    return { error: null }
  }
  return supabase.from('categories').delete().eq('id', id)
}

// ─── Subjects ────────────────────────────────────────────────────────────────
export async function getSubjects(categoryId = null) {
  if (!isSupabaseConfigured()) {
    return { data: lsGetSubjects(categoryId), error: null }
  }
  let query = supabase.from('subjects').select('*, categories(name)').order('views', { ascending: false })
  if (categoryId) query = query.eq('category_id', categoryId)
  return query
}

export async function getSubjectById(id) {
  if (!isSupabaseConfigured()) {
    const data = lsGetSubjects().find(s => s.id === id) || null
    return { data, error: null }
  }
  return supabase.from('subjects').select('*, categories(name)').eq('id', id).single()
}

export async function createSubject(payload) {
  if (!isSupabaseConfigured()) {
    return { data: lsCreateSubject(payload), error: null }
  }
  return supabase.from('subjects').insert(payload).select().single()
}

export async function updateSubject(id, payload) {
  if (!isSupabaseConfigured()) {
    return { data: lsUpdateSubject(id, payload), error: null }
  }
  return supabase.from('subjects').update(payload).eq('id', id).select().single()
}

export async function deleteSubject(id) {
  if (!isSupabaseConfigured()) {
    lsDeleteSubject(id)
    return { error: null }
  }
  return supabase.from('subjects').delete().eq('id', id)
}

export async function incrementViews(id) {
  if (!isSupabaseConfigured()) {
    lsIncrementViews(id)
    return { error: null }
  }
  return supabase.rpc('increment_views', { subject_id: id })
}

export async function searchSubjects(query) {
  if (!isSupabaseConfigured()) {
    return { data: lsSearchSubjects(query), error: null }
  }
  return supabase
    .from('subjects')
    .select('*, categories(name)')
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
}

// ─── Files ───────────────────────────────────────────────────────────────────
export async function getFiles(subjectId) {
  if (!isSupabaseConfigured()) {
    return { data: lsGetFiles(subjectId), error: null }
  }
  return supabase.from('files').select('*').eq('subject_id', subjectId).order('created_at')
}

export async function createFile(payload) {
  if (!isSupabaseConfigured()) {
    return { data: lsCreateFile(payload), error: null }
  }
  return supabase.from('files').insert(payload).select().single()
}

export async function updateFile(id, payload) {
  if (!isSupabaseConfigured()) {
    return { data: lsUpdateFile(id, payload), error: null }
  }
  return supabase.from('files').update(payload).eq('id', id).select().single()
}

export async function deleteFile(id) {
  if (!isSupabaseConfigured()) {
    lsDeleteFile(id)
    return { error: null }
  }
  return supabase.from('files').delete().eq('id', id)
}

export async function uploadFileToStorage(file, path) {
  if (!isSupabaseConfigured()) {
    throw new Error('Cần cấu hình kết nối Supabase thật để upload file.')
  }
  const { error } = await supabase.storage.from('documents').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || 'application/pdf'
  })
  if (error) throw error
  const { data: publicUrlData } = supabase.storage.from('documents').getPublicUrl(path)
  return publicUrlData.publicUrl
}
