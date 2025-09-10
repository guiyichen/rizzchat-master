# Rizz恋爱助理

教你怎么撩妹与增进感情的恋爱对话助手，基于 Next.js 14 + TypeScript + Tailwind（App Router, `src/`）。

## 产品需求文档 (PRD)

### 核心功能
- **智能对话建议**：根据用户输入的情感场景，提供个性化的恋爱对话建议
- **搭讪技巧指导**：教授自然、有分寸的搭讪话术，避免尴尬和油腻
- **情感升温策略**：通过巧妙的对话技巧，帮助用户撩起对方兴趣
- **温暖回复生成**：以充满爱意和温暖的方式回复对方，营造浪漫氛围

### 回复风格要求
- **搭讪导向**：主动创造话题，引导对话向积极方向发展
- **兴趣激发**：通过巧妙的问题和分享，激发对方的兴趣和好奇心
- **爱意表达**：用温柔、真诚的语言表达关心和爱意
- **温暖氛围**：营造轻松、舒适、充满爱意的对话环境

### 技术特性
- 基于 OpenAI GPT-4o-mini 的智能对话生成
- 流式输出，实时响应用户输入
- 响应式设计，支持移动端和桌面端
- 优雅的 UI 设计，营造浪漫氛围

## 配置大模型 API（OpenAI）

后端路由 `/api/chat`（Edge Runtime）已对接 OpenAI Chat Completions 并支持流式输出。

本地/生产均需设置环境变量：

```bash
export OPENAI_API_KEY=sk-***
```

或在本地 `.env.local`：

```
OPENAI_API_KEY=sk-***
```

## Scripts
- dev: `npm run dev`
- build: `npm run build`
- start: `npm start`
- lint: `npm run lint`

## Getting started
1. Node.js >= 20
2. `npm install`
3. 设好 `OPENAI_API_KEY`
4. 开发：`npm run dev` / 生产：`npm run build && npm run start`
