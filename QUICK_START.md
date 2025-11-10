# 快速开始指南

## 使用虚拟环境（推荐）

### Docker 方式（完全隔离，推荐）

```powershell
# 1. 安装 Docker Desktop: https://www.docker.com/products/docker-desktop/
# 2. 启动 Docker Desktop
# 3. 创建视频文件夹
mkdir videos
# 4. 将视频文件放入 videos 文件夹
# 5. 启动开发环境
npm run docker:dev
# 6. 访问 http://localhost:3000
```

详细说明: [VIRTUAL_ENV.md](./VIRTUAL_ENV.md)

---

## Windows 本地测试（5分钟）

### 1. 安装必要软件

**Node.js:**
- 下载: https://nodejs.org/ (选择 LTS 版本)
- 安装后验证: `node --version`

**FFmpeg:**
```powershell
# 以管理员身份运行 PowerShell
choco install ffmpeg
# 或手动安装: https://www.gyan.dev/ffmpeg/builds/
```

### 2. 启动项目

```powershell
cd D:\code\Dormhub
npm install
mkdir videos
# 将视频文件复制到 videos 文件夹
npm run dev
```

### 3. 访问

打开浏览器: `http://localhost:3000`

---

## 云服务器部署（8000端口）

### 1. 服务器准备

```bash
# 安装 Node.js 和 FFmpeg
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs ffmpeg
```

### 2. 上传项目

```bash
# 使用 Git 或 SCP 上传项目到服务器
cd /path/to/project
npm install
npm run build
```

### 3. 启动服务

```bash
# 使用 PM2 (推荐)
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save

# 或直接启动
PORT=8000 npm start
```

### 4. 配置防火墙

```bash
sudo ufw allow 8000/tcp
```

### 5. 访问

`http://your-server-ip:8000`

---

## 详细文档

- **Windows 测试详细步骤**: [WINDOWS_TEST.md](./WINDOWS_TEST.md)
- **服务器部署完整指南**: [DEPLOYMENT.md](./DEPLOYMENT.md)

