# 林同学的桌游助手

一个面向线下桌游的微信小程序辅助工具。它适合把手机放在桌面中央，由多名玩家共用一台设备完成主题选择、开局设置、掷点、事件抽取、卡牌查看、景点/城池结算和地图下载打印。

> **开源说明**
> 本仓库为公开发布版本，已对私有配置做脱敏处理：微信小程序 AppID、私有 CDN 域名、本机绝对路径、原有代码托管地址均已替换为占位符。
> 如需跑通完整功能，请按下面「运行前必改的配置」替换成你自己的信息。

```text
林同学的桌游助手：支持三国起源与潮汕游玩记双主题的微信小程序桌游辅助工具，提供主题地图、事件卡、人物/美食卡、本地对局和语音引导。
```

## 运行前必改的配置

| 位置 | 占位符 | 说明 |
| --- | --- | --- |
| `project.config.json`、`miniprogram/project.config.json` | `wxYOUR_APPID_000000` | 换成你自己的微信小程序 AppID |
| 全部主题与工具文件（约 210 处） | `https://cdn.example.com/cdn-upload-final` | 换成你自己的静态资源 CDN 前缀 |
| `backend/.env.example` | `YUNWU_API_KEY=` | 图片/语音生成服务的 Key，只放本地 `.env` |

批量替换 CDN 前缀示例（Windows PowerShell）：

```powershell
Get-ChildItem -Recurse -Include *.js,*.json,*.md |
  Where-Object { $_.FullName -notmatch '\\assets\\' } |
  ForEach-Object {
    (Get-Content $_.FullName -Raw).Replace('cdn.example.com', '你的CDN域名') |
      Set-Content $_.FullName -NoNewline
  }
```

## 项目定位

- 当前小程序名：林同学的桌游助手。
- 当前核心模式：一台手机同屏操作，多名线下玩家轮流使用。
- 当前主题：三国起源、潮汕游玩记、时空旅行飞行棋、魔法门之英雄无敌、骰子工具。
- 当前数据方式：优先使用前端本地缓存完成对局流程，不依赖后端才能游玩。
- 当前静态资源：图片、地图和音频优先引用 CDN。

## 功能亮点

- 引导式首页：先选择主题，再设置人数、回合、掷点方式、胜利目标和初始卡。
- 多主题切换：三国起源偏城池经营、人物卡和历史事件；潮汕游玩记偏景点经营、美食卡收集和地方游玩事件。
- 主题地图：支持三国/潮汕分类切换，地图卡片可查看大图、缩放拖动和下载图片自行打印。
- 对局设置：支持 2-6 人、固定回合或自定义回合、系统自动掷点或线下掷点。
- 胜利目标：可按城池/景点、银两、声望/人气、粮草/体力、人物卡/美食卡等目标结算。
- 卡片系统：三国主题使用人物卡，潮汕主题使用美食卡，初始卡会作为玩家身份和开局收藏。
- 景点/城池资料：底部入口可查看当前主题的景点或城池列表与介绍。
- 语音辅助：主题开场、设置页说明、事件、卡片和景点/城池介绍均按主题配置音频。
- 本地对局：支持创建新局、继续缓存对局、清空缓存对局。

## 主题一览

### 三国起源

以东汉末年到群雄并起为背景，围绕 30 格棋盘推进。玩家选择初始人物卡，经营城池，抽取黄巾、讨董、虎牢关等早期历史事件，并通过银两、粮草、声望、人物卡和城池数量争取胜利。

### 潮汕游玩记

以潮汕美食与景点游玩为背景。玩家选择初始美食卡，沿棋盘打卡景点、经营景点收益、收集 24 张美食卡，并在游玩事件中获得银两、人气、体力或其它主题收益。

### 时空旅行飞行棋

传统飞行棋辅助模式，按线下实体棋盘处理，每人 4 枚棋子，保留起飞、同色格跳跃、虚线飞行、终点刚好到达、超过终点倒退、连续三个 6 回机场等规则。

### 魔法门之英雄无敌

城镇经营与英雄养成辅助模式，按主题数据配置城镇、英雄与事件。

### 骰子工具

独立的多骰子摇点工具页，服务于线下主持人临时记点。

## 主要目录

```text
miniprogram/                    微信小程序代码
miniprogram/pages/home/         首页、主题选择与开局设置
miniprogram/pages/room/         对局页面
miniprogram/pages/characters/   人物卡 / 美食卡页面
miniprogram/pages/cities/       城池 / 景点页面
miniprogram/pages/events/       事件卡页面
miniprogram/pages/theme-map/    主题地图查看与下载页面
miniprogram/pages/dice-tool/    独立骰子工具页
miniprogram/themes/             主题注册与各主题数据
miniprogram/utils/              本地缓存、音频、主题数据等工具
miniprogram/assets/chaoshan/    潮汕主题本地素材（不参与小程序打包）
backend/                        后端服务与历史接口代码
backend/data/                   本地 SQLite 数据目录（数据库文件不入库）
tools/                          生成地图、素材处理等工具脚本
output/scripts/                 素材批处理与压缩脚本
docs/design/                    设计稿与素材清单
```

> 说明：开源版不含生成中间产物与原始大图备份（`output/tmp`、`output/print-map`、`output/imagegen`、`output/cdn-upload-final-original-backup` 等），正式引用的图片与音频走 CDN。

## 本地运行

### 微信小程序

1. 使用微信开发者工具打开项目根目录。
2. 先按「运行前必改的配置」替换 AppID。
3. 页面入口配置位于 `miniprogram/app.json`。
4. 本地调试静态 CDN 资源时，需要确认微信开发者工具的域名校验设置符合当前调试方式。

### 后端服务

当前游玩流程优先使用小程序本地缓存，后端目录仍保留用于历史接口、图片生成、监控和测试。

```bash
cd backend
cp .env.example .env          # 填入自己的 YUNWU_API_KEY
npm install --registry=https://registry.npmmirror.com
npm run init-db -- --reset
npm run dev
```

默认地址：`http://127.0.0.1:3100`

## 资源与 CDN

- 当前 CDN 前缀：`https://cdn.example.com/cdn-upload-final`（占位，需替换）。
- 最终上传资源统一放在 `output/cdn-upload-final`。
- 本地原图和源素材放在备份目录，避免和最终上传目录混在一起。
- 小程序静态大资源不要依赖本地兜底，优先使用 CDN 地址。
- 图片超过项目限制时，需要压缩后再进入最终上传目录。
- API Key、TTS Key、图片生成 Key 只能放在本地环境变量或后端环境文件中，不能写入小程序前端。

## 验证方式

```bash
node --check miniprogram/pages/home/home.js
node --check miniprogram/pages/theme-map/theme-map.js

cd backend && npm test
```

## 维护说明

- 修改前优先阅读根目录 `AGENTS.md`。
- 每次修改需要追加更新根目录 `更新记录.md`。
- 主题扩展优先放在 `miniprogram/themes/` 下独立目录中，便于后续继续增加新主题。
- 新主题需要同时考虑：主题配置、主题数据、首页图、地图图、事件图、卡片图、介绍音频和 CDN 上传目录。
- 前端样式避免使用紫色或紫蓝色作为主色。

## 声明

本项目为个人桌游辅助工具，历史人物与事件素材均基于公开历史资料创作。仓库不含任何真实用户数据、密钥或私有服务配置。
