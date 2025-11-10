# Docker 服务器部署指南

## ✅ 完全支持 Docker 部署

项目已完全支持使用 Docker 在服务器上部署，这是推荐的部署方式。

## 🚀 快速开始

### 前置要求

- Linux 服务器（Ubuntu 20.04+ 推荐）
- Docker 和 Docker Compose 已安装
- 至少 2GB RAM
- 足够的磁盘空间

### 1. 安装 Docker 和 Docker Compose

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 启动 Docker 服务
sudo systemctl start docker
sudo systemctl enable docker

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker --version
docker-compose --version
```

### 2. 上传项目到服务器

```bash
# 使用 Git 克隆（推荐）
git clone <your-repo-url>
cd Dormhub

# 或使用 SCP 上传
# scp -r /path/to/Dormhub user@server-ip:/home/user/
```

### 3. 配置环境变量（可选）

创建 `.env` 文件：

```bash
nano .env
```

添加内容：
```env
PORT=8000
NODE_ENV=production
```

### 4. 创建视频文件夹

```bash
mkdir -p videos
# 将视频文件放入 videos 文件夹
```

### 5. 构建并启动

```bash
# 构建镜像并启动（后台运行）
docker-compose up -d --build

# 查看日志
docker-compose logs -f

# 查看运行状态
docker-compose ps
```

### 6. 配置防火墙

```bash
# Ubuntu/Debian
sudo ufw allow 8000/tcp
sudo ufw reload

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=8000/tcp
sudo firewall-cmd --reload
```

### 7. 访问应用

访问: `http://your-server-ip:8000`

## 📁 数据持久化

Docker Compose 已配置数据卷挂载，确保数据持久化：

- `./videos` → `/app/videos` (视频文件)
- `./hls` → `/app/hls` (HLS 转换文件)

即使删除容器，数据也不会丢失。

## 🔧 常用命令

### 启动和停止

```bash
# 启动服务（后台运行）
docker-compose up -d

# 停止服务
docker-compose stop

# 停止并删除容器
docker-compose down

# 停止并删除容器、网络、卷（谨慎使用）
docker-compose down -v
```

### 查看日志

```bash
# 查看所有日志
docker-compose logs

# 实时查看日志
docker-compose logs -f

# 查看最近 100 行日志
docker-compose logs --tail=100
```

### 重启服务

```bash
# 重启服务
docker-compose restart

# 重新构建并启动
docker-compose up -d --build
```

### 进入容器

```bash
# 进入运行中的容器
docker-compose exec video-app bash

# 查看容器信息
docker-compose ps
```

## 🔄 更新应用

### 方法一：使用 Git（推荐）

```bash
# 拉取最新代码
git pull

# 重新构建并启动
docker-compose up -d --build

# 查看日志确认
docker-compose logs -f
```

### 方法二：手动更新

```bash
# 停止服务
docker-compose down

# 上传新代码
# (使用 Git 或 SCP)

# 重新构建并启动
docker-compose up -d --build
```

## 📊 监控和管理

### 查看资源使用

```bash
# 查看容器资源使用
docker stats

# 查看特定容器
docker stats video-app
```

### 查看容器信息

```bash
# 查看运行中的容器
docker ps

# 查看所有容器（包括停止的）
docker ps -a

# 查看镜像
docker images
```

### 清理资源

```bash
# 清理未使用的镜像
docker image prune

# 清理所有未使用的资源
docker system prune

# 清理包括未使用的卷（谨慎使用）
docker system prune -a --volumes
```

## 🛡️ 使用 Nginx 反向代理（推荐）

### 安装 Nginx

```bash
sudo apt install nginx
```

### 配置 Nginx

创建配置文件：

```bash
sudo nano /etc/nginx/sites-available/dormhub
```

添加配置：

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 或服务器IP

    # 允许大文件上传
    client_max_body_size 10G;
    client_body_timeout 300s;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 超时设置（视频转换可能需要较长时间）
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/dormhub /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 配置 HTTPS（可选）

使用 Let's Encrypt：

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 🔒 安全建议

