# Windows 本地测试指南

## 快速开始

### 第一步: 安装 Node.js

1. 访问 https://nodejs.org/
2. 下载 LTS 版本（推荐 v18 或更高）
3. 运行安装程序，使用默认设置
4. 验证安装:
   ```powershell
   node --version
   npm --version
   ```

### 第二步: 安装 FFmpeg

#### 方法一: 使用 Chocolatey（推荐）

1. 以管理员身份打开 PowerShell
2. 安装 Chocolatey（如果未安装）:
   ```powershell
   Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
   ```
3. 安装 FFmpeg:
   ```powershell
   choco install ffmpeg
   ```

#### 方法二: 手动安装

1. 访问 https://www.gyan.dev/ffmpeg/builds/
2. 下载 `ffmpeg-release-essentials.zip`
3. 解压到 `C:\ffmpeg`
4. 添加到系统 PATH:
   - 按 `Win + X`，选择"系统"
   - 点击"高级系统设置"
   - 点击"环境变量"
   - 在"系统变量"中找到 `Path`，点击"编辑"
   - 点击"新建"，添加 `C:\ffmpeg\bin`
   - 点击"确定"保存
5. **重要**: 关闭并重新打开 PowerShell/CMD

6. 验证安装:
   ```powershell
   ffmpeg -version
   ```

### 第三步: 准备项目

1. 打开 PowerShell 或 CMD，进入项目目录:
   ```powershell
   cd D:\code\Dormhub
   ```

2. 安装项目依赖:
   ```powershell
   npm install
   ```

3. 创建视频文件夹:
   ```powershell
   mkdir videos
   ```

4. 将测试视频文件复制到 `videos` 文件夹中
   - 支持的格式: `.mp4`, `.avi`, `.mov`, `.mkv`, `.webm`, `.flv`, `.wmv`

### 第四步: 启动开发服务器

```powershell
npm run dev
```

这将同时启动:
- 后端服务器: `http://localhost:5000`
- 前端开发服务器: `http://localhost:3000`

### 第五步: 访问网站

1. 打开浏览器
2. 访问 `http://localhost:3000`
3. 你应该能看到:
   - 左侧: 视频列表
   - 右侧: 视频播放器（选择视频后显示）

## 测试流程

### 1. 查看视频列表
- 在左侧列表中应该能看到 `videos` 文件夹中的所有视频
- 每个视频显示文件名、大小和修改时间

### 2. 转换视频为 HLS
- 点击视频项中的 "Convert to HLS" 按钮
- 等待转换完成（转换时间取决于视频大小）
- 转换完成后，视频项会显示绿色的 "HLS" 标签

### 3. 播放视频
- 点击视频项选择视频
- 右侧会显示视频播放器
- 如果已转换为 HLS，会显示 "HLS Optimized" 标签
- 使用播放器控件播放、暂停、调整音量等

## 常见问题解决

### 问题 1: `npm install` 失败

**可能原因**: 网络问题或权限问题

**解决方案**:
```powershell
# 使用管理员权限运行 PowerShell
# 或使用淘宝镜像
npm install --registry=https://registry.npmmirror.com
```

### 问题 2: FFmpeg 未找到

**错误信息**: `Error: Cannot find ffmpeg`

**解决方案**:
1. 确认 FFmpeg 已正确安装: `ffmpeg -version`
2. 如果命令不存在，检查 PATH 环境变量
3. **重要**: 关闭并重新打开 PowerShell/CMD
4. 如果仍不行，重启电脑

### 问题 3: 端口被占用

**错误信息**: `Error: listen EADDRINUSE: address already in use :::5000`

**解决方案**:
1. 查找占用端口的进程:
   ```powershell
   netstat -ano | findstr :5000
   ```
2. 结束进程（替换 PID 为实际进程ID）:
   ```powershell
   taskkill /PID <PID> /F
   ```
3. 或修改端口: 编辑 `src/server/index.ts`，将 `5000` 改为其他端口

### 问题 4: 视频列表为空

**可能原因**:
- `videos` 文件夹不存在或为空
- 视频格式不支持

**解决方案**:
1. 确认 `videos` 文件夹在项目根目录
2. 确认文件夹中有视频文件
3. 确认视频格式为支持的格式

### 问题 5: HLS 转换失败

**可能原因**:
- FFmpeg 未正确安装
- 视频文件损坏
- 磁盘空间不足

**解决方案**:
1. 检查 FFmpeg: `ffmpeg -version`
2. 检查视频文件是否可以正常播放
3. 检查磁盘空间
4. 查看控制台错误信息

### 问题 6: 视频无法播放

**可能原因**:
- 浏览器不支持 HLS
- 网络问题
- CORS 问题

**解决方案**:
1. 使用现代浏览器（Chrome, Edge, Firefox）
2. 检查浏览器控制台错误
3. 尝试转换为 HLS 格式

## 开发模式 vs 生产模式

### 开发模式（当前）
- 前端和后端分离运行
- 前端: `http://localhost:3000` (Vite 开发服务器)
- 后端: `http://localhost:5000` (Express 服务器)
- 支持热重载，代码修改自动刷新

### 生产模式（部署时）
- 前端构建为静态文件
- 后端同时服务前端静态文件和 API
- 单一端口访问（如 8000）

## 性能测试建议

1. **小视频测试**: 使用 < 100MB 的视频文件
2. **大视频测试**: 使用 > 500MB 的视频文件测试 HLS 转换
3. **多视频测试**: 在 `videos` 文件夹中放置多个视频文件
4. **网络测试**: 测试不同网络条件下的播放体验

## 下一步

测试完成后，可以:
1. 部署到云服务器（参考 `DEPLOYMENT.md`）
2. 添加更多功能
3. 优化性能

