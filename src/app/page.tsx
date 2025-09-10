'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  id: number
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: '嗨，我是你的恋爱对话教练 Rizz 💘 告诉我你和Ta的故事，我会教你如何以搭讪、撩起对方兴趣、以及充满爱跟温暖的方式回复Ta，让你们的对话充满浪漫和爱意 ✨',
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const handleSendMessage = async () => {
    if (!inputText.trim()) return

    const userInput = inputText
    const userMessage: Message = {
      id: Date.now(),
      text: userInput,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: userInput }
          ]
        })
      })

      if (!res.ok || !res.body) {
        const fallback: Message = {
          id: Date.now() + 1,
          text: '抱歉，我这边连线有点小问题，等下再试试～',
          sender: 'bot',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, fallback])
        setIsLoading(false)
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let botText = ''
      const botId = Date.now() + 1

      // 先插入一个空的bot消息，再流式拼接
      setMessages(prev => [
        ...prev,
        { id: botId, text: '', sender: 'bot', timestamp: new Date() }
      ])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        botText += decoder.decode(value, { stream: true })
        setMessages(prev => prev.map(m => m.id === botId ? { ...m, text: botText } : m))
      }
    } catch (e) {
      const errorBot: Message = {
        id: Date.now() + 2,
        text: '网络有点不稳定，我们稍后再继续聊好吗？',
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorBot])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value)
    // 自动调整高度
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100">
      <div className="container mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-rose-700 mb-2">Rizz恋爱助理</h1>
          <p className="text-rose-500">高情商撩人话术 · 甜而不腻 · 把温柔和分寸感交给我</p>
        </div>

        {/* 聊天容器 */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl overflow-hidden">
            {/* 聊天头部 */}
            <div className="bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold">恋爱教练 · Rizz</h3>
                  <p className="text-rose-100 text-sm">在线 · 温柔且专业</p>
                </div>
              </div>
            </div>

            {/* 消息列表 */}
            <div className="h-96 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} message-enter`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-br-md'
                        : 'bg-rose-50 border border-rose-100 text-rose-900 rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                    <p className={`text-xs mt-2 ${
                      message.sender === 'user' ? 'text-rose-100' : 'text-rose-400'
                    }`}>
                      {message.timestamp.toLocaleTimeString('zh-CN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* 加载指示器 */}
              {isLoading && (
                <div className="flex justify-start message-enter">
                  <div className="bg-rose-50 border border-rose-100 text-rose-900 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full typing-dot"></div>
                      <div className="w-2 h-2 rounded-full typing-dot"></div>
                      <div className="w-2 h-2 rounded-full typing-dot"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* 输入区域 */}
            <div className="border-t bg-rose-50 p-4">
              <div className="flex space-x-3">
                <div className="flex-1">
                  <textarea
                    ref={textareaRef}
                    value={inputText}
                    onChange={handleTextareaChange}
                    onKeyPress={handleKeyPress}
                    placeholder="告诉我你和Ta的故事…我来教你如何搭讪、撩起Ta的兴趣，用充满爱意和温暖的方式回复Ta 💕"
                    className="w-full px-4 py-3 border border-rose-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent resize-none transition-all duration-200 bg-white/80 placeholder-rose-300"
                    rows={1}
                    style={{ minHeight: '48px', maxHeight: '120px' }}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isLoading}
                  className="bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white px-6 py-3 rounded-xl transition-colors duration-200 flex items-center justify-center shadow"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}