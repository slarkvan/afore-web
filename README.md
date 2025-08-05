# Afore Web - 产品展示管理系统

一个现代化的产品展示网站，包含完整的后台管理系统。用户可以通过管理面板管理产品分类（支持二级分类）和产品信息，前端展示产品供公众浏览。

> 本指南专为零基础开发者编写，将详细介绍如何搭建开发环境并开始开发。

## 功能特性

### 前台展示
- 🏠 响应式首页设计
- 📱 移动端适配
- 🔍 产品搜索和筛选
- 📂 二级分类导航
- 📄 静态页面管理
- 🔗 SEO 优化

### 管理后台
- 👥 用户角色管理（超级管理员、普通管理员）
- 📦 产品管理（CRUD、多图片上传、SEO设置）
- 🗂️ 分类管理（二级分类、排序、状态管理）
- 📄 静态页面管理
- 📊 数据统计面板

## 技术栈

- **前端**: Next.js 15 + TypeScript + Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: PostgreSQL + Prisma ORM
- **认证**: JWT + HTTP-only Cookies
- **文件处理**: Sharp (图片处理)
- **容器化**: Docker + Docker Compose

## 🚀 零基础快速开始

### 📋 环境要求

在开始之前，请确保你的电脑已安装以下软件：

1. **Node.js** (版本 18.0 或更高)
   - [Windows/Mac 下载地址](https://nodejs.org/)
   - 安装后在终端运行 `node --version` 确认安装成功

2. **pnpm** (包管理器，比 npm 更快)
   ```bash
   # 安装 Node.js 后运行以下命令安装 pnpm
   npm install -g pnpm
   ```

3. **Git** (代码版本管理)
   - [下载地址](https://git-scm.com/)

4. **Docker** (可选，用于数据库，推荐使用)
   - [下载地址](https://www.docker.com/)

5. **代码编辑器**
   - 推荐 [VS Code](https://code.visualstudio.com/)

### 🎯 第一次运行项目

#### 步骤 1: 获取项目代码

```bash
# 在终端中运行以下命令（将项目克隆到本地）
git clone <项目地址>
cd afore-web
```

#### 步骤 2: 安装项目依赖

```bash
# 安装项目所需的所有依赖包（第一次运行可能需要几分钟）
pnpm install
```

#### 步骤 3: 准备数据库

**方法一：使用 Docker（推荐，简单）**
```bash
# 启动 PostgreSQL 数据库（Docker 会自动下载并启动）
docker-compose up -d
```

**方法二：手动安装 PostgreSQL**
- 下载并安装 [PostgreSQL](https://www.postgresql.org/download/)
- 创建数据库用户和数据库

#### 步骤 4: 配置环境变量

```bash
# 复制环境变量模板文件
cp .env.local.example .env.local

# 用文本编辑器打开 .env.local 文件，确保数据库连接信息正确
```

如果使用 Docker，默认配置即可。如果手动安装数据库，需要修改数据库连接字符串。

#### 步骤 5: 初始化数据库

```bash
# 生成 Prisma 客户端（数据库操作工具）
pnpm prisma generate

# 创建数据库表结构
pnpm prisma db push

# 初始化示例数据（可选，包含测试用户和数据）
pnpm run db:seed
```

#### 步骤 6: 启动开发服务器

```bash
# 启动开发环境（支持热重载，修改代码自动刷新）
pnpm run dev
```

#### 步骤 7: 访问网站

启动成功后，你可以在浏览器中访问：

- **前端网站**: http://localhost:3000
- **管理后台**: http://localhost:3000/admin
- **数据库管理**: `pnpm prisma studio`（在新终端运行，然后访问 http://localhost:5555）

**默认管理员账号**: 
- 邮箱: `admin@afore.com`
- 密码: `admin123`

### 🎉 恭喜！你已成功启动项目

现在你可以：
1. 在浏览器访问前端网站，查看产品展示效果
2. 登录管理后台，尝试添加分类和产品
3. 在 VS Code 中打开项目，开始编写代码

### 🧪 测试认证系统（可选）

```bash
# 确保应用正在运行的情况下，在新终端运行
pnpm run test:auth
```

## 🛠️ 开发指南

### 📁 项目结构说明

```
src/
├── app/                     # Next.js App Router 路由文件
│   ├── (frontend)/         # 前端公共页面（首页、产品列表等）
│   ├── admin/              # 后台管理系统页面
│   │   ├── dashboard/      # 管理首页
│   │   ├── products/       # 产品管理
│   │   ├── categories/     # 分类管理
│   │   └── users/          # 用户管理
│   └── api/                # API 接口（后端逻辑）
├── components/             # React 组件
│   ├── frontend/           # 前端页面组件
│   ├── admin/              # 后台管理组件
│   └── ui/                 # 基础 UI 组件（按钮、表单等）
├── lib/                    # 工具函数和配置
├── types/                  # TypeScript 类型定义
└── stores/                 # 状态管理
```

### 🎯 开发工作流程

#### 1. 创建新功能的基本步骤

```bash
# 1. 创建新的功能分支
git checkout -b feature/新功能名称

# 2. 启动开发服务器（如果还没启动）
pnpm run dev

# 3. 在 src/ 目录下编辑相关文件
# 4. 在浏览器中查看效果
# 5. 提交代码
git add .
git commit -m "添加新功能"
```

#### 2. 修改数据库结构

当你需要修改数据库表结构时：

```bash
# 1. 编辑 prisma/schema.prisma 文件
# 2. 推送到开发数据库
pnpm prisma db push

# 或者创建迁移文件（生产环境推荐）
pnpm prisma migrate dev --name 描述修改内容
```

#### 3. 添加新的 UI 组件

项目使用 shadcn/ui 组件库，添加新组件：

```bash
# 查看可用组件
pnpm dlx shadcn@latest add --help

# 添加常用组件
pnpm dlx shadcn@latest add button    # 按钮
pnpm dlx shadcn@latest add input     # 输入框
pnpm dlx shadcn@latest add dialog    # 对话框
pnpm dlx shadcn@latest add table     # 表格
```

### 🔧 常用开发命令

```bash
# 📦 项目运行
pnpm run dev           # 启动开发服务器（支持热重载）
pnpm run build         # 构建生产版本
pnpm start             # 启动生产服务器
pnpm run lint          # 检查代码规范

# 🗄️ 数据库操作
pnpm prisma generate   # 生成 Prisma 客户端
pnpm prisma db push    # 推送数据库结构变更
pnpm prisma studio     # 打开数据库管理界面
pnpm prisma migrate dev # 创建数据库迁移文件
pnpm run db:seed       # 重新初始化示例数据
pnpm run test:auth     # 测试认证系统

# 🐳 Docker 操作
docker-compose up -d      # 后台启动所有服务
docker-compose down       # 停止所有服务
docker-compose logs       # 查看服务日志
docker-compose restart    # 重启服务
```

### 🐛 常见问题解决

#### 问题 1: 数据库连接失败
```bash
# 检查 Docker 是否运行
docker ps

# 重启数据库服务
docker-compose restart db

# 检查环境变量配置
cat .env.local
```

#### 问题 2: 端口被占用
```bash
# 查看端口占用情况
lsof -i :3000

# 或者指定其他端口启动
pnpm run dev -- -p 3001
```

#### 问题 3: 依赖安装失败
```bash
# 清除缓存重新安装
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### 问题 4: 图片上传失败
```bash
# 检查上传目录权限
ls -la uploads/

# 创建上传目录（如果不存在）
mkdir -p uploads/products
```

### 🔐 环境变量配置

创建 `.env.local` 文件并配置以下变量：

```env
# 数据库连接（使用 Docker 默认配置）
DATABASE_URL="postgresql://afore_user:afore_password@localhost:5432/afore_db"

# JWT 认证配置（生产环境请修改密钥）
JWT_SECRET="your-jwt-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"

# 文件上传配置
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=5242880  # 5MB
```

## 🚀 部署到生产环境

### 使用 Docker 部署（推荐）

```bash
# 1. 修改生产环境配置
cp .env.local .env.production
# 编辑 .env.production，设置生产环境的数据库和密钥

# 2. 构建和启动生产环境
docker-compose -f docker-compose.prod.yml up -d
```

### 传统部署方式

```bash
# 1. 安装依赖
pnpm install --frozen-lockfile

# 2. 构建项目
pnpm run build

# 3. 启动生产服务器
pnpm start
```

## 📚 学习资源（零基础推荐）

如果你是编程新手，建议按以下顺序学习：

### 1. 基础知识
- **HTML/CSS 基础**: [MDN Web 文档](https://developer.mozilla.org/zh-CN/)
- **JavaScript 基础**: [现代 JavaScript 教程](https://zh.javascript.info/)
- **Git 版本控制**: [Git 教程](https://www.liaoxuefeng.com/wiki/896043488029600)

### 2. 框架学习
- **React 基础**: [React 官方教程](https://react.dev/learn)
- **Next.js 框架**: [Next.js 中文文档](https://nextjs.org/docs)
- **TypeScript**: [TypeScript 手册](https://www.typescriptlang.org/docs/)

### 3. 样式和 UI
- **Tailwind CSS**: [Tailwind CSS 文档](https://tailwindcss.com/docs)
- **shadcn/ui 组件**: [shadcn/ui 文档](https://ui.shadcn.com/)

### 4. 数据库
- **SQL 基础**: [SQL 教程](https://www.runoob.com/sql/sql-tutorial.html)
- **Prisma ORM**: [Prisma 中文文档](https://prisma.org.cn/docs/)

### 📝 代码规范

为了保持代码质量，请遵循以下规范：

- 使用 TypeScript 进行类型检查
- 遵循 ESLint 规则（运行 `pnpm run lint` 检查）
- 组件名使用 PascalCase（如 `ProductForm`）
- 文件名使用 kebab-case（如 `user-form.tsx`）
- 提交代码前运行检查命令

### 💡 开发技巧

1. **使用热重载**: 修改代码后浏览器会自动刷新
2. **查看数据库**: 使用 `pnpm prisma studio` 查看数据
3. **调试技巧**: 使用 `console.log()` 输出调试信息
4. **查看错误**: 打开浏览器开发者工具查看错误信息

## 🤝 贡献指南

欢迎参与项目开发！按照以下步骤贡献代码：

1. **Fork 项目** - 点击右上角的 Fork 按钮
2. **克隆到本地** - `git clone <你的fork地址>`
3. **创建分支** - `git checkout -b feature/新功能名称`
4. **编写代码** - 按照代码规范开发新功能
5. **测试功能** - 确保功能正常运行
6. **提交代码** - `git commit -m "添加新功能"`
7. **推送分支** - `git push origin feature/新功能名称`
8. **创建 PR** - 在 GitHub 上创建 Pull Request

### 🐛 报告问题

发现 Bug？请提供以下信息：
- 操作系统和浏览器版本
- 复现步骤
- 错误截图或日志
- 期望的行为

## 📞 获取帮助

- **查看文档**: 首先阅读本 README 和 CLAUDE.md
- **搜索问题**: 在 Issues 中搜索类似问题
- **提交新问题**: 创建详细的 Issue
- **加入讨论**: 参与 Discussions 讨论

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

---

## 🎉 快速上手总结

1. **安装环境**: Node.js + pnpm + Docker
2. **获取代码**: `git clone` 并 `cd afore-web`
3. **安装依赖**: `pnpm install`
4. **启动数据库**: `docker-compose up -d`
5. **初始化**: `pnpm prisma db push && pnpm run db:seed`
6. **启动项目**: `pnpm run dev`
7. **开始开发**: 访问 http://localhost:3000

**遇到问题？** 查看上面的常见问题解决方案，或创建 Issue 寻求帮助！

祝你开发愉快！ 🚀