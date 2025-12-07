# 礼想家 (Gift Visionary)

一个基于 AI 的智能礼物推荐助手，帮助你为亲朋好友挑选完美的礼物。

## 本地运行指南

**前提条件：**
请确保你的电脑上已经安装了 [Node.js](https://nodejs.org/) (推荐 v18 或更高版本)。

### 1. 安装依赖

打开终端（Terminal），进入当前文件夹，运行：

```bash
npm install
```

### 2. 配置 API Key

在项目根目录创建 `.env` 文件（如果没有的话），配置以下 API Key：

```env
# DeepSeek AI - 用于生成礼物推荐关键词（必填）
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx

# 值得买MCP - 用于获取真实商品数据（可选，不填则使用模拟数据）
ZHIDEMAI_API_KEY=your_zhidemai_api_key_here

# 图片搜索兜底（可选，用于MCP失败时展示图片）
IMAGE_SEARCH_ID=your_image_search_id
IMAGE_SEARCH_KEY=your_image_search_key
```

#### 如何获取 API Key：

| 服务 | 获取地址 | 说明 |
|------|----------|------|
| DeepSeek | [DeepSeek 开放平台](https://platform.deepseek.com/) | 用于 AI 智能推荐 |
| 值得买MCP | [值得买 AI 能力平台](https://ai.zhidemai.com/mcp/particulars) | 用于真实商品搜索 |

### 3. 启动项目

运行以下命令启动本地服务器：

```bash
npm run dev
```

启动后，终端会显示一个地址（通常是 `http://localhost:3000`），在浏览器中打开该地址即可使用。

## 功能介绍

- **🤖 智能画像分析**：输入送礼对象的特征，DeepSeek AI 为你生成精准的中文礼物关键词。
- **🛒 全网商品搜索**：接入值得买"海纳"MCP，自动搜索京东、天猫、淘宝等平台的真实商品。
- **💝 心愿单管理**：保存你喜欢的礼物方案，随时查看。

## 技术架构

```
┌─────────────────────────────────────────────────────────┐
│                      前端 (React + Vite)                 │
├─────────────────────────────────────────────────────────┤
│  GiftForm  →  DeepSeek AI  →  关键词生成                 │
│                    ↓                                     │
│  关键词  →  值得买MCP  →  真实商品数据                    │
│                    ↓                                     │
│  ProductCard  ←  搜索结果  ←  数据转换                   │
└─────────────────────────────────────────────────────────┘
```

## 文件结构

```
├── services/
│   ├── deepseekService.ts    # DeepSeek AI 调用
│   ├── zhidemaiService.ts    # 值得买MCP商品搜索
│   └── searchService.ts      # 搜索服务（整合MCP+降级逻辑）
├── components/
│   ├── GiftForm.tsx          # 礼物表单
│   ├── ProductCard.tsx       # 商品卡片
│   └── ...
├── App.tsx                   # 主应用
└── vite.config.ts            # Vite配置（含API代理）
```
