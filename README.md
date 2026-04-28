# 基于 Vue3 + Node.js 的失物招领信息管理系统

本项目采用前后端分离架构：
- 前端：Vue3 + Vite + Pinia + Vue Router + Element Plus
- 后端：Node.js + Express + Multer
- 数据库：MySQL

已实现功能：
- 用户注册与登录（JWT 鉴权）
- 失物信息发布与查询（支持上传图片）
- 招领信息发布与查询（支持上传图片）
- 用户管理（管理员可查看用户并修改角色）
- 页面返回上一级按钮（更自然的操作路径）

## 目录结构

```text
Lost_and_Found_information_release_system/
├── backend
└── frontend
```

## 后端启动

1. 进入后端目录：
```bash
cd backend
```

2. 安装依赖：
```bash
npm install
```

3. 配置环境变量：
- 将 `.env.example` 复制为 `.env`
- 根据你的 MySQL 信息修改配置

4. 启动后端：
```bash
npm run dev
```

后端默认运行在：`http://localhost:3000`

## 前端启动

1. 进入前端目录：
```bash
cd frontend
```

2. 安装依赖：
```bash
npm install
```

3. 启动前端：
```bash
npm run dev
```

前端默认运行在：`http://localhost:5173`

## 默认管理员

- 用户名：`admin`
- 密码：`admin123`

首次启动后端时会自动建表，并自动创建默认管理员账号。
