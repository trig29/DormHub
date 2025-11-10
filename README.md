# DormHub - 视频流媒体平台

一个基于 HLS (HTTP Live Streaming) 技术的视频流媒体播放平台，支持在线播放预转换的 HLS 格式视频。

## 项目简介

DormHub 是一个轻量级的视频流媒体应用，采用前后端分离架构。系统直接播放服务器上已转换好的 HLS 格式视频。

## 功能特性

- 🎬 **HLS 视频播放**：支持 HLS 格式视频的在线播放
- 📱 **响应式设计**：适配各种设备和屏幕尺寸
- 🚀 **高性能**：直接播放预转换视频，无需服务器端处理
- 🐳 **Docker 支持**：提供完整的 Docker 部署方案
- 🔄 **自动扫描**：自动识别 `hls` 文件夹中的视频

## 技术栈

### 前端
- React 18
- TypeScript
- Vite
- HLS.js

### 后端
- Node.js
- Express
- TypeScript

## 快速开始

### 环境要求

- Node.js >= 18
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 开发模式运行

```bash
# 同时启动前端和后端开发服务器
npm run dev

# 或分别启动
npm run dev:server  # 后端服务器 (端口 5000)
npm run dev:client  # 前端开发服务器 (端口 3000)
```

### 生产模式构建

```bash
# 构建项目
npm run build

# 启动生产服务器
npm start

# 或使用生产环境配置
npm run start:prod
```

## Windows 本地测试

### 前置准备

