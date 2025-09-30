import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { name, email, image } = await request.json()
    
    // 创建模拟用户数据
    const mockUser = {
      name: name || '测试用户',
      email: email || 'test@example.com',
      image: image || 'https://via.placeholder.com/150',
    }
    
    // 保存用户信息到数据库
    const user = await prisma.user.upsert({
      where: { email: mockUser.email },
      update: {
        name: mockUser.name,
        image: mockUser.image,
        emailVerified: new Date(),
        lastUsed: new Date(),
      },
      create: {
        name: mockUser.name,
        email: mockUser.email,
        image: mockUser.image,
        emailVerified: new Date(),
        lastUsed: new Date(),
        usageCount: 0,
      },
    })
    
    // 创建模拟账户
    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: 'google',
          providerAccountId: `mock_${user.id}`,
        },
      },
      update: {
        userId: user.id,
        type: 'oauth',
        access_token: 'mock_access_token',
        refresh_token: 'mock_refresh_token',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: 'Bearer',
        scope: 'openid email profile',
      },
      create: {
        userId: user.id,
        type: 'oauth',
        provider: 'google',
        providerAccountId: `mock_${user.id}`,
        access_token: 'mock_access_token',
        refresh_token: 'mock_refresh_token',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: 'Bearer',
        scope: 'openid email profile',
      },
    })
    
    // 创建会话
    const session = await prisma.session.create({
      data: {
        sessionToken: `mock_session_${Date.now()}`,
        userId: user.id,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天
      },
    })
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
      session: {
        token: session.sessionToken,
        expires: session.expires,
      },
      message: '模拟登录成功，用户信息已保存到数据库'
    })
    
  } catch (error) {
    console.error('模拟登录失败:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: '模拟登录失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
