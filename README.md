# Dormhub - 男寝往事博览馆

一个基于 HLS 协议的视频流媒体 Web 应用，支持在线播放与下载。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 + TypeScript + Vite |
| 后端 | Express 4 + TypeScript (ESM) |
| 视频 | HLS.js (播放) + FFmpeg (转码下载) |
| 部署 | PM2 / Docker |

## 项目结构

```
├── src/
│   ├── client/              # React 前端
│   │   ├── components/
│   │   │   ├── VideoList.tsx    # 视频列表
│   │   │   └── VideoPlayer.tsx  # HLS 播放器
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── server/
│       ├── index.ts             # Express 入口
│       └── videoService.ts      # 视频扫描 / HLS 管理 / MP4 转换
├── hls/                     # HLS 视频文件 (m3u8 + ts 分片)
├── videos/                  # 原始视频存储
├── temp/                    # MP4 临时转换目录 (自动清理)
├── ecosystem.config.js      # PM2 配置
├── Dockerfile               # 生产环境镜像
├── Dockerfile.cn            # 国内镜像加速版
├── docker-compose.yml       # 生产 Docker Compose
└── deploy.sh                # 一键部署脚本
```

## 功能特性

- **HLS 流媒体播放** — 自适应码率，Safari 原生支持 + 其他浏览器 hls.js 降级
- **视频下载** — 服务端 FFmpeg 实时将 HLS 转为 MP4，支持缓存复用
- **视频库管理** — 自动扫描 `hls/` 目录，展示大小、修改时间等元数据
- **响应式设计** — 适配桌面端与移动端

## 本地开发

### 环境要求

- Node.js >= 18
- FFmpeg (用于视频下载功能)

### 启动

```bash
npm install
npm run dev
```

前端运行在 `http://localhost:3000`，后端运行在 `http://localhost:5000`，Vite 会自动代理 API 请求。

### 构建

```bash
npm run build
```

产物输出到 `dist/` 目录。

## 服务器部署

### 方式一：一键脚本部署 (推荐)

```bash
# 1. 安装系统依赖
# Ubuntu/Debian
sudo apt update && sudo apt install -y nodejs npm ffmpeg

# CentOS/RHEL
sudo yum install -y nodejs npm ffmpeg

# 2. 安装 PM2
sudo npm install -g pm2

# 3. 克隆项目
git clone https://github.com/trig29/DormHub.git
cd DormHub

# 4. 执行部署脚本
chmod +x deploy.sh
./deploy.sh
```

脚本会自动完成依赖安装、项目构建、目录创建，并通过 PM2 启动服务（端口 8000）。

### 方式二：手动 PM2 部署

```bash
# 安装依赖 & 构建
npm install
npm run build

# 创建必要目录
mkdir -p videos hls logs

# 启动 PM2 进程
npm run pm2:start

# 设置开机自启
npm run pm2:startup
npm run pm2:save
```

**PM2 常用命令：**

```bash
npm run pm2:logs      # 查看日志
npm run pm2:restart   # 重启服务
npm run pm2:monit     # 监控面板
npm run pm2:stop      # 停止服务
npm run pm2:delete    # 删除进程
```

### 方式三：Docker 部署

```bash
# 标准构建 & 启动
npm run docker:prod:build

# 国内服务器 (使用清华 apt 源 + npmmirror 加速)
docker compose -f docker-compose.cn.yml up -d --build

# 查看日志
npm run docker:logs

# 停止服务
npm run docker:down
```

Docker 会自动挂载 `./videos` 和 `./hls` 目录到容器中，`temp` 目录由容器内部管理无需挂载。

### 添加视频

将 HLS 格式的视频文件夹放入项目根目录的 `hls/` 中，每个文件夹需包含 `index.m3u8` 播放列表文件及 `.ts` 分片文件：

```
hls/
└── my_video/
    ├── index.m3u8
    ├── segment_000.ts
    ├── segment_001.ts
    └── ...
```

应用会自动扫描并展示新增视频，无需重启服务。

### Nginx 反向代理 (可选)

如需通过域名访问或配置 HTTPS：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # HLS 视频大文件传输优化
    client_max_body_size 0;
    proxy_buffering off;
}
```

如果应用部署在 `/dormhub/` 这类子路径下，构建前需要设置 `VITE_BASE_PATH=/dormhub/`，这样前端生成的静态资源、API 请求和 HLS 播放地址都会带上正确前缀。`deploy.sh` 和 `Dockerfile` 已经默认处理了这一点。

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `NODE_ENV` | `development` | 运行环境 |
| `PORT` | `5000` (dev) / `8000` (prod) | 服务端口 |

支持 `.env` 文件配置，PM2 启动时会自动加载。

## API

| 接口 | 说明 |
|------|------|
| `GET /api/videos` | 获取视频列表 |
| `GET /api/videos/:name/playlist` | 获取 HLS 播放列表 URL |
| `GET /api/videos/:name/download` | 下载视频 (HLS -> MP4 转换) |

## License

MIT
