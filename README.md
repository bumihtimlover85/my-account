# 项目看板 — 团队任务管理

> 一个现代化、响应式的项目管理看板应用，支持拖拽排序、子任务管理和团队协作。

![Next.js](https://img.shields.io/badge/Next.js-16.2.4-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.2.4-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)
![Prisma](https://img.shields.io/badge/Prisma-5-2d3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169e1?logo=postgresql)

---

## ✨ 功能特性

| 特性 | 说明 |
|------|------|
| 📋 **四列看板** | 待办 → 进行中 → 测试中 → 已完成 |
| 🖱️ **拖拽排序** | 基于 @dnd-kit 的流畅拖拽，支持跨列移动 |
| 🏷️ **优先级管理** | 高/中/低 三级优先级标记 |
| ✅ **子任务** | 卡片内添加子任务，进度条可视化 |
| 💬 **评论系统** | 卡片内实时评论，团队成员可参与讨论 |
| 🔐 **用户认证** | JWT 认证，bcrypt 密码加密 |
| 🌙 **深色模式** | 支持亮色/暗色主题切换，跟随系统偏好 |
| 🎨 **精美 UI** | 双边框卡片设计、毛玻璃导航、弹性动画 |
| 📱 **响应式** | 完美适配桌面端和移动端 |

## 🛠️ 技术栈

- **框架：** [Next.js 16](https://nextjs.org/) (App Router)
- **前端：** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **样式：** [Tailwind CSS 4](https://tailwindcss.com/) + 自定义设计 Token
- **动画：** CSS 自定义贝塞尔曲线 + 弹性物理动画
- **数据库：** [PostgreSQL](https://www.postgresql.org/) + [Prisma ORM](https://www.prisma.io/)
- **拖拽：** [@dnd-kit](https://dndkit.com/)
- **图标：** [Lucide](https://lucide.dev/)
- **认证：** JWT + bcryptjs

## 🚀 快速开始

### 前置要求

- Node.js >= 22
- PostgreSQL 16+

### 安装

```bash
# 克隆仓库
git clone https://github.com/bumihtimlover85/my-account.git
cd my-account

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 填写数据库连接信息
```

### 配置

创建 `.env` 文件：

```env
POSTGRES_PRISMA_URL="postgresql://用户名:密码@localhost:5432/myaccount"
JWT_SECRET="你的JWT密钥"
```

### 启动

```bash
# 同步数据库
npx prisma db push

# 启动开发服务器
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 即可使用。

## 📁 项目结构

```
my-account/
├── app/                    # Next.js App Router
│   ├── actions.ts          # Server Actions
│   ├── layout.tsx          # 根布局
│   ├── page.tsx            # 首页（看板）
│   ├── login/              # 登录页
│   ├── register/           # 注册页
│   └── globals.css         # 全局样式 + 设计 Token
├── components/             # React 组件
│   ├── navbar.tsx          # 浮动导航栏
│   ├── kanban-board.tsx    # 看板主体
│   ├── kanban-column.tsx   # 看板列
│   ├── kanban-card.tsx     # 看板卡片
│   ├── card-modal.tsx      # 卡片详情弹窗
│   ├── add-card-modal.tsx  # 新增卡片弹窗
│   └── theme-provider.tsx  # 深色模式
├── lib/                    # 工具库
│   ├── auth.ts             # JWT 认证
│   ├── prisma.ts           # Prisma 客户端
│   └── utils.ts            # 通用工具
├── prisma/                 # 数据库
│   └── schema.prisma       # 数据模型
├── types/                  # TypeScript 类型
└── public/                 # 静态资源
```

## 🧪 测试

```bash
# 单元测试
npm test

# E2E 测试
npm run test:e2e
```

## 📄 许可证

[MIT](LICENSE)
