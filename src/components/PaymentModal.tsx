'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function PaymentModal({ isOpen, onClose }: PaymentModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handlePayment = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.url) {
        window.location.href = data.url
      } else {
        console.error('No URL returned from API:', data)
        alert('支付服务暂时不可用，请稍后再试')
      }
    } catch (error) {
      console.error('Payment error:', error)
      
      // 显示更具体的错误信息
      if (error instanceof Error && error.message.includes('HTTP error')) {
        const statusMatch = error.message.match(/status: (\d+)/)
        if (statusMatch) {
          const status = parseInt(statusMatch[1])
          if (status === 400) {
            alert('支付配置错误：请配置正确的 Stripe 价格 ID')
          } else if (status === 401) {
            alert('请先登录后再进行支付')
          } else {
            alert(`支付服务错误 (${status})，请稍后再试`)
          }
        } else {
          alert('支付过程中发生错误，请稍后再试')
        }
      } else {
        alert('支付过程中发生错误，请稍后再试')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]" style={{zIndex: 9999}}>
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl" style={{zIndex: 10000}}>
        <div className="text-center">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">升级到高级版</h2>
          <p className="text-gray-600 mb-6">
            解锁无限制使用，享受完整的恋爱对话建议服务 💕
          </p>

          <div className="bg-rose-50 rounded-xl p-4 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-rose-600 mb-2">¥29.9</div>
              <div className="text-sm text-gray-600">每月</div>
              <div className="text-xs text-gray-500 mt-1">随时取消</div>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={handlePayment}
              disabled={isLoading}
              className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white px-6 py-3 rounded-xl flex items-center justify-center space-x-2 transition-colors"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span>立即支付</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="w-full text-gray-500 hover:text-gray-700 transition-colors"
            >
              稍后再说
            </button>
          </div>

          <div className="mt-6 text-xs text-gray-400">
            <p>安全支付，由 Stripe 提供支持</p>
            <p>支持信用卡、借记卡等多种支付方式</p>
          </div>
        </div>
      </div>
    </div>
  )
}
