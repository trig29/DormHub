# 虚拟环境使用指南

在 Node.js 项目中，有几种方式可以实现类似虚拟环境的效果，实现依赖隔离和环境隔离。

## 方案一：Docker（推荐，最接近虚拟环境）

Docker 提供了完全隔离的环境，类似于 Python 的虚拟环境。

### 前置要求

1. **安装 Docker Desktop for Windows**
   - 下载: https://www.docker.com/products/docker-desktop/
   - 安装后启动 Docker Desktop
   - 验证安装: `docker --version`

### 开发环境使用 Docker

1. **启动开发环境**:
   ```powershell
   docker-compose -f docker-compose.dev.yml up
   ```
   这将：
   - 自动构建开发镜像
   - 启动开发服务器（前端 3000，后端 5000）
   - 支持热重载（代码修改自动生效）

2. **访问应用**:
   - 前端: `http://localhost:3000`
   - 后端: `http://localhost:5000`

3. **停止服务**:
   ```powershell
   docker-compose -f docker-compose.dev.yml down
   ```

4. **查看日志**:
   ```powershell
   docker-compose -f docker-compose.dev.yml logs -f
   ```

### 生产环境使用 Docker

1. **构建并启动**:
   ```powershell
   docker-compose up -d
   ```

2. **访问应用**:
   - `http://localhost:8000`

3. **停止服务**:
   ```powershell
   docker-compose down
   ```

### Docker 常用命令

```powershell
# 构建镜像
docker-compose build

# 启动服务（后台运行）
docker-compose up -d

# 查看运行状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose stop

# 删除容器和网络
docker-compose down

# 删除所有（包括镜像）
docker-compose down --rmi all

# 进入容器
docker exec -it dormhub-video bash
```

### 挂载视频文件

视频文件需要挂载到容器中：

1. **创建本地 videos 文件夹**:
   ```powershell
   mkdir videos
   # 将视频文件放入此文件夹
   ```

2. **Docker Compose 已配置自动挂载**:
   - `./videos` -> `/app/videos`
   - `./hls` -> `/app/hls`

### Docker 优势

✅ 完全隔离的环境  
✅ 不污染本地系统  
✅ 易于清理（删除容器即可）  
✅ 跨平台一致性  
✅ 包含 FFmpeg，无需本地安装  

---

## 方案二：使用 nvm（Node 版本管理）

nvm 可以管理多个 Node.js 版本，实现版本隔离。

### Windows 安装 nvm

1. **下载 nvm-windows**:
   - 访问: https://github.com/coreybutler/nvm-windows/releases
   - 下载 `nvm-setup.exe` 并安装

2. **验证安装**:
   ```powershell
   nvm version
   ```

### 使用 nvm

1. **安装指定版本的 Node.js**:
   ```powershell
   nvm install 18
   nvm use 18
   ```

2. **项目已包含 .nvmrc 文件**:
   ```powershell
   # 自动使用项目指定的 Node.js 版本
   nvm use
   ```

3. **切换版本**:
   ```powershell
   nvm list          # 查看已安装版本
   nvm use 18        # 切换到 18 版本
   nvm use 20        # 切换到 20 版本
   ```

### nvm 优势

✅ 管理多个 Node.js 版本  
✅ 项目级版本锁定  
✅ 快速切换版本  

---

## 方案三：项目本地依赖（默认方式）

npm 默认会将依赖安装到项目的 `node_modules` 文件夹，已经实现了某种程度的隔离。

### 使用方式

```powershell
# 安装依赖（自动安装到项目本地）
npm install

# 使用项目本地的依赖
npm run dev
```

### 特点

✅ 无需额外配置  
✅ 依赖隔离在项目内  
✅ 每个项目独立依赖  

⚠️ 但 Node.js 本身是全局的，无法隔离 Node.js 版本

---

## 推荐方案对比

| 方案 | 隔离程度 | 易用性 | 推荐场景 |
|------|---------|--------|----------|
| **Docker** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 需要完全隔离，不想安装 FFmpeg |
| **nvm** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 需要管理多个 Node.js 版本 |
| **本地依赖** | ⭐⭐ | ⭐⭐⭐⭐⭐ | 简单项目，单一 Node.js 版本 |

## 快速开始（Docker 开发环境）

```powershell
# 1. 确保 Docker Desktop 运行
# 2. 创建视频文件夹
mkdir videos
# 3. 将视频文件放入 videos 文件夹
# 4. 启动开发环境
docker-compose -f docker-compose.dev.yml up
# 5. 访问 http://localhost:3000
```

## 常见问题

### Docker 相关问题

**Q: Docker 容器无法访问本地文件？**  
A: 确保 Docker Desktop 的 File Sharing 设置中包含了项目目录。

**Q: 端口被占用？**  
A: 修改 `docker-compose.yml` 中的端口映射，例如 `"8001:8000"`。

**Q: 如何重新构建镜像？**  
A: `docker-compose build --no-cache`

### nvm 相关问题

**Q: nvm use 命令找不到？**  
A: 确保 nvm-windows 已正确安装，重启 PowerShell。

**Q: 切换版本后命令不生效？**  
A: 关闭并重新打开 PowerShell 终端。

## 最佳实践

1. **开发环境**: 使用 Docker（`docker-compose.dev.yml`）
2. **生产部署**: 使用 Docker（`docker-compose.yml`）
3. **多版本管理**: 使用 nvm + `.nvmrc`
4. **简单项目**: 直接使用本地依赖

