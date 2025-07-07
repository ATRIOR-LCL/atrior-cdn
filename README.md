# 腾讯云 COS 文件上传服务

一个基于 Node.js 的腾讯云 COS 文件上传服务，支持自动文件分类和可配置的根目录。

## ✨ 特性

- 🚀 **自动文件分类** - 根据文件扩展名自动分类到对应目录
- 📁 **可配置根目录** - 通过环境变量自定义文件存储的根目录
- 🔒 **安全的临时密钥** - 使用腾讯云 STS 临时密钥，安全可靠
- ⚡ **时间戳命名** - 文件名包含时间戳，避免重名冲突
- 🎯 **灵活路径** - 支持自定义子目录，也可自动分类

## 📂 文件自动分类

| 文件类型 | 目录 | 支持格式 |
|---------|------|----------|
| 图片 | `/images/` | jpg, png, gif, svg, webp, ico 等 |
| 视频 | `/video/` | mp4, avi, mov, mkv, webm 等 |
| 音频 | `/audio/` | mp3, wav, flac, aac, ogg 等 |
| 文档 | `/docs/` | pdf, doc, txt, md, xlsx 等 |
| 样式 | `/css/` | css, scss, sass, less |
| 其他 | `/other/` | 其他所有格式 |

## 🚀 快速开始

### 1. 安装依赖
```bash
# pnpm
pnpm install

# npm
npm install
```

### 2. 配置环境变量
在项目根目录下创建 `.env` 并复制下方文本到 `.env` 文件中，调整你自己的参数配置：
```env
# 腾讯云密钥（必填）
SecretId=你的SecretId
SecretKey=你的SecretKey

# COS 配置（必填）
Bucket=你的存储桶名称
Region=存储桶地域

# 专属目录配置（可选，默认: atrior）
RootPath=atrior

# CDN 访问域名配置（可选）
CdnDomain=https://cdn.shaly.sdutacm.cn
```

### 3. 启动服务
```bash
node index.js
```

服务将在 `http://127.0.0.1:3000` 启动

## 📋 使用方法

### 命令行上传（推荐）
```bash
# 自动分类上传
node upload-client.js photo.jpg
# 结果: atrior/images/时间戳_photo.jpg

# 指定子目录上传
node upload-client.js photo.jpg gallery/2024
# 结果: atrior/gallery/2024/时间戳_photo.jpg
```

### API 调用
```bash
# 获取上传凭证
curl "http://127.0.0.1:3000/getKeyAndCredentials?filename=photo.jpg"

# 指定子目录
curl "http://127.0.0.1:3000/getKeyAndCredentials?filename=photo.jpg&path=custom"
```

### 演示脚本
```bash
./demo.sh
```

## 🔧 根目录配置

### 修改根目录
在 `.env` 文件中修改 `RootPath` 参数：

```env
RootPath=atrior
```

### 配置示例
| RootPath | 图片路径 | 文档路径 |
|----------|----------|----------|
| `atrior` | `atrior/images/` | `atrior/docs/` |
| `beacon` | `beacon/images/` | `beacon/docs/` |
| `coolarec` | `coolarec/images/` | `coolarec/docs/` |

## 📁 项目结构

```
atrior-cdn/
├── index.js           # 主服务文件
├── upload-client.js   # 上传客户端
├── demo.sh           # 演示脚本
├── CONFIG.md         # 详细配置说明
├── README.md         # 项目说明
├── .env              # 环境配置
├── package.json      # 依赖配置
```

## 🔐 安全注意事项

1. **环境变量保护** - 不要将 `.env` 文件提交到版本控制
2. **密钥权限** - 建议为服务创建专门的子账号，只授予必要权限
3. **网络安全** - 生产环境建议配置 HTTPS 和访问限制
4. **临时密钥** - 系统使用临时密钥，默认30分钟过期

## 📚 详细文档

- [CONFIG.md](CONFIG.md) - 详细配置说明
- [腾讯云 COS 文档](https://cloud.tencent.com/document/product/436)

## 🛠️ 开发

### 环境要求
- Node.js >= 14
- pnpm (推荐) 或 npm

### 本地开发
```bash
# 安装依赖
pnpm install

# 启动开发服务
node index.js

# 测试上传
node upload-client.js <your-file-path>
# demo: node upload-client.js demo.png
```

## 📄 许可证

MIT License
