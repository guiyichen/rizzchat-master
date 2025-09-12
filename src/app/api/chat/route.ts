export const runtime = 'edge'

type ClientMessage = {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(req: Request) {
  // 注意：在Edge Runtime中，我们无法使用NextAuth的getServerSession
  // 这里我们依赖前端的认证检查，实际生产环境中建议使用其他认证方式
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey || apiKey === 'sk-test123') {
      // 模拟恋爱回复
      const body = await req.json().catch(() => ({}))
      const userInput = body?.messages?.[0]?.content || '你好'
      
      const mockResponses = [
        `收到你的消息啦～ 关于"${userInput}"，我的建议是：\n\n💕 搭讪技巧：\n• 用温柔的语气开场，比如"看到你提到这个，我想到..."\n• 分享一个相关的有趣经历，拉近距离\n• 问Ta的看法，让对话自然延续\n\n记住：真诚的关心比任何套路都更撩人 ✨`,
        `关于"${userInput}"这个话题，我觉得可以这样撩：\n\n🔥 兴趣激发：\n• 先表达理解和共鸣，让Ta感受到被理解\n• 分享你的想法，展现你的魅力\n• 用温暖的话语表达关心，比如"你这样说让我觉得..."\n\n这样既不会太主动，又能让Ta感受到你的用心和爱意 💖`,
        `看到你提到"${userInput}"，我想说：\n\n💝 温暖回复：\n• 用充满爱意的语言回应，让Ta感受到你的温柔\n• 适当表达关心，比如"我担心你..."或"我希望你..."\n• 营造浪漫氛围，让对话充满爱意\n\n记住：最好的撩人就是让对方感受到被深深爱着 🌸`
      ]
      
      const response = mockResponses[Math.floor(Math.random() * mockResponses.length)]
      
      return new Response(response, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      })
    }

    const body = await req.json().catch(() => ({}))
    const clientMessages: ClientMessage[] = Array.isArray(body?.messages) ? body.messages : []

    const systemPrompt =
      '你是"Rizz恋爱助理"，一位温柔且有分寸的恋爱对话教练。你的任务是帮助用户以搭讪、撩起对方兴趣、以及充满爱跟温暖的方式回复对方。\n\n回复风格要求：\n- 搭讪导向：主动创造话题，引导对话向积极方向发展\n- 兴趣激发：通过巧妙的问题和分享，激发对方的兴趣和好奇心\n- 爱意表达：用温柔、真诚的语言表达关心和爱意\n- 温暖氛围：营造轻松、舒适、充满爱意的对话环境\n\n风格特点：高情商、走心、不过度用力，给出短句为主、可选用轻微表情，不油腻。必要时提出追问以补足上下文。'

    const payload = {
      model: 'gpt-4o-mini',
      stream: true,
      temperature: 0.8,
      messages: [
        { role: 'system', content: systemPrompt },
        ...clientMessages.map((m) => ({ role: m.role, content: m.content }))
      ]
    }

    const upstream = await fetch('https://api.apicore.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    })

    if (!upstream.ok || !upstream.body) {
      const text = await upstream.text().catch(() => '')
      return new Response(text || 'Upstream error', { status: upstream.status || 500 })
    }

    const textDecoder = new TextDecoder()
    const textEncoder = new TextEncoder()
    const reader = upstream.body.getReader()

    const stream = new ReadableStream<Uint8Array>({
      async pull(controller) {
        const { done, value } = await reader.read()
        if (done) {
          controller.close()
          return
        }
        const chunkText = textDecoder.decode(value, { stream: true })
        const lines = chunkText.split('\n')
        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed) continue
          if (!trimmed.startsWith('data:')) continue
          const data = trimmed.replace(/^data:\s*/, '')
          if (data === '[DONE]') {
            controller.close()
            return
          }
          try {
            const json = JSON.parse(data)
            const delta = json?.choices?.[0]?.delta?.content
            if (typeof delta === 'string' && delta.length > 0) {
              controller.enqueue(textEncoder.encode(delta))
            }
          } catch (_) {
            // 忽略无法解析的行
          }
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache'
      }
    })
  } catch (err: any) {
    return new Response(err?.message || 'Server error', { status: 500 })
  }
}


