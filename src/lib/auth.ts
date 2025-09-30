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
      // 生产环境优化配置
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile"
        }
      },
      // 增加超时时间和重试机制
      httpOptions: {
        timeout: 30000,
        retry: 3
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
      // 验证必要参数
      if (!user || !account) {
        console.error('OAuth回调缺少必要参数:', { user: !!user, account: !!account });
        return false;
      }

      // 确保获取完整的用户信息
      if (account?.provider === "google") {
        user.name = profile?.name || user.name
        user.email = profile?.email || user.email
        user.image = profile?.picture || user.image
        
        // 验证邮箱
        if (!user.email) {
          console.error('Google OAuth未返回邮箱信息');
          return false;
        }
        
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
          console.log('用户信息保存成功:', user.email);
        } catch (error) {
          console.error('保存用户信息失败:', error);
          return false;
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
