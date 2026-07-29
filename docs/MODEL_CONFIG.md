# 工位改造 · 模型配置说明

## 一次完整改造的调用链

```
用户上传工位图
    │
    ▼
① Qwen 视觉分析（qwen-vl-plus）
    │  输出 RenovationPlan JSON：bareDesk / organizePrompt / decorPrompt …
    ▼
② 万相效果图（WANX_EDIT_MODEL，失败可降级 WANX_FALLBACK_EDIT_MODEL）
    │
    ▼
报告页：前后对比 + 三步文字方案
```

| 步骤 | 环境变量 | 默认模型 | 次数 |
|------|----------|----------|------|
| 方案分析 | `QWEN_VL_MODEL` | `qwen-vl-plus` | 1 |
| 效果图 | `WANX_EDIT_MODEL` | `wan2.6-image` | 1～2（见两 pass） |

---

## 三类万相模型路径

代码根据 `WANX_EDIT_MODEL` 的 model id 自动分流（`lib/renovation/image-gen.ts`）：

### 路径 A · wan2.6 / wan2.7（推荐，当前默认）

| 项目 | 说明 |
|------|------|
| 模型 id | `wan2.6-image`、`wan2.7-image`、`wan2.7-image-pro` |
| API | `image-generation/generation`（messages：图 + 文本） |
| Prompt | `buildI2iPrompt` / 两 pass 用 `buildOrganizePassPrompt` + `buildDecorPassPrompt` |
| 参数 | `WANX_IMAGE_SIZE`（默认 `2K`）、`WANX_TWO_PASS` |
| 单价 | 2.6/2.7 标准版 0.20 元/张；2.7-pro 0.50 元/张 |

### 路径 B · wan2.5-i2i-preview（营销图 v10c 同款）

| 项目 | 说明 |
|------|------|
| API | `image2image/image-synthesis`（`input.images` + `input.prompt`） |
| Prompt | 同路径 A |
| 特性 | 支持 `negative_prompt`、`WANX_PROMPT_EXTEND`、`WANX_SEED` |
| 单价 | 0.20 元/张，免费 50 张（与 2.6 额度独立） |

### 路径 C · wanx2.1-imageedit（降级 / 省钱）

| 项目 | 说明 |
|------|------|
| API | `image2image/image-synthesis`（`function: description_edit` + `strength`） |
| Prompt | 专用短 prompt：`buildDescriptionEditSinglePassPrompt`（≤480 字） |
| 两 pass | `WANX_IMAGEEDIT_TWO_PASS=true` 时启用，strength 由 `WANX_ORGANIZE_STRENGTH` / `WANX_DECOR_STRENGTH` 控制 |
| 单价 | 0.14 元/张，免费 500 张；整理效果弱于 A/B |

---

## 两 pass 逻辑（对齐营销脚本 v4 → v10c）

| 模型族 | 开关 | Pass 1 | Pass 2 |
|--------|------|--------|--------|
| wan2.6 / 2.7 / 2.5-i2i | `WANX_TWO_PASS=true` | 只做收纳，禁止装饰 | 保留收纳布局，加 1 件点缀 |
| wanx2.1-imageedit | `WANX_IMAGEEDIT_TWO_PASS=true` | description_edit 收纳 | description_edit 点缀 |

默认均为 **单 pass**（`false`），每次改造只消耗 1 次万相额度。

Pass 2 失败时回退 Pass 1 结果。

---

## 自动降级

```
WANX_EDIT_MODEL（主模型）
    │ 成功 → 返回 URL
    │ 失败 / 额度不足（quota 关键词）
    ▼
WANX_FALLBACK_EDIT_MODEL（默认 wanx2.1-imageedit，设 none 关闭）
```

`WANX_AUTO_FALLBACK=false` 可关闭降级。

---

## 环境变量速查

```env
# 视觉方案
QWEN_VL_MODEL=qwen-vl-plus

# 万相主模型（推荐 wan2.6-image）
WANX_EDIT_MODEL=wan2.6-image
WANX_FALLBACK_EDIT_MODEL=wanx2.1-imageedit   # none = 不降级
WANX_IMAGE_SIZE=2K

# 两 pass（每改造 +1 次万相调用）
WANX_TWO_PASS=false
WANX_IMAGEEDIT_TWO_PASS=false

# imageedit 专用
WANX_EDIT_STRENGTH=0.55
WANX_ORGANIZE_STRENGTH=0.62
WANX_DECOR_STRENGTH=0.48

# i2i 专用
# WANX_PROMPT_EXTEND=false
# WANX_SEED=42

# 跳过效果图（仅文字方案）
# SKIP_WANX_IMAGE=true
```

---

## 关键源码

| 文件 | 职责 |
|------|------|
| `lib/renovation/analyze.ts` | Qwen 视觉 → RenovationPlan |
| `lib/renovation/image-gen.ts` | 万相分流、两 pass、降级、轮询 |
| `lib/renovation/image-prompt.ts` | 各路径 prompt 构建 |
| `lib/renovation/prompts.ts` | Qwen 三步法 system prompt |
| `app/api/analyze/route.ts` | POST 串联 analyze + generate |
| `scripts/test-wan-edit.mjs` | 本地调试万相 |
| `scripts/generate-marketing-afters.mjs` | 首页营销图批量生成 |

---

## 本地调试

```bash
# 万相单图测试
node --env-file=.env.local scripts/test-wan-edit.mjs path/to/desk.jpg

# 多模型对比
node --env-file=.env.local scripts/benchmark-image-models.mjs test-fixtures/desk-test.png
```

修改 `.env.local` 后需重启 `npm run dev`。
