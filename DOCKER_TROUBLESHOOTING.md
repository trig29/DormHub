# Docker 故障排查指南

## 常见问题

### 1. 无法拉取镜像（node:18-slim: not found）

**错误信息：**
```
ERROR: failed to solve: node:18-slim: failed to resolve source metadata
```

**原因：**
- 网络无法访问 Docker Hub
- 需要使用镜像加速器（中国大陆常见）

**解决方案：**

#### 方案一：配置 Docker 镜像加速器（推荐）

编辑 Docker 配置文件：

```bash
sudo nano /etc/docker/daemon.json
```

添加以下内容（使用阿里云镜像加速器）：

```json
{
  "registry-mirrors": [
    "https://registry.cn-hangzhou.aliyuncs.com",
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com"
  ]
}
```

重启 Docker 服务：

```bash
sudo systemctl daemon-reload
sudo systemctl restart docker
```

验证配置：

```bash
docker info | grep -A 10 "Registry Mirrors"
```

#### 方案二：使用国内镜像源

修改 `Dockerfile`，使用国内镜像：

```dockerfile
FROM registry.cn-hangzhou.aliyuncs.com/acs/node:18-slim
```

或使用其他国内镜像源：

```dockerfile
# 使用腾讯云镜像
FROM ccr.ccs.tencentyun.com/library/node:18-slim

# 或使用网易镜像
FROM hub-mirror.c.163.com/library/node:18-slim
```

#### 方案三：手动拉取镜像

```bash
# 先手动拉取镜像
docker pull node:18-slim

# 然后再构建
docker-compose up -d --build
```

### 2. 构建过程中 npm install 失败

**错误信息：**
```
npm ERR! network timeout
npm ERR! code ECONNRESET
```

**解决方案：**

在 `Dockerfile` 中使用国内 npm 镜像：

```dockerfile
# 在安装依赖前设置 npm 镜像
RUN npm config set registry https://registry.npmmirror.com
RUN npm ci && npm cache clean --force
```

### 3. 权限问题

**错误信息：**
```
Permission denied
```

**解决方案：**

```bash
# 将当前用户添加到 docker 组
sudo usermod -aG docker $USER

# 重新登录或执行
newgrp docker

# 如果仍有问题，使用 sudo
sudo docker-compose up -d --build
```

### 4. 端口被占用

**错误信息：**
```
Error: bind: address already in use
```

**解决方案：**

```bash
# 检查端口占用
sudo netstat -tulpn | grep 8000

# 停止占用端口的进程
sudo kill -9 <PID>

# 或修改 docker-compose.yml 中的端口
# 将 "8000:8000" 改为 "8001:8000"
```

### 5. 磁盘空间不足

**错误信息：**
```
no space left on device
```

**解决方案：**

```bash
# 查看磁盘使用
df -h

# 清理 Docker 资源
docker system prune -a

# 清理未使用的镜像
docker image prune -a
```

### 6. 内存不足

**错误信息：**
```
Killed
```

**解决方案：**

```bash
# 查看内存使用
free -h

# 增加交换空间（如果内存不足）
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 永久启用（添加到 /etc/fstab）
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## 快速修复脚本

创建修复脚本 `fix-docker.sh`：

```bash
#!/bin/bash

echo "配置 Docker 镜像加速器..."

# 创建或更新 daemon.json
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json > /dev/null <<EOF
{
  "registry-mirrors": [
    "https://registry.cn-hangzhou.aliyuncs.com",
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com"
  ]
}
EOF

# 重启 Docker
sudo systemctl daemon-reload
sudo systemctl restart docker

echo "Docker 镜像加速器配置完成！"
echo "请重新运行: docker-compose up -d --build"
```

使用：

```bash
chmod +x fix-docker.sh
./fix-docker.sh
```

## 验证 Docker 配置

```bash
# 检查 Docker 版本
docker --version
docker-compose --version

# 检查 Docker 服务状态
sudo systemctl status docker

# 测试拉取镜像
docker pull hello-world

# 检查镜像加速器
docker info | grep -A 10 "Registry Mirrors"
```

## 完整解决方案（针对当前错误）

如果遇到 `node:18-slim: not found` 错误，按以下步骤操作：

```bash
# 1. 配置镜像加速器
sudo nano /etc/docker/daemon.json
# 添加镜像加速器配置（见上方）

# 2. 重启 Docker
sudo systemctl daemon-reload
sudo systemctl restart docker

# 3. 验证配置
docker info | grep -A 10 "Registry Mirrors"

# 4. 重新构建
docker-compose up -d --build
```

如果仍然失败，可以尝试：

```bash
# 手动拉取镜像
docker pull node:18-slim

# 或使用国内镜像
docker pull registry.cn-hangzhou.aliyuncs.com/acs/node:18-slim
docker tag registry.cn-hangzhou.aliyuncs.com/acs/node:18-slim node:18-slim

# 然后重新构建
docker-compose up -d --build
```

