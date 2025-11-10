# 部署问题修复指南

## 问题：PM2 找不到构建文件

### 错误信息
```
[PM2][ERROR] Script not found: /var/www/DormHub/dist/server/index.js
```

### 解决方案

#### 步骤 1: 确保构建成功

```bash
cd /var/www/DormHub

# 清理旧的构建文件
rm -rf dist

# 重新构建
npm run build
```

#### 步骤 2: 验证构建输出

```bash
# 检查文件是否存在
ls -la dist/server/index.js

# 如果文件存在，应该能看到输出
```

#### 步骤 3: 使用正确的路径启动 PM2

如果文件在 `dist/index.js`（而不是 `dist/server/index.js`），需要：

**选项 A: 修改 PM2 配置**

编辑 `ecosystem.config.js`，将：
```javascript
script: './dist/server/index.js',
```
改为实际的文件路径。

**选项 B: 使用绝对路径**

```bash
# 使用绝对路径启动
pm2 start /var/www/DormHub/dist/server/index.js --name dormhub-video --env PORT=8000
```

**选项 C: 使用 npm 脚本**

```bash
# 使用 package.json 中的脚本
pm2 start npm --name dormhub-video -- run start:prod
```

#### 步骤 4: 验证 PM2 启动

```bash
# 查看 PM2 状态
pm2 status

# 查看日志
pm2 logs dormhub-video

# 查看详细信息
pm2 describe dormhub-video
```

## 完整部署流程

```bash
# 1. 进入项目目录
cd /var/www/DormHub

# 2. 安装依赖（如果还没安装）
npm install

# 3. 清理并重新构建
rm -rf dist
npm run build

# 4. 验证构建文件
ls -la dist/server/index.js

# 5. 创建必要目录
mkdir -p videos hls logs

# 6. 启动 PM2（使用绝对路径）
pm2 start /var/www/DormHub/dist/server/index.js \
  --name dormhub-video \
  --env NODE_ENV=production \
  --env PORT=8000

# 或使用 ecosystem 配置
pm2 start ecosystem.config.js

# 7. 保存 PM2 配置
pm2 save

# 8. 设置开机自启
pm2 startup
# 按照输出的命令执行

# 9. 查看状态
pm2 status
pm2 logs dormhub-video
```

## 常见问题

### 问题 1: 构建失败

```bash
# 检查 TypeScript 错误
npm run build:server

# 检查 Node 版本（需要 v18+）
node --version

# 检查依赖是否安装
npm install
```

### 问题 2: 文件权限问题

```bash
# 确保文件有执行权限
chmod +x dist/server/index.js

# 检查目录权限
ls -la dist/server/
```

### 问题 3: 模块找不到

```bash
# 确保 node_modules 存在
ls -la node_modules

# 如果不存在，重新安装
npm install --production
```

### 问题 4: 端口被占用

```bash
# 检查端口占用
sudo netstat -tulpn | grep 8000

# 停止占用端口的进程
sudo kill -9 <PID>

# 或修改端口
export PORT=8001
pm2 restart dormhub-video
```

## 验证部署

```bash
# 1. 检查 PM2 状态
pm2 status

# 2. 检查应用日志
pm2 logs dormhub-video --lines 50

# 3. 测试 API
curl http://localhost:8000/api/videos

# 4. 检查端口监听
sudo netstat -tulpn | grep 8000

# 5. 访问网站
curl http://localhost:8000
```

## 快速修复命令

如果遇到文件找不到的问题，执行：

```bash
cd /var/www/DormHub
rm -rf dist
npm run build
ls -la dist/server/index.js
pm2 delete dormhub-video 2>/dev/null
pm2 start ecosystem.config.js
pm2 save
```

