# 生产环境OAuth配置指南

## 问题诊断

`error=Callback` 通常由以下原因导致：

1. **NEXTAUTH_URL配置错误** - 必须设置为完整的生产域名
2. **Google Console回调URL不匹配** - 必须包含生产域名
3. **环境变量缺失或错误**
4. **数据库连接问题**
5. **网络防火墙阻止OAuth回调**

## 解决步骤

### 1. 环境变量配置

在生产环境中设置以下环境变量：

```bash
# 必须设置为完整的生产域名
NEXTAUTH_URL=https://yourdomain.com

# 重新生成一个安全的密钥
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

1. 进入 "APIs & Services" > "Credentials"
2. 编辑你的OAuth 2.0客户端ID
3. 在 "Authorized redirect URIs" 中添加：
   ```
   https://yourdomain.com/api/auth/callback/google
   ```
4. 确保 "Authorized JavaScript origins" 包含：
   ```
   https://yourdomain.com
   ```

### 3. 验证配置

运行配置检查脚本：
```bash
node check-production-config.js
```

### 4. 测试步骤

1. **本地测试**：
   ```bash
   npm run dev
   ```

2. **生产环境测试**：
   - 部署到生产环境
   - 访问 `https://yourdomain.com`
   - 点击Google登录按钮
   - 检查浏览器控制台和服务器日志

### 5. 常见错误及解决方案

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| `error=Callback` | 回调URL不匹配 | 检查Google Console配置 |
| `error=OAuthSignin` | 网络超时 | 检查防火墙设置 |
| `error=Configuration` | 环境变量错误 | 验证所有必需的环境变量 |
| `error=AccessDenied` | 用户拒绝授权 | 正常行为，用户可以选择拒绝 |

### 6. 调试工具

使用以下工具进行调试：

1. **配置检查**：
   ```bash
   node check-production-config.js
   ```

2. **OAuth诊断**：
   ```bash
   node debug-oauth.js
   ```

3. **数据库测试**：
   ```bash
   node test-auth.js
   ```

### 7. 生产环境最佳实践

1. **使用HTTPS**：生产环境必须使用HTTPS
2. **环境变量安全**：不要在代码中硬编码敏感信息
3. **日志记录**：启用详细的OAuth日志记录
4. **错误处理**：实现优雅的错误处理机制
5. **监控**：设置OAuth成功/失败率监控

### 8. 紧急修复

如果OAuth仍然失败，可以临时使用模拟登录：

1. 访问 `/test-login.html`
2. 点击"模拟登录测试"按钮
3. 验证数据库存储功能

## 联系支持

如果问题仍然存在，请提供：
1. 完整的错误日志
2. 环境变量配置（隐藏敏感信息）
3. Google Console配置截图
4. 网络连接测试结果
