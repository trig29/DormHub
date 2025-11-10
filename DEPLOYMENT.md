# 部署指南

## Windows 本地测试

### 前置要求

1. **安装 Node.js**
   - 下载并安装 Node.js (v18 或更高版本)
   - 验证安装: 打开 PowerShell 或 CMD，运行 `node --version`

2. **安装 FFmpeg**
   - 方法一（推荐）: 使用 Chocolatey
     ```powershell
     # 以管理员身份运行 PowerShell
     choco install ffmpeg
     ```
   - 方法二: 手动安装
     1. 访问 https://www.gyan.dev/ffmpeg/builds/
     2. 下载 `ffmpeg-release-essentials.zip`
     3. 解压到 `C:\ffmpeg`
     4. 添加到系统 PATH:
        - 右键"此电脑" -> 属性 -> 高级系统设置 -> 环境变量
        - 在"系统变量"中找到 Path，点击编辑
        - 添加 `C:\ffmpeg\bin`
   - 验证安装: 打开新的 PowerShell，运行 `ffmpeg -version`

### 本地测试步骤

1. **克隆或进入项目目录**
   ```powershell
   cd D:\code\Dormhub
   ```

2. **安装依赖**
   ```powershell
   npm install
   ```

3. **创建视频文件夹并添加测试视频**
   ```powershell
   # 在项目根目录创建 videos 文件夹
   mkdir videos
   # 将你的视频文件复制到 videos 文件夹中
   ```

4. **启动开发服务器**
   ```powershell
   npm run dev
   ```
   这将启动:
   - 后端服务器: `http://localhost:5000`
   - 前端开发服务器: `http://localhost:3000`

5. **访问网站**
   - 打开浏览器访问 `http://localhost:3000`
   - 你应该能看到视频列表和播放器

### 本地测试常见问题

**问题: FFmpeg 未找到**
- 解决方案: 确保 FFmpeg 已添加到 PATH，重启 PowerShell/CMD 后再试

**问题: 端口被占用**
- 解决方案: 修改 `src/server/index.ts` 中的端口号，或关闭占用端口的程序

**问题: 视频列表为空**
- 解决方案: 确保视频文件在 `videos` 文件夹中，且格式为支持的格式（.mp4, .avi, .mov 等）

## 云服务器部署（8000端口）

### 服务器要求

- Linux 服务器（Ubuntu 20.04+ 推荐）
- Node.js v18+
- FFmpeg
- 至少 2GB RAM
- 足够的磁盘空间存储视频和 HLS 文件

### 部署步骤

#### 1. 服务器环境准备

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js (使用 NodeSource)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 安装 FFmpeg
sudo apt install -y ffmpeg

# 验证安装
node --version
npm --version
ffmpeg -version
```

#### 2. 上传项目文件

**方法一: 使用 Git**
```bash
# 在服务器上克隆项目
git clone <your-repo-url>
cd Dormhub
```

**方法二: 使用 SCP (从本地 Windows)**
```powershell
# 在 Windows PowerShell 中
scp -r D:\code\Dormhub user@your-server-ip:/home/user/
```

**方法三: 使用 FTP/SFTP 工具**
- 使用 FileZilla 或 WinSCP 上传整个项目文件夹

#### 3. 安装依赖和构建

```bash
cd /path/to/Dormhub

# 安装依赖
npm install

# 构建项目
npm run build
```

#### 4. 创建必要的文件夹

```bash
# 创建视频文件夹
mkdir -p videos

# HLS 文件夹会在运行时自动创建
mkdir -p hls

# 设置权限（如果需要）
chmod 755 videos
chmod 755 hls
```

#### 5. 配置环境变量（可选）

创建 `.env` 文件:
```bash
nano .env
```

添加内容:
```
PORT=8000
NODE_ENV=production
```

#### 6. 使用 PM2 管理进程（推荐）

```bash
# 安装 PM2
sudo npm install -g pm2

# 启动应用
pm2 start dist/server/index.js --name dormhub-video --env PORT=8000

# 设置开机自启
pm2 startup
pm2 save

# 查看状态
pm2 status
pm2 logs dormhub-video
```

#### 7. 配置防火墙

```bash
# Ubuntu/Debian
sudo ufw allow 8000/tcp
sudo ufw reload

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=8000/tcp
sudo firewall-cmd --reload
```

#### 8. 使用 Nginx 反向代理（可选但推荐）

安装 Nginx:
```bash
sudo apt install nginx
```

创建配置文件:
```bash
sudo nano /etc/nginx/sites-available/dormhub
```

添加配置:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # 或服务器IP

    client_max_body_size 10G;  # 允许大文件上传

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

启用配置:
```bash
sudo ln -s /etc/nginx/sites-available/dormhub /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 访问应用

- 直接访问: `http://your-server-ip:8000`
- 使用域名: `http://your-domain.com` (如果配置了 Nginx)

### 部署后管理

**查看日志:**
```bash
pm2 logs dormhub-video
```

**重启应用:**
```bash
pm2 restart dormhub-video
```

**停止应用:**
```bash
pm2 stop dormhub-video
```

**更新应用:**
```bash
cd /path/to/Dormhub
git pull  # 如果使用 Git
npm install
npm run build
pm2 restart dormhub-video
```

### 性能优化建议

1. **增加 Node.js 内存限制** (如果处理大视频):
   ```bash
   pm2 start dist/server/index.js --name dormhub-video --node-args="--max-old-space-size=4096" --env PORT=8000
   ```

2. **使用 CDN** 加速 HLS 文件传输（可选）

3. **定期清理** 旧的 HLS 文件以节省空间

4. **监控资源使用**:
   ```bash
   pm2 monit
   ```

### 安全建议

1. **使用 HTTPS** (生产环境必须):
   - 使用 Let's Encrypt 免费 SSL 证书
   - 配置 Nginx SSL

2. **限制访问** (如果需要):
   - 使用 Nginx 的 `allow/deny` 指令
   - 或使用防火墙规则

3. **定期更新**:
   ```bash
   sudo apt update && sudo apt upgrade
   npm update
   ```

### 故障排查

**应用无法启动:**
- 检查端口是否被占用: `sudo netstat -tulpn | grep 8000`
- 查看 PM2 日志: `pm2 logs dormhub-video`

**视频无法播放:**
- 检查 FFmpeg 是否安装: `ffmpeg -version`
- 检查视频文件权限
- 查看服务器日志

**HLS 转换失败:**
- 检查磁盘空间: `df -h`
- 检查 FFmpeg 版本和编解码器支持

