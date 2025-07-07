const COS = require('cos-nodejs-sdk-v5');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

async function uploadFile(filePath, subPath = '') {
    try {
        // 1. 检查文件是否存在
        if (!fs.existsSync(filePath)) {
            throw new Error(`文件不存在: ${filePath}`);
        }

        const filename = path.basename(filePath);
        console.log(`开始上传文件: ${filename}`);

        // 2. 获取临时密钥
        const params = new URLSearchParams({ filename });
        if (subPath) {
            params.append('path', subPath);
        }

        const response = await fetch(`http://127.0.0.1:3000/getKeyAndCredentials?${params}`);
        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        console.log(`文件将上传到: ${data.key}`);

        // 3. 初始化 COS 客户端
        const cos = new COS({
            SecretId: data.credentials.tmpSecretId,
            SecretKey: data.credentials.tmpSecretKey,
            SecurityToken: data.credentials.sessionToken,
        });

        // 4. 上传文件
        const uploadResult = await new Promise((resolve, reject) => {
            cos.putObject({
                Bucket: data.bucket,
                Region: data.region,
                Key: data.key,
                Body: fs.createReadStream(filePath),
                onProgress: function(progressData) {
                    const percent = Math.round(progressData.percent * 100);
                    console.log(`上传进度: ${percent}%`);
                }
            }, function(err, uploadData) {
                if (err) {
                    reject(err);
                } else {
                    resolve(uploadData);
                }
            });
        });

        const fileUrl = data.cdnUrl || `https://cdn.shaly.sdutacm.cn/${data.key}`;
        console.log('✅ 上传成功!');
        console.log(`📁 文件路径: ${data.key}`);
        console.log(`🌐 CDN访问地址: ${fileUrl}`);
        
        return {
            success: true,
            key: data.key,
            url: fileUrl
        };

    } catch (error) {
        console.error('上传失败:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

// 命令行使用示例
if (require.main === module) {
    const filePath = process.argv[2];
    const subPath = process.argv[3] || '';

    if (!filePath) {
        console.log('使用方法: node upload-client.js <文件路径> [子目录]');
        console.log('示例: node upload-client.js test.jpg');
        console.log('示例: node upload-client.js test.jpg images');
        process.exit(1);
    }

    uploadFile(filePath, subPath);
}

module.exports = { uploadFile };
