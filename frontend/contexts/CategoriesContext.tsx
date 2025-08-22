"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { postApi } from '@/lib/api'
import { toast } from 'sonner'

interface Category {
  name: string;
  count: number;
}

interface CategoriesContextType {
  categories: Category[];
  loading: boolean;
  error: string | null;
  refreshCategories: () => Promise<void>;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined)

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await postApi.getCategoryCounts()
      if (response.success) {
        setCategories(response.data.categories || [])
      } else {
        setError('Failed to fetch categories')
        toast.error('Failed to load categories')
      }
    } catch (err) {
      console.error('Error fetching categories:', err)
      setError('Failed to fetch categories')
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  const refreshCategories = async () => {
    await fetchCategories()
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const value: CategoriesContextType = {
    categories,
    loading,
    error,
    refreshCategories
  }

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  )
}

export function useCategories() {
  const context = useContext(CategoriesContext)
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoriesProvider')
  }
  return context
}
