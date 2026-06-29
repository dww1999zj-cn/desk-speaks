# desk-speaks 项目文档

**项目名称：** desk-speaks（线上品牌名：你的工位人格）  
**仓库：** https://github.com/dww1999zj-cn/desk-speaks  
**线上地址：** https://desk.zeabur.app  
**定位：** 用户上传工位照片 → 通义千问视觉模型分析 → 生成「工位人格」报告 → 可分享鉴定卡 + 办公好物推荐

---

## 1. 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 15（App Router）+ React 19 |
| 语言 | TypeScript 5.8 |
| 样式 | Tailwind CSS 3.4 |
| AI | 阿里云百炼 / 通义千问 Qwen-VL（qwen-vl-plus） |
| 数据库 | Supabase（PostgreSQL，可选） |
| 部署 | Zeabur（Node 20.x） |
| 其他 | Canvas 分享图生成、QRCode、sessionStorage 会话数据 |

---

## 2. 用户流程

1. **首页** `/` — 介绍产品，点击 CTA 进入上传
2. **上传** `/upload` — 选图、压缩，写入 sessionStorage
3. **分析** `/analyzing` — POST `/api/analyze`，等待 AI 返回 JSON 报告
4. **报告** `/report` — 5 张滑动卡片：工位初见 / MBTI / 星座 / 来信 / 分享鉴定卡
5. **推荐** `/recommend` — 京东京粉推广链接（从报告第 4 层入口进入）

**数据暂存：** 图片和报告存在浏览器 sessionStorage，不持久登录；Supabase 仅后台存 traits 统计（可选）。

---

## 3. 完整目录结构

```
desk-speaks/
├── app/                          # Next.js App Router 页面与 API
│   ├── layout.tsx                # 根布局、全局 metadata
│   ├── page.tsx                  # 首页
│   ├── globals.css               # 全局样式
│   ├── upload/
│   │   └── page.tsx              # 上传页
│   ├── analyzing/
│   │   └── page.tsx              # 分析中 / 错误重试
│   ├── report/
│   │   └── page.tsx              # 报告滑动页
│   ├── recommend/
│   │   └── page.tsx              # 办公好物推荐页
│   └── api/
│       ├── analyze/
│       │   └── route.ts          # AI 分析接口
│       └── stats/
│           └── route.ts          # 相似工位统计接口
│
├── components/                   # React 组件
│   ├── home/
│   │   └── HomeCta.tsx           # 首页「开始测」按钮
│   ├── upload/
│   │   └── PhotoUploader.tsx     # 拍照/选图 + 压缩预览
│   ├── analyzing/
│   │   ├── ThinkingStatus.tsx    # 分析等待动画文案
│   │   └── AnalyzeErrorPanel.tsx # 失败/超时重试面板
│   ├── report/
│   │   ├── ReportSwiper.tsx      # 报告卡片滑动容器
│   │   ├── ReportCard.tsx        # 单张报告卡（含好物入口）
│   │   ├── SharePreviewCard.tsx  # 分享鉴定卡预览
│   │   ├── ShareImageButton.tsx  # 生成分享图按钮
│   │   ├── ShareImageSaveOverlay.tsx  # 微信长按保存 overlay
│   │   └── CertificationStamp.tsx # 鉴定章动画
│   ├── recommend/
│   │   └── OfficePickCard.tsx    # 单个好物卡片
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── GradientBackground.tsx
│       └── SiteFooter.tsx        # 全站页脚 copyright
│
├── lib/                          # 核心业务逻辑
│   ├── types.ts                  # DeskReport / ReportCardData 类型
│   ├── prompts.ts                # AI System Prompt + Mock 数据
│   ├── report.ts                 # 报告规范化、转卡片、Storage Key
│   ├── image.ts                  # 图片压缩、base64 转换
│   ├── share-image.ts            # Canvas 生成 1080px 分享图
│   ├── share-copy.ts             # 分享相关文案
│   ├── site-copy.ts              # 站点页脚文案
│   ├── office-picks.ts           # 办公好物列表 + 京粉链接
│   ├── stats.ts                  # Supabase 存报告 / 查统计
│   └── supabase.ts               # Supabase Admin 客户端
│
├── supabase/
│   └── schema.sql                # desk_reports 表 DDL
│
├── scripts/                      # 本地调试脚本
│   ├── test-models.mjs           # 测试 Qwen 模型
│   ├── test-supabase.mjs         # 测试 Supabase 连接
│   └── test-supabase-write.mjs   # 测试写入
│
├── docs/                         # 项目文档（本目录）
│   ├── PROJECT.md
│   ├── PROJECT.pdf
│   └── PROJECT.docx
│
├── .env.example                  # 环境变量模板
├── next.config.mjs               # Next 配置
├── tailwind.config.ts            # 设计 token / 动画
├── tsconfig.json
├── package.json
├── .node-version                 # Node 20
└── .npmrc                        # npm 构建配置
```

