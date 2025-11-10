# Docker 快速部署指南

## 🚀 5分钟快速部署

### 1. 安装 Docker（如果未安装）

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo systemctl start docker
sudo systemctl enable docker

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. 上传项目

```bash
# 使用 Git
git clone <your-repo-url>
cd Dormhub

# 或使用 SCP 从本地上传
# scp -r /path/to/Dormhub user@server:/home/user/
```

### 3. 准备视频文件夹

```bash
mkdir -p videos
# 将视频文件放入 videos 文件夹
```

### 4. 一键启动

```bash
docker-compose up -d --build
```

### 5. 配置防火墙

```bash
sudo ufw allow 8000/tcp
sudo ufw reload
```

### 6. 访问

打开浏览器: `http://your-server-ip:8000`

## ✅ 完成！

就这么简单！所有依赖（包括 FFmpeg）都已包含在 Docker 镜像中。

## 📋 常用命令

```bash
# 查看日志
docker-compose logs -f

# 停止服务
docker-compose stop

# 重启服务
docker-compose restart

# 更新应用
git pull && docker-compose up -d --build
```

## 📚 详细文档

查看 [DOCKER_DEPLOY.md](./DOCKER_DEPLOY.md) 了解：
- 详细配置说明
- 故障排查
- 性能优化
- 安全建议
- 备份恢复

