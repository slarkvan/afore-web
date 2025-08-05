# Afore 产品展示平台

一个基于 Next.js 的现代化产品展示和管理平台，支持二级分类管理、产品管理、用户权限控制等功能。

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

## 快速开始

### 1. 使用 Docker（推荐）

```bash
# 克隆项目
git clone <your-repo-url>
cd afore-web

# 启动服务
docker-compose up -d

# 等待服务启动完成后，进行数据库初始化
docker-compose exec app pnpm prisma db push
docker-compose exec app pnpm run db:seed
```

### 2. 本地开发

#### 前置要求
- Node.js 18+
- PostgreSQL 15+
- pnpm 8+ (推荐) 或 npm/yarn

#### 安装步骤

```bash
# 安装依赖
pnpm install

# 启动 PostgreSQL 数据库（或使用 Docker）
docker run --name postgres -e POSTGRES_USER=afore_user -e POSTGRES_PASSWORD=afore_password -e POSTGRES_DB=afore_db -p 5432:5432 -d postgres:15

# 配置环境变量
cp .env.local.example .env.local
# 编辑 .env.local 文件，配置数据库连接等信息

# 初始化数据库
pnpm prisma db push
pnpm run db:seed

# 启动开发服务器
pnpm run dev
```

### 3. 访问应用

- **前台地址**: http://localhost:3000
- **管理后台**: http://localhost:3000/admin
- **默认管理员账号**: admin@afore.com / admin123

### 4. 测试认证系统

```bash
# 确保应用正在运行
pnpm run dev

# 在另一个终端运行认证测试
pnpm run test:auth
```

## 环境变量配置

创建 `.env.local` 文件并配置以下变量：

```env
# 数据库连接
DATABASE_URL="postgresql://afore_user:afore_password@localhost:5432/afore_db"

# JWT 认证配置
JWT_SECRET="your-jwt-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"

# 上传配置
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=5242880  # 5MB
```

## 开发命令

```bash
# 开发服务器
pnpm run dev

# 构建项目
pnpm run build

# 启动生产服务器
pnpm start

# 数据库相关
pnpm run db:push        # 推送 schema 到数据库
pnpm run db:migrate     # 创建数据库迁移
pnpm run db:studio      # 打开 Prisma Studio
pnpm run db:seed        # 初始化示例数据
pnpm run test:auth      # 测试认证系统

# 代码检查
pnpm run lint
```

## Docker 命令

```bash
# 启动所有服务
docker-compose up -d

# 停止服务
docker-compose down

# 查看日志
docker-compose logs

# 重新构建镜像
docker-compose build

# 进入应用容器
docker-compose exec app sh
```

## 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── (frontend)/        # 前台页面
│   ├── admin/             # 管理后台
│   ├── api/               # API 路由
│   └── globals.css        # 全局样式
├── components/            # React 组件
│   ├── admin/            # 管理后台组件
│   ├── frontend/         # 前台组件
│   └── ui/               # 通用 UI 组件
├── lib/                  # 工具库
├── types/                # TypeScript 类型
└── middleware.ts         # 中间件
```

## 部署

### Docker 生产部署

1. 修改 `docker-compose.yml` 中的环境变量
2. 构建并启动容器：

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 传统部署

1. 构建项目：`pnpm run build`
2. 启动生产服务器：`pnpm start`
3. 配置反向代理（Nginx 等）

## 常见问题

### 数据库连接问题
- 确保 PostgreSQL 服务已启动
- 检查 `.env.local` 中的数据库连接字符串
- 验证数据库用户权限

### 文件上传问题
- 检查 `uploads` 目录权限
- 确认 `MAX_FILE_SIZE` 配置
- 验证磁盘空间

### 认证问题
- 确保 `JWT_SECRET` 已设置
- 检查认证 cookie 设置
- 清除浏览器 cookies 重试
- 验证用户账号状态（isActive = true）

## 贡献指南

1. Fork 项目
2. 创建功能分支：`git checkout -b feature/new-feature`
3. 提交更改：`git commit -am 'Add new feature'`
4. 推送分支：`git push origin feature/new-feature`
5. 提交 Pull Request

## 许可证

MIT License

## 支持

如有问题，请创建 [Issue](https://github.com/your-repo/issues) 或联系开发团队。