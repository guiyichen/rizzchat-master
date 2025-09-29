import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
})

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 使用环境变量中的价格ID
    const priceId = process.env.STRIPE_PRODUCT_PRICE_ID || 'price_test_placeholder'
    
    // 检查价格ID是否为占位符
    if (priceId === 'price_test_placeholder') {
      return NextResponse.json({ 
        error: 'Stripe price ID not configured. Please set STRIPE_PRODUCT_PRICE_ID in environment variables.' 
      }, { status: 400 })
    }

    // 获取或创建Stripe客户
    let customer
    const existingUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true }
    })

    if (existingUser?.subscription?.stripeCustomerId) {
      customer = await stripe.customers.retrieve(existingUser.subscription.stripeCustomerId)
    } else {
      customer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name || undefined,
        metadata: {
          userId: existingUser?.id || '',
        },
      })

      // 更新用户记录
      if (existingUser) {
        await prisma.subscription.upsert({
          where: { userId: existingUser.id },
          update: { stripeCustomerId: customer.id },
          create: {
            userId: existingUser.id,
            stripeCustomerId: customer.id,
          },
        })
      }
    }

    // 创建结账会话
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXTAUTH_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/payment/cancel`,
      metadata: {
        userId: existingUser?.id || '',
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