### 1. 限制访问（可选）

在 Nginx 配置中添加 IP 白名单：

```nginx
location / {
    allow 192.168.1.0/24;  # 允许的 IP 段
    deny all;
    proxy_pass http://localhost:8000;
    # ... 其他配置
}
```

### 2. 使用非 root 用户运行（可选）

修改 `docker-compose.yml`：

```yaml
services:
  video-app:
    # ... 其他配置
    user: "1000:1000"  # 使用 UID:GID
```

### 3. 定期更新

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 更新 Docker
sudo apt install docker-ce docker-ce-cli containerd.io

# 更新 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

## 🐛 故障排查

### 容器无法启动

```bash
# 查看详细错误
docker-compose logs

# 检查端口是否被占用
sudo netstat -tulpn | grep 8000

# 检查 Docker 服务状态
sudo systemctl status docker
```

### 视频无法播放

```bash
# 进入容器检查 FFmpeg
docker-compose exec video-app ffmpeg -version

# 检查视频文件权限
docker-compose exec video-app ls -la /app/videos

# 查看应用日志
docker-compose logs video-app
```

### 磁盘空间不足

```bash
# 查看磁盘使用
df -h

# 清理 Docker 资源
docker system prune -a

# 清理旧的 HLS 文件（在容器内）
docker-compose exec video-app find /app/hls -type f -mtime +30 -delete
```

### 内存不足

```bash
# 查看内存使用
free -h
docker stats

# 限制容器内存（修改 docker-compose.yml）
# 添加:
# deploy:
#   resources:
#     limits:
#       memory: 2G
```

## 📈 性能优化

### 1. 增加容器资源限制

修改 `docker-compose.yml`：

```yaml
services:
  video-app:
    # ... 其他配置
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
        reservations:
          cpus: '1'
          memory: 2G
```

### 2. 使用多阶段构建（已优化）

Dockerfile 已使用优化的构建方式。

### 3. 启用日志轮转

修改 `docker-compose.yml`：

```yaml
services:
  video-app:
    # ... 其他配置
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## 🔄 备份和恢复

### 备份数据

```bash
# 备份视频文件
tar -czf videos-backup-$(date +%Y%m%d).tar.gz videos/

# 备份 HLS 文件
tar -czf hls-backup-$(date +%Y%m%d).tar.gz hls/

# 备份整个项目
tar -czf dormhub-backup-$(date +%Y%m%d).tar.gz \
  --exclude='node_modules' \
  --exclude='dist' \
  --exclude='.git' \
  .
```

### 恢复数据

```bash
# 恢复视频文件
tar -xzf videos-backup-YYYYMMDD.tar.gz

# 恢复 HLS 文件
tar -xzf hls-backup-YYYYMMDD.tar.gz
```

## 📝 完整部署示例

```bash
# 1. 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo systemctl start docker
sudo systemctl enable docker

# 2. 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 3. 克隆项目
git clone <your-repo-url>
cd Dormhub

# 4. 创建视频文件夹
mkdir -p videos
# 上传视频文件到 videos 文件夹

# 5. 启动服务
docker-compose up -d --build

# 6. 查看日志
docker-compose logs -f

# 7. 配置防火墙
sudo ufw allow 8000/tcp
sudo ufw reload

# 完成！访问 http://your-server-ip:8000
```

## ✅ Docker 部署优势

1. **环境隔离**: 不污染服务器环境
2. **易于部署**: 一键启动，无需手动配置
3. **易于更新**: 重新构建即可更新
4. **易于迁移**: 可在任何支持 Docker 的服务器运行
5. **资源管理**: 可限制容器资源使用
6. **数据持久化**: 数据卷确保数据不丢失
7. **包含依赖**: FFmpeg 已包含在镜像中

## 📚 相关文档

- [DEPLOYMENT.md](./DEPLOYMENT.md) - 传统部署方式
- [VIRTUAL_ENV.md](./VIRTUAL_ENV.md) - 虚拟环境使用
- [README.md](./README.md) - 项目总览

