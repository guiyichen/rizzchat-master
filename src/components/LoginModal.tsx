'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  remainingUses: number
}

export default function LoginModal({ isOpen, onClose, remainingUses }: LoginModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  console.log('LoginModal渲染:', { isOpen, remainingUses });

  if (!isOpen) return null

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
      await signIn('google', { callbackUrl: '/' })
    } catch (error) {
      console.error('Login error:', error)
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">需要登录继续使用</h2>
          <p className="text-gray-600 mb-6">
            你已经使用了 {3 - remainingUses} 次免费体验，剩余 {remainingUses} 次。
            <br />
            登录后即可无限制使用 Rizz恋爱助理 💕
          </p>

          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full bg-white border border-gray-300 rounded-xl px-6 py-3 flex items-center justify-center space-x-3 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-gray-700 font-medium">使用 Google 登录</span>
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

          <p className="text-xs text-gray-400 mt-4">
            登录后，你的使用记录将被保存，享受更好的服务体验
          </p>
        </div>
      </div>
    </div>
  )
}