---

## 4. 页面路由说明

| 路由 | 类型 | 说明 |
|------|------|------|
| `/` | 静态 | 落地页，展示示例卡片 |
| `/upload` | 客户端 | 图片上传，压缩后存 sessionStorage |
| `/analyzing` | 客户端 | 调 API，90s 超时，支持 preview 参数预览错误态 |
| `/report` | 客户端 | 5 张报告卡 + 分享鉴定卡 |
| `/recommend` | 静态 | 9 个办公好物，按 4 类分组 |
| `/api/analyze` | 动态 API | POST，接收 base64 图片，返回 DeskReport |
| `/api/stats` | 动态 API | POST，按 traits 查相似工位占比 |

---

## 5. 核心模块详解

### 5.1 AI 分析（app/api/analyze/route.ts）

- 读取 `DASHSCOPE_API_KEY`，调用百炼兼容 OpenAI 格式的 Chat Completions API
- 模型：`QWEN_VL_MODEL`（默认 qwen-vl-plus），失败可回退
- 无 API Key 或 `USE_MOCK_DATA=true` 时返回 MOCK_REPORT
- 解析 AI 返回 JSON → normalizeReport() 补全缺字段
- 分析成功后通过 after() 异步写入 Supabase（不阻塞响应）
- maxDuration = 60 秒

### 5.2 Prompt 设计（lib/prompts.ts）

AI 扮演「工位本身」，第一人称输出 JSON，包含：

- deskEvidence — 可见物件 → 洞察（2–3 条）
- intro — 年龄猜测、物件依据
- mbtiDesk — 工位 MBTI（非心理测试）
- zodiacDesk — 工位星座（按氛围，非生日）
- letter — 约 70 字来信 + 轻幽默风水一句
- shareCard — 分享金句 shareHook + 称号 summary

### 5.3 报告展示（lib/report.ts + components/report/）

- reportToCards() 把 DeskReport 拆成 5 张 ReportCardData
- ReportSwiper 横向滑动浏览
- 最后一张为分享鉴定卡，Canvas 生成 1080×1920 图片，含二维码
- 微信内保存用 base64 预览 + 长按提示 overlay

### 5.4 图片处理（lib/image.ts）

- 客户端 Canvas 压缩：桌面 max 960px，移动 640px
- 同时生成 thumb（320px）供报告页展示
- 压缩质量：桌面 0.72，移动 0.58

### 5.5 办公好物（lib/office-picks.ts）

- 9 个示例商品，4 分类：桌面收纳、久坐救星、氛围感、续命水
- 每个商品 affiliateUrl 为京粉短链
- 报告第 4 层「工位来信」底部链到 /recommend

### 5.6 统计（lib/stats.ts + Supabase）

- 表 desk_reports：存 traits[]、cover_subtitle
- getDeskStats() 计算 trait 占比、相似工位数（≥2 个 trait 重叠）
- RLS 禁止客户端直连，仅 service_role 通过 API 访问

---

## 6. 数据模型

### DeskReport（AI 输出 / 前端核心）

```json
{
  "deskEvidence": ["双屏 → 常驻工位型", "..."],
  "intro": {
    "description": "string",
    "guessedAge": "27岁",
    "ageHint": "string",
    "declaration": "string"
  },
  "mbtiDesk": { "type": "INFP", "keywords": [], "declaration": "string" },
  "zodiacDesk": { "sign": "天蝎座", "keywords": [], "declaration": "string" },
  "letter": { "content": "string", "yijingFengshui": "string" },
  "shareCard": {
    "title": "你的工位人格",
    "shareHook": "≤28字金句",
    "summary": "≤16字称号",
    "keywords": []
  }
}
```

### sessionStorage Keys（lib/report.ts）

| Key | 内容 |
|-----|------|
| desk-speaks-image | 压缩后完整图 base64 |
| desk-speaks-image-thumb | 缩略图 base64 |
| desk-speaks-report | JSON 报告 |
| desk-speaks-report-id | Supabase 记录 ID（可选） |

