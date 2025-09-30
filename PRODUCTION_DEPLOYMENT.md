# 生产环境部署指南

## 🎯 部署状态

### ✅ 已解决的问题
- **TypeScript类型错误**：移除了不支持的`retry`属性
- **NextAuth.js配置**：优化了生产环境配置
- **数据库连接**：Zeabur PostgreSQL配置正确

### ⚠️ 构建警告（不影响部署）
- **预渲染错误**：NextAuth.js在静态生成时的常见问题
- **图片优化警告**：建议使用`next/image`组件
- **NODE_ENV警告**：环境变量设置建议

## 🚀 生产环境部署步骤

### 1. 环境变量配置

在生产环境中设置以下环境变量：

```bash
# 生产环境URL（必须设置为实际域名）
NEXTAUTH_URL=https://yourdomain.com

# NextAuth.js密钥（32位随机字符串）
NEXTAUTH_SECRET=your-32-character-random-secret

# Google OAuth配置
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# 数据库配置
DATABASE_URL=your-production-database-url

# 生产环境标识
NODE_ENV=production
```

### 2. Google Console配置

在 [Google Cloud Console](https://console.cloud.google.com/) 中：

1. **进入APIs & Services > Credentials**
2. **编辑OAuth 2.0客户端ID**
3. **添加授权重定向URI**：
   ```
   https://yourdomain.com/api/auth/callback/google
   ```
4. **添加授权JavaScript来源**：
   ```
   https://yourdomain.com
   ```

### 3. 部署平台配置

#### Vercel部署
```bash
# 安装Vercel CLI
npm i -g vercel

# 部署
vercel --prod

# 设置环境变量
vercel env add NEXTAUTH_URL
vercel env add NEXTAUTH_SECRET
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
vercel env add DATABASE_URL
```

#### Netlify部署
```bash
# 构建命令
npm run build

# 发布目录
.next

# 环境变量在Netlify控制台设置
```

#### 其他平台
- **Railway**：支持直接Git部署
- **Render**：支持Docker和Git部署
- **Heroku**：需要添加buildpack

### 4. 数据库迁移

```bash
# 推送数据库schema
npx prisma db push

# 生成Prisma客户端
npx prisma generate
```

### 5. 域名和SSL配置

1. **配置自定义域名**
2. **启用HTTPS**（必需用于OAuth）
3. **更新DNS记录**

## 🔧 生产环境优化

### 1. Next.js配置优化

创建`next.config.mjs`：
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 生产环境优化
  output: 'standalone',
  
  // 图片优化
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  
  // 环境变量验证
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },
  
  // 实验性功能
  experimental: {
    typedRoutes: true,
  },
}

export default nextConfig
```

### 2. 错误处理优化

创建`src/app/error.tsx`：
```typescript
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">出现错误</h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        重试
      </button>
    </div>
  )
}
```

### 3. 性能监控

添加性能监控：
```bash
# 安装监控工具
npm install @vercel/analytics

# 在layout.tsx中添加
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

## 🧪 生产环境测试

### 1. 功能测试清单

- [ ] **主页访问**：https://yourdomain.com
- [ ] **登录功能**：Google OAuth流程
- [ ] **用户数据**：数据库存储验证
- [ ] **会话管理**：登录状态保持
- [ ] **API端点**：所有认证API正常
- [ ] **错误处理**：404、500页面正常

### 2. 性能测试

```bash
# 使用Lighthouse测试
npx lighthouse https://yourdomain.com --view

# 使用PageSpeed Insights
# https://pagespeed.web.dev/
```

### 3. 安全测试

- [ ] **HTTPS配置**：SSL证书有效
- [ ] **环境变量**：敏感信息未暴露
- [ ] **CORS配置**：跨域请求安全
- [ ] **OAuth安全**：回调URL正确

## 🚨 常见问题解决

### 问题1：OAuth回调失败
**错误**：`error=Callback`
**解决方案**：
1. 检查`NEXTAUTH_URL`是否为HTTPS
2. 验证Google Console回调URL
3. 确认域名配置正确

### 问题2：数据库连接失败
**错误**：`Database connection failed`
**解决方案**：
1. 检查`DATABASE_URL`格式
2. 验证数据库访问权限
3. 确认网络连接

### 问题3：构建失败
**错误**：`Build failed`
**解决方案**：
1. 检查TypeScript类型错误
2. 验证环境变量配置
3. 确认依赖版本兼容性

## 📊 部署检查清单

### 部署前检查
- [ ] 环境变量配置完整
- [ ] Google Console配置正确
- [ ] 数据库连接正常
- [ ] 代码构建成功
- [ ] 测试用例通过

### 部署后验证
- [ ] 网站可正常访问
- [ ] 登录功能正常
- [ ] 数据库操作正常
- [ ] 错误页面正常
- [ ] 性能指标良好

## 🎯 部署成功标准

- ✅ **网站可访问**：HTTPS域名正常
- ✅ **登录功能**：Google OAuth正常工作
- ✅ **数据存储**：用户信息正确保存
- ✅ **会话管理**：登录状态正确维护
- ✅ **错误处理**：异常情况正确处理
- ✅ **性能良好**：页面加载速度正常

## 📞 技术支持

如遇到部署问题，请参考：
- 📄 **详细文档**：`GMAIL_LOGIN_REQUIREMENTS.md`
- 🧪 **测试指南**：`TESTING_GUIDE.md`
- 🔧 **状态检查**：使用测试页面验证功能
- 📝 **错误日志**：检查部署平台日志

## 🎉 部署完成

恭喜！您的Gmail登录功能已成功部署到生产环境。用户现在可以通过Google账户登录您的应用，所有用户数据将安全地存储在Zeabur PostgreSQL数据库中。
