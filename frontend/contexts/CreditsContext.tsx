"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useUser } from '@clerk/nextjs'
import { userApi } from '@/lib/api'
import { toast } from 'sonner'

interface CreditsContextType {
  credits: number
  loading: boolean
  error: string | null
  refreshCredits: () => Promise<void>
}

const CreditsContext = createContext<CreditsContextType | undefined>(undefined)

export function CreditsProvider({ children }: { children: ReactNode }) {
  const { isSignedIn, user } = useUser()
  const [credits, setCredits] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCredits = async () => {
    if (!isSignedIn) {
      setCredits(0)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await userApi.getProfile()
      if (response.success && response.data.profile) {
        setCredits(response.data.profile.credits || 0)
      } else {
        setError('Failed to fetch credits')
        toast.error('Failed to load credits')
      }
    } catch (err) {
      console.error('Error fetching credits:', err)
      setError('Failed to fetch credits')
      toast.error('Failed to load credits')
    } finally {
      setLoading(false)
    }
  }

  const refreshCredits = async () => {
    await fetchCredits()
  }

  useEffect(() => {
    fetchCredits()
  }, [isSignedIn, user?.id])

  const value: CreditsContextType = {
    credits,
    loading,
    error,
    refreshCredits
  }

  return (
    <CreditsContext.Provider value={value}>
      {children}
    </CreditsContext.Provider>
  )
}

export function useCredits() {
  const context = useContext(CreditsContext)
  if (context === undefined) {
    throw new Error('useCredits must be used within a CreditsProvider')
  }
  return context
}
