# 腾讯云 COS 文件上传服务配置指南

## 环境变量配置

在 `.env` 文件中配置以下参数：

### 必需配置
```env
# 腾讯云访问密钥（必填）
SecretId=你的SecretId
SecretKey=你的SecretKey

# COS 存储桶配置（必填）
Bucket=你的存储桶名称
Region=存储桶地域

# 代理配置（可选，一般留空）
Proxy=
```

### 可选配置
```env
# CDN 根目录配置（可自定义）
RootPath=atrior

# CDN 访问域名配置（可自定义）
CdnDomain=https://cdn.shaly.sdutacm.cn
```

## 根目录配置说明

### RootPath 参数
- **默认值**: `atrior`
- **作用**: 设置所有上传文件的根目录
- **示例**: 
  - `RootPath=cdn` → 文件上传到 `/cdn/images/`, `/cdn/video/` 等
  - `RootPath=assets` → 文件上传到 `/assets/images/`, `/assets/video/` 等
  - `RootPath=uploads` → 文件上传到 `/uploads/images/`, `/uploads/video/` 等

### CdnDomain 参数
- **默认值**: `https://cdn.shaly.sdutacm.cn`
- **作用**: 设置文件访问的 CDN 域名
- **格式**: 完整的域名 URL，包含 `https://`
- **示例**:
  - `CdnDomain=https://cdn.example.com`
  - `CdnDomain=https://static.yoursite.com`
  - `CdnDomain=https://assets.company.com`

### 文件分类目录
系统会在根目录下自动创建以下子目录：

```
{RootPath}/
├── images/     # 图片文件 (.jpg, .png, .gif, .svg 等)
├── video/      # 视频文件 (.mp4, .avi, .mov, .mkv 等)
├── audio/      # 音频文件 (.mp3, .wav, .flac, .aac 等)
├── docs/       # 文档文件 (.pdf, .doc, .txt, .md 等)
├── css/        # 样式文件 (.css, .scss, .sass, .less)
└── other/      # 其他类型文件
```

### 文件命名规则
- **格式**: `时间戳_原文件名.扩展名`
- **示例**: `1751850190935_photo.jpg`
- **优势**: 确保文件名唯一，避免重名覆盖

## 使用示例

### 1. 修改根目录
编辑 `.env` 文件：
```env
RootPath=我的专属目录名称
```

重启服务后，文件将上传到：
- 图片: `mycdn/images/时间戳_filename.jpg`
- 视频: `mycdn/video/时间戳_filename.mp4`

### 2. 命令行上传
```bash
# 自动分类上传
node upload-client.js photo.jpg
# 结果: {RootPath}/images/时间戳_photo.jpg

# 指定子目录上传
node upload-client.js photo.jpg gallery/2024
# 结果: {RootPath}/gallery/2024/时间戳_photo.jpg
```

### 3. API 调用
```bash
# 获取上传凭证
curl "http://127.0.0.1:3000/getKeyAndCredentials?filename=test.jpg"

# 指定子目录
curl "http://127.0.0.1:3000/getKeyAndCredentials?filename=test.jpg&path=custom/folder"
```

## 注意事项

1. **重启生效**: 修改 `.env` 文件后需要重启服务
2. **路径安全**: 根目录名不能包含特殊字符，建议使用字母、数字、下划线
3. **历史文件**: 修改根目录不会影响已上传的文件
4. **权限配置**: 确保 COS 密钥有对应目录的写入权限

## 服务启动

```bash
# 启动服务
node index.js

# 服务将在 http://127.0.0.1:3000 启动
```
