# Gmail 第三方登录配置说明

## 功能概述
- 用户可以使用 Gmail 账号登录
- 未登录用户有 3 次免费体验机会
- 使用 3 次后弹出登录弹窗，要求用户登录才能继续使用
- 登录后无限制使用

## 环境变量配置

在 `.env.local` 文件中添加以下配置：

```bash
# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Database
DATABASE_URL="file:./dev.db"
```

## Google OAuth 设置

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 Google+ API
4. 创建 OAuth 2.0 客户端 ID
5. 设置授权重定向 URI: `http://localhost:3000/api/auth/callback/google`
6. 复制客户端 ID 和客户端密钥到环境变量

## 数据库设置

项目使用 SQLite 数据库，已自动创建。如需重置：

```bash
npx prisma db push
```

## 功能特性

### 使用限制
- 未登录用户：3 次免费体验
- 已登录用户：无限制使用
- 使用次数存储在本地 localStorage（未登录）和数据库（已登录）

### 用户界面
- 头部显示用户状态和剩余使用次数
- 登录/退出按钮
- 使用限制时弹出登录弹窗
- 美观的 Google 登录按钮

### 安全特性
- NextAuth.js 提供安全的认证流程
- 会话管理
- 数据库存储用户信息

## 部署注意事项

1. 确保设置正确的 `NEXTAUTH_URL` 环境变量
2. 在生产环境中使用 HTTPS
3. 设置强密码作为 `NEXTAUTH_SECRET`
4. 配置正确的 Google OAuth 重定向 URI

## 测试

1. 启动服务器：`npm start`
2. 访问：http://localhost:3000
3. 尝试发送 3 条消息（未登录状态）
4. 第 4 次发送时应该弹出登录弹窗
5. 点击 Google 登录按钮进行测试
