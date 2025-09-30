import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      },
      // 使用离线配置避免网络超时
      issuer: "https://accounts.google.com",
      authorization: {
        url: "https://accounts.google.com/o/oauth2/v2/auth",
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      },
      token: "https://oauth2.googleapis.com/token",
      userinfo: "https://www.googleapis.com/oauth2/v2/userinfo",
      httpOptions: {
        timeout: 30000, // 增加超时时间到30秒
      }
    }),
  ],
  callbacks: {
    async session({ session, user }: { session: any; user: any }) {
      if (session.user) {
        session.user.id = user.id
        session.user.name = user.name
        session.user.email = user.email
        session.user.image = user.image
      }
      return session
    },
    async signIn({ user, account, profile }: { user: any; account: any; profile?: any }) {
      // 确保获取完整的用户信息
      if (account?.provider === "google") {
        user.name = profile?.name || user.name
        user.email = profile?.email || user.email
        user.image = profile?.picture || user.image
        
        // 手动保存用户信息到数据库
        try {
          await prisma.user.upsert({
            where: { email: user.email },
            update: {
              name: user.name,
              image: user.image,
              emailVerified: new Date(),
            },
            create: {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
              emailVerified: new Date(),
            },
          });
        } catch (error) {
          console.error('保存用户信息失败:', error);
        }
      }
      return true
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // 确保重定向到正确的URL
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  pages: {
    signIn: '/',
    error: '/',
  },
  session: {
    strategy: "database" as const,
  },
  debug: process.env.NODE_ENV === "development",
}

export default NextAuth(authOptions)
