#!/bin/bash

# 腾讯云 COS 上传服务使用示例

echo "🚀 腾讯云 COS 上传服务演示"
echo "================================"
echo ""

# 检查服务是否运行
if ! curl -s http://127.0.0.1:3000 > /dev/null 2>&1; then
    echo "❌ 服务未启动，请先运行: node index.js"
    exit 1
fi

echo "✅ 服务正常运行在 http://127.0.0.1:3000"
echo ""

# 读取当前配置的根目录和 CDN 域名
ROOT_PATH=$(grep "^RootPath=" .env 2>/dev/null | cut -d'=' -f2)
CDN_DOMAIN=$(grep "^CdnDomain=" .env 2>/dev/null | cut -d'=' -f2)
if [ -z "$ROOT_PATH" ]; then
    ROOT_PATH="atrior"
fi
if [ -z "$CDN_DOMAIN" ]; then
    CDN_DOMAIN="https://cdn.shaly.sdutacm.cn"
fi

echo "📁 当前根目录配置: $ROOT_PATH"
echo "🌐 CDN访问域名: $CDN_DOMAIN"
echo ""

echo "📋 文件类型自动分类演示:"
echo "------------------------"

# 测试不同类型的文件分类
echo "🖼️  图片文件: $(curl -s 'http://127.0.0.1:3000/getKeyAndCredentials?filename=photo.jpg' | grep -o "$ROOT_PATH/[^\"]*" | head -1)"
echo "🎬 视频文件: $(curl -s 'http://127.0.0.1:3000/getKeyAndCredentials?filename=movie.mp4' | grep -o "$ROOT_PATH/[^\"]*" | head -1)"
echo "🎵 音频文件: $(curl -s 'http://127.0.0.1:3000/getKeyAndCredentials?filename=song.mp3' | grep -o "$ROOT_PATH/[^\"]*" | head -1)"
echo "📄 文档文件: $(curl -s 'http://127.0.0.1:3000/getKeyAndCredentials?filename=doc.pdf' | grep -o "$ROOT_PATH/[^\"]*" | head -1)"
echo "🎨 CSS文件: $(curl -s 'http://127.0.0.1:3000/getKeyAndCredentials?filename=style.css' | grep -o "$ROOT_PATH/[^\"]*" | head -1)"
echo "❓ 其他文件: $(curl -s 'http://127.0.0.1:3000/getKeyAndCredentials?filename=script.js' | grep -o "$ROOT_PATH/[^\"]*" | head -1)"

echo ""
echo "📝 使用方法:"
echo "------------------------"
echo "1. 自动分类上传: node upload-client.js <文件名>"
echo "2. 指定目录上传: node upload-client.js <文件名> <子目录>"
echo "3. API调用: curl 'http://127.0.0.1:3000/getKeyAndCredentials?filename=<文件名>'"
echo ""
echo "💡 提示: 修改 .env 文件中的 RootPath 可以更改根目录"
echo "📖 详细配置请参考: CONFIG.md"
