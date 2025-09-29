'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function PaymentCancelPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">支付已取消</h1>
        <p className="text-gray-600 mb-6">
          支付流程已取消。你可以继续使用免费版本，或者稍后再次尝试升级。
        </p>

        <div className="space-y-4">
          <Link
            href="/"
            className="block w-full bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-xl transition-colors"
          >
            返回首页
          </Link>
          
          <button
            onClick={() => router.back()}
            className="w-full text-gray-500 hover:text-gray-700 transition-colors"
          >
            重新支付
          </button>
        </div>
      </div>
    </div>
  )
}

