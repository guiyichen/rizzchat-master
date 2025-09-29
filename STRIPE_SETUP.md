# Stripe 支付功能配置说明

## 功能概述
- 集成 Stripe 支付系统
- 支持订阅模式（月付）
- 用户升级到高级版后无限制使用
- 支付成功/取消页面
- 数据库存储订阅信息

## 环境变量配置

在 `.env.local` 文件中添加以下配置：

```bash
# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

## Stripe 设置步骤

### 1. 创建 Stripe 账户
1. 访问 [Stripe Dashboard](https://dashboard.stripe.com/)
2. 注册或登录账户
3. 获取测试密钥

### 2. 获取 API 密钥
1. 在 Stripe Dashboard 中，进入 "Developers" > "API keys"
2. 复制 "Publishable key" 和 "Secret key"
3. 更新 `.env.local` 文件

### 3. 创建产品和价格
1. 在 Stripe Dashboard 中，进入 "Products"
2. 创建新产品：Rizz恋爱助理高级版
3. 设置价格：¥29.9/月
4. 复制价格 ID (price_xxx)
5. 更新代码中的 `priceId` 变量

### 4. 配置 Webhook
1. 在 Stripe Dashboard 中，进入 "Developers" > "Webhooks"
2. 添加端点：`https://yourdomain.com/api/stripe/webhook`
3. 选择事件：
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. 复制 webhook 密钥到环境变量

## 功能特性

### 支付流程
1. 用户点击"升级"按钮
2. 弹出支付弹窗
3. 跳转到 Stripe Checkout
4. 完成支付后返回成功页面
5. 自动激活高级版功能

### 数据库表
- `Subscription`: 存储用户订阅信息
- `User`: 关联订阅状态

### 页面路由
- `/payment/success`: 支付成功页面
- `/payment/cancel`: 支付取消页面
- `/api/stripe/create-checkout-session`: 创建支付会话
- `/api/stripe/webhook`: 处理 Stripe 事件

## 测试

### 测试卡号
使用 Stripe 测试卡号：
- 成功：4242 4242 4242 4242
- 需要验证：4000 0025 0000 3155
- 失败：4000 0000 0000 0002

### 测试步骤
1. 访问 http://localhost:3000
2. 点击"升级"按钮
3. 填写测试卡号信息
4. 完成支付流程
5. 验证订阅状态更新

## 生产环境部署

1. 切换到 Stripe 生产环境
2. 更新环境变量为生产密钥
3. 配置生产环境 webhook
4. 更新域名和回调 URL

## 安全注意事项

- 永远不要在前端暴露 Secret Key
- 使用 HTTPS 在生产环境
- 验证 webhook 签名
- 定期轮换 API 密钥

