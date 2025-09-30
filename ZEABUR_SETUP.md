# Zeabur PostgreSQL 数据库配置指南

## 1. 创建 Zeabur PostgreSQL 服务

1. 登录 [Zeabur Dashboard](https://dash.zeabur.com/)
2. 创建新项目
3. 添加 PostgreSQL 服务
4. 等待服务启动完成

## 2. 获取数据库连接信息

在 Zeabur Dashboard 中：
1. 选择您的 PostgreSQL 服务
2. 在 "Connection" 标签页中找到连接字符串
3. 复制完整的连接URL

## 3. 更新环境变量

将获取的 PostgreSQL 连接字符串添加到 `.env.local` 文件中：

```bash
# Zeabur PostgreSQL Database Configuration
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"
```

## 4. 数据库迁移

运行以下命令来创建数据库表：

```bash
# 生成 Prisma 客户端
npx prisma generate

# 推送数据库 schema
npx prisma db push

# 可选：查看数据库
npx prisma studio
```

## 5. 验证配置

启动开发服务器并测试登录功能：

```bash
npm run dev
```

## 6. 用户信息存储

配置完成后，Gmail 登录将自动保存以下用户信息到 PostgreSQL：

- **id**: 用户唯一标识符
- **name**: 用户姓名
- **email**: 用户邮箱
- **image**: 用户头像URL
- **emailVerified**: 邮箱验证时间
- **usageCount**: 使用次数
- **lastUsed**: 最后使用时间

## 7. 故障排除

### 常见问题：

1. **连接超时**: 检查网络连接和防火墙设置
2. **认证失败**: 验证 Google OAuth 配置
3. **数据库连接错误**: 检查 DATABASE_URL 格式

### 调试模式：

在 `.env.local` 中添加：
```bash
NODE_ENV=development
```

这将启用 NextAuth.js 的调试模式，提供详细的日志信息。

## 8. 生产环境部署

在 Zeabur 部署时：
1. 设置环境变量
2. 确保 DATABASE_URL 指向生产数据库
3. 更新 NEXTAUTH_URL 为生产域名
4. 使用 HTTPS 协议
