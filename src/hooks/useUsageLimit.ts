'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

const MAX_FREE_USES = 3
const STORAGE_KEY = 'rizzchat_usage_count'

export function useUsageLimit() {
  const { data: session, status } = useSession()
  const [usageCount, setUsageCount] = useState(0)
  const [remainingUses, setRemainingUses] = useState(MAX_FREE_USES)
  const [showLoginModal, setShowLoginModal] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    if (session) {
      // 用户已登录，无限制使用
      setUsageCount(0)
      setRemainingUses(Infinity)
      setShowLoginModal(false)
    } else {
      // 未登录用户，检查本地存储的使用次数
      const storedCount = localStorage.getItem(STORAGE_KEY)
      const count = storedCount ? parseInt(storedCount, 10) : 0
      setUsageCount(count)
      setRemainingUses(MAX_FREE_USES - count)
    }
  }, [session, status])

  const incrementUsage = () => {
    if (session) {
      // 已登录用户，无限制
      return true
    }

    const newCount = usageCount + 1
    setUsageCount(newCount)
    localStorage.setItem(STORAGE_KEY, newCount.toString())
    
    const newRemaining = MAX_FREE_USES - newCount
    setRemainingUses(newRemaining)

    if (newRemaining <= 0) {
      setShowLoginModal(true)
      return false
    }

    return true
  }

  const canUse = () => {
    if (session) return true
    return remainingUses > 0
  }

  const resetUsage = () => {
    localStorage.removeItem(STORAGE_KEY)
    setUsageCount(0)
    setRemainingUses(MAX_FREE_USES)
    setShowLoginModal(false)
  }

  return {
    usageCount,
    remainingUses,
    showLoginModal,
    setShowLoginModal,
    incrementUsage,
    canUse,
    resetUsage,
    isLoggedIn: !!session,
    isLoading: status === 'loading'
  }
}