1. **安装 Node.js**
   - 访问 [Node.js 官网](https://nodejs.org/) 下载并安装 Node.js (>= 18)
   - 安装完成后，在 PowerShell 或 CMD 中验证：
     ```powershell
     node --version
     npm --version
     ```

2. **安装 FFmpeg（用于视频转换）**
   - 方式一：使用 Chocolatey（推荐）
     ```powershell
     # 以管理员身份运行 PowerShell
     choco install ffmpeg
     ```
   - 方式二：手动安装
     1. 访问 [FFmpeg 官网](https://ffmpeg.org/download.html) 下载 Windows 版本
     2. 解压到 `C:\ffmpeg`
     3. 将 `C:\ffmpeg\bin` 添加到系统环境变量 `PATH` 中
     4. 验证安装：
        ```powershell
        ffmpeg -version
        ```

### 本地测试步骤

1. **克隆或下载项目**
   ```powershell
   cd D:\code\Dormhub
   ```

2. **安装项目依赖**
   ```powershell
   npm install
   ```

3. **准备测试视频**
   
   在项目根目录创建测试视频文件夹（如果还没有）：
   ```powershell
   # 确保 hls 文件夹存在
   mkdir hls
   ```
   
   使用 FFmpeg 转换一个测试视频：
   ```powershell
   # 创建输出文件夹
   mkdir hls\test_video
   
   # 转换视频（将 input.mp4 替换为你的视频文件路径）
   ffmpeg -i "videos\input.mp4" `
     -c:v libx264 `
     -c:a aac `
     -hls_time 10 `
     -hls_playlist_type vod `
     -hls_segment_filename "hls\test_video\segment_%03d.ts" `
     -f hls `
     "hls\test_video\index.m3u8"
   ```
   
   **注意**：Windows PowerShell 使用反引号 `` ` `` 作为行继续符，CMD 使用 `^`

4. **启动开发服务器**
   ```powershell
   # 同时启动前端和后端
   npm run dev
   ```
   
   或者分别启动（需要打开两个终端窗口）：
   ```powershell
   # 终端 1：启动后端服务器
   npm run dev:server
   
   # 终端 2：启动前端开发服务器
   npm run dev:client
   ```

5. **访问应用**
   - 打开浏览器访问：`http://localhost:3000`
   - 你应该能看到视频列表，点击视频即可播放

### Windows 常见问题

1. **端口被占用**
   ```powershell
   # 查看端口占用情况
   netstat -ano | findstr :5000
   netstat -ano | findstr :3000
   
   # 结束占用端口的进程（将 PID 替换为实际进程ID）
   taskkill /PID <PID> /F
   ```

2. **FFmpeg 命令找不到**
   - 检查 FFmpeg 是否已添加到 PATH 环境变量
   - 重启 PowerShell/CMD 窗口
   - 使用完整路径：`C:\ffmpeg\bin\ffmpeg.exe`

3. **权限问题**
   - 如果遇到文件访问权限问题，以管理员身份运行 PowerShell
   - 或者修改文件夹权限：右键文件夹 → 属性 → 安全 → 编辑权限

4. **PowerShell 执行策略限制**
   ```powershell
   # 如果遇到脚本执行被阻止，运行以下命令（以管理员身份）
   Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

### 快速测试脚本

创建一个 `test.ps1` 文件用于快速测试：

```powershell
# test.ps1
Write-Host "正在安装依赖..." -ForegroundColor Green
npm install

Write-Host "正在启动开发服务器..." -ForegroundColor Green
npm run dev
```

运行脚本：
```powershell
.\test.ps1
```

## HLS 视频准备

系统需要播放 HLS 格式的视频。你需要先在本地将视频转换为 HLS 格式，然后上传到服务器。

### 使用 FFmpeg 转换视频

**Linux/Mac 命令：**
```bash
# 基本转换命令
ffmpeg -i input.mp4 \
  -c:v libx264 \
  -c:a aac \
  -hls_time 10 \
  -hls_playlist_type vod \
  -hls_segment_filename "output_folder/segment_%03d.ts" \
  -f hls \
  output_folder/index.m3u8
```

**Windows PowerShell 命令：**
```powershell
# 基本转换命令（使用反引号作为行继续符）
ffmpeg -i input.mp4 `
  -c:v libx264 `
  -c:a aac `
  -hls_time 10 `
  -hls_playlist_type vod `
  -hls_segment_filename "output_folder\segment_%03d.ts" `
  -f hls `
  output_folder\index.m3u8
```

**Windows CMD 命令：**
```cmd
rem 基本转换命令（使用 ^ 作为行继续符）
ffmpeg -i input.mp4 ^
  -c:v libx264 ^
  -c:a aac ^
  -hls_time 10 ^
  -hls_playlist_type vod ^
  -hls_segment_filename "output_folder\segment_%03d.ts" ^
  -f hls ^
  output_folder\index.m3u8
```

### 目录结构要求

转换后的 HLS 视频需要按照以下结构上传到服务器的 `hls` 文件夹：

```
hls/
  ├── video_name_1/
  │   ├── index.m3u8
  │   ├── segment_000.ts
  │   ├── segment_001.ts
  │   └── ...
  ├── video_name_2/
  │   ├── index.m3u8
  │   └── ...
  └── ...
```

**重要提示**：
- 每个视频必须放在独立的子文件夹中
- 每个子文件夹必须包含 `index.m3u8` 文件
- 系统会自动扫描所有包含 `index.m3u8` 的文件夹

### 上传视频

将转换好的 HLS 视频文件夹上传到服务器的 `hls` 目录即可，系统会自动识别并显示在视频列表中。

## Docker 部署

### 使用 Docker Compose

```bash
# 开发环境
npm run docker:dev

# 生产环境
npm run docker:prod

# 查看日志
npm run docker:logs

# 停止服务
npm run docker:down
```

### 环境变量配置

创建 `.env` 文件（可选）：

```env
PORT=8000
NODE_ENV=production
```

## PM2 部署（生产环境推荐）

PM2 是一个 Node.js 进程管理器，可以保持应用持续运行，并在崩溃时自动重启。

### 安装 PM2

```bash
# 全局安装 PM2
npm install -g pm2

# 验证安装
pm2 --version
```

### 部署步骤

1. **构建项目**

   ```bash
   # 安装依赖
   npm install --production

   # 构建项目
   npm run build
   ```

2. **配置环境变量**

   创建 `.env` 文件（可选，PM2 配置文件中已包含默认值）：

   ```env
   PORT=8000
   NODE_ENV=production
   ```

3. **创建日志目录**

   ```bash
   mkdir -p logs
   ```

4. **启动应用**

   ```bash
   # 使用 PM2 启动应用
   npm run pm2:start

   # 或直接使用 PM2 命令
   pm2 start ecosystem.config.js
   ```

5. **设置开机自启（可选）**

   ```bash
   # 保存当前 PM2 进程列表
   npm run pm2:save

   # 生成开机自启脚本（根据提示执行生成的命令）
   npm run pm2:startup
   # 或
   pm2 startup
   ```

### PM2 常用命令

```bash
# 启动应用
npm run pm2:start
# 或
pm2 start ecosystem.config.js

# 停止应用
npm run pm2:stop
# 或
pm2 stop dormhub-video

# 重启应用
npm run pm2:restart
# 或
pm2 restart dormhub-video

# 删除应用（从 PM2 列表中移除）
npm run pm2:delete
# 或
pm2 delete dormhub-video

# 查看日志
npm run pm2:logs
# 或
pm2 logs dormhub-video

# 实时监控
npm run pm2:monit
# 或
pm2 monit

# 查看所有进程状态
pm2 list

# 查看详细信息
pm2 show dormhub-video

# 保存当前进程列表
npm run pm2:save
# 或
pm2 save
```

### PM2 配置文件说明

项目已包含 `ecosystem.config.js` 配置文件，主要配置项：

- **name**: 应用名称 `dormhub-video`
- **script**: 启动脚本路径 `./dist/server/index.js`
- **instances**: 实例数量（单实例模式）
- **exec_mode**: 执行模式 `fork`
- **env**: 环境变量（从 `.env` 文件读取或使用默认值）
- **error_file/out_file**: 日志文件路径
- **autorestart**: 自动重启
- **max_memory_restart**: 内存超过 2G 时重启

### 查看和管理日志

```bash
# 实时查看日志
pm2 logs dormhub-video

# 查看最近 100 行日志
pm2 logs dormhub-video --lines 100

# 清空日志
pm2 flush

# 日志文件位置
# 错误日志: ./logs/pm2-error.log
# 输出日志: ./logs/pm2-out.log
```

### 更新部署

当需要更新代码时：

```bash
# 1. 拉取最新代码
git pull

# 2. 安装新依赖（如果有）
npm install --production

# 3. 重新构建
npm run build

# 4. 重启应用
npm run pm2:restart
```

### 多实例部署（可选）

如果需要使用多实例提高性能，修改 `ecosystem.config.js`：

```javascript
instances: 2,  // 或 'max' 使用所有 CPU 核心
exec_mode: 'cluster',  // 集群模式
```

### 监控和性能

```bash
# 实时监控（CPU、内存使用情况）
pm2 monit

# 查看详细信息
pm2 show dormhub-video

# 查看系统信息
pm2 info
```

### 故障排查

```bash
# 查看错误日志
pm2 logs dormhub-video --err

# 查看输出日志
pm2 logs dormhub-video --out

# 查看进程详细信息
pm2 describe dormhub-video

# 重启并清空日志
pm2 restart dormhub-video --update-env
```

## 项目结构

```
Dormhub/
├── src/
│   ├── client/              # 前端代码
│   │   ├── components/      # React 组件
│   │   ├── App.tsx          # 主应用组件
│   │   └── main.tsx         # 入口文件
│   └── server/              # 后端代码
│       ├── index.ts         # Express 服务器
│       └── videoService.ts  # 视频服务逻辑
├── hls/                     # HLS 视频文件夹（需要手动上传）
├── dist/                    # 构建输出目录
├── logs/                    # PM2 日志目录
├── package.json
├── vite.config.ts           # Vite 配置
├── tsconfig.json            # TypeScript 配置
├── ecosystem.config.js      # PM2 配置文件
└── Dockerfile               # Docker 镜像配置
```

## API 接口

### 获取视频列表

```
GET /api/videos
```

返回所有可用的 HLS 视频列表。

### 获取播放列表 URL

```
GET /api/videos/:filename/playlist
```

返回指定视频的 HLS 播放列表 URL。

## 开发说明

### 端口配置

- **开发环境**：
  - 前端开发服务器：`3000`
  - 后端服务器：`5000`
- **生产环境**：
  - 默认端口：`8000`（可通过环境变量 `PORT` 配置）

### 代理配置

开发环境下，Vite 会自动代理 `/api` 和 `/hls` 请求到后端服务器。

## 注意事项

1. **视频格式**：系统只支持 HLS 格式的视频，需要提前在本地转换
2. **文件夹命名**：建议使用有意义的文件夹名称，这将成为视频的显示名称
3. **文件权限**：确保 `hls` 文件夹有适当的读写权限
4. **服务器资源**：由于不在服务器端进行转换，大大减少了服务器资源占用

## 许可证

MIT