---

## 7. 环境变量

```bash
# AI（生产环境必填）
DASHSCOPE_API_KEY=sk-xxx
QWEN_VL_MODEL=qwen-vl-plus

# 开发 Mock（无 Key 时自动 Mock）
USE_MOCK_DATA=true

# 分享图二维码域名
NEXT_PUBLIC_SITE_URL=https://desk.zeabur.app

# Supabase（可选，统计功能）
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx
```

---

## 8. 设计系统（Tailwind）

| Token | 值 | 用途 |
|-------|-----|------|
| background | #FFF8F5 | 页面底色 |
| primary | #8B7CF6 | 主色紫 |
| secondary | #FFB5C2 | 粉 |
| accent | #FFD166 | 黄 |
| text | #4A4458 | 正文 |
| muted | #9B93A8 | 次要文字 |

字体：PingFang SC / 微软雅黑。移动端减少 blur 和无限动画以减轻 GPU 压力。

---

## 9. 本地开发

```bash
cd desk-speaks
npm install
cp .env.example .env.local   # 填入 API Key
npm run dev                  # http://localhost:3000
npm run build                # 生产构建
npm start                    # 生产模式启动
```

**调试脚本：**

- node scripts/test-models.mjs — 测 Qwen 模型
- node scripts/test-supabase.mjs — 测数据库连接

---

## 10. 部署（Zeabur）

- 监听 GitHub main 分支 push 自动部署
- Node 版本：20.x（.node-version + package.json engines）
- 构建：npm run build → next start
- 需在 Zeabur 环境变量中配置 DASHSCOPE_API_KEY、NEXT_PUBLIC_SITE_URL 等
- ESLint 在构建时跳过（next.config.mjs）

---

## 11. 功能清单

| 功能 | 状态 |
|------|------|
| 工位照片 AI 分析 | 已完成 |
| 5 层报告滑动展示 | 已完成 |
| 工位目击 / MBTI / 星座 / 来信 | 已完成 |
| Canvas 分享鉴定卡 + 微信保存 | 已完成 |
| 分析失败重试 UX | 已完成 |
| 全站页脚 copyright | 已完成 |
| 办公好物推荐页 + 京粉链接 | 已完成 |
| Supabase traits 统计 API | 已完成（需配置） |
| 用户登录 / 历史报告 | 未做 |

---

## 12. 源文件索引（逐文件说明）

| 文件 | 职责 |
|------|------|
| app/layout.tsx | 根 HTML、metadata、viewport |
| app/page.tsx | 首页落地页 UI |
| app/upload/page.tsx | 上传流程，写 sessionStorage |
| app/analyzing/page.tsx | 调用 analyze API，错误重试 |
| app/report/page.tsx | 读取报告，渲染 ReportSwiper |
| app/recommend/page.tsx | 办公好物列表页 |
| app/api/analyze/route.ts | Qwen-VL 视觉分析 API |
| app/api/stats/route.ts | 相似工位统计 API |
| lib/types.ts | TypeScript 类型定义 |
| lib/prompts.ts | System Prompt、Mock 数据、等待文案 |
| lib/report.ts | normalizeReport、reportToCards、Storage Keys |
| lib/image.ts | 图片压缩与 base64 工具 |
| lib/share-image.ts | Canvas 绘制分享鉴定卡 |
| lib/share-copy.ts | 分享按钮/提示文案 |
| lib/site-copy.ts | 页脚 copyright 文案 |
| lib/office-picks.ts | 好物数据与京粉链接 |
| lib/stats.ts | Supabase 写入与统计查询 |
| lib/supabase.ts | Supabase Admin 单例客户端 |
| supabase/schema.sql | 数据库表结构 |
| components/report/ReportCard.tsx | 单张报告卡 UI |
| components/report/ReportSwiper.tsx | 报告滑动切换 |
| components/report/SharePreviewCard.tsx | 鉴定卡预览 |
| components/report/ShareImageButton.tsx | 触发生成分享图 |
| components/report/ShareImageSaveOverlay.tsx | 微信保存引导 |
| components/upload/PhotoUploader.tsx | 选图、预览、压缩 |
| components/analyzing/ThinkingStatus.tsx | 分析等待动画 |
| components/analyzing/AnalyzeErrorPanel.tsx | 失败/超时面板 |
| components/ui/SiteFooter.tsx | 全站页脚 |
| components/ui/GradientBackground.tsx | 渐变背景容器 |

---

*文档生成日期：2026-06-22*
