// 临时密钥服务例子
require('dotenv').config();
const STS = require('qcloud-cos-sts');
const express = require('express');
const pathLib = require('path');

// 配置参数
const config = {
  secretId: process.env.SecretId,
  secretKey: process.env.SecretKey,
  proxy: process.env.Proxy,
  durationSeconds: 1800,
  bucket: process.env.Bucket,
  region: process.env.Region,
  // CDN 根目录配置，默认为 'atrior'
  rootPath: process.env.RootPath || 'atrior',
  // CDN 访问域名配置
  cdnDomain: process.env.CdnDomain || 'https://cdn.shaly.sdutacm.cn',
  // 密钥的上传操作权限列表
  allowActions: [
    // 简单上传
    'name/cos:PutObject',
    // 分块上传
    'name/cos:InitiateMultipartUpload',
    'name/cos:ListMultipartUploads',
    'name/cos:ListParts',
    'name/cos:UploadPart',
    'name/cos:CompleteMultipartUpload',
  ],
};

// 生成要上传的 COS 文件路径文件名
const generateCosKey = function (filename, subPath = '') {
  const ext = pathLib.extname(filename).toLowerCase();
  const baseName = pathLib.basename(filename, ext);
  const timestamp = Date.now();

  // 根据文件扩展名自动分类到对应目录
  const getTypeByExtension = (extension) => {
    const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.ico'];
    const videoExts = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv', '.m4v'];
    const audioExts = ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.wma', '.m4a'];
    const docsExts = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.rtf', '.md', '.markdown'];
    const cssExts = ['.css', '.scss', '.sass', '.less'];

    if (imageExts.includes(extension)) return 'images';
    if (videoExts.includes(extension)) return 'video';
    if (audioExts.includes(extension)) return 'audio';
    if (docsExts.includes(extension)) return 'docs';
    if (cssExts.includes(extension)) return 'css';
    return 'other'; // 其他类型文件
  };

  // 确保所有文件都在配置的根目录下
  let pathPrefix = config.rootPath;

  // 如果用户指定了子路径，使用用户指定的路径，否则根据文件类型自动分类
  if (subPath && subPath.trim() !== '') {
    // 清理子路径，去除开头的斜杠，确保是子目录
    const cleanSubPath = subPath.replace(/^\/+/, '').replace(/\/+$/, '');
    if (cleanSubPath) {
      pathPrefix = `${config.rootPath}/${cleanSubPath}`;
    }
  } else {
    // 自动根据文件类型分类
    const autoType = getTypeByExtension(ext);
    pathPrefix = `${config.rootPath}/${autoType}`;
  }

  // 使用时间戳+原文件名的格式
  const newFileName = `${timestamp}_${baseName}${ext}`;
  const cosKey = `${pathPrefix}/${newFileName}`;
  return cosKey;
};

// 创建临时密钥服务
const app = express();
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// 获取临时密钥
function getSts({ cosKey, condition }) {
  return new Promise((resolve, reject) => {
    // 获取临时密钥
    const AppId = config.bucket.substr(config.bucket.lastIndexOf('-') + 1);
    let resource =
      'qcs::cos:' +
      config.region +
      ':uid/' +
      AppId +
      ':' +
      config.bucket +
      '/' +
      cosKey;
    console.log('检查resource是否正确', resource);
    const policy = {
      version: '2.0',
      statement: [
        {
          action: config.allowActions,
          effect: 'allow',
          resource: [
            // cos相关授权路径
            resource,
            // ci相关授权路径 按需使用
            // 'qcs::ci:' + config.region + ':uid/' + AppId + ':bucket/' + config.bucket + '/' + 'job/*',
          ],
          condition
        },
      ],
    };
    const startTime = Math.round(Date.now() / 1000);
    STS.getCredential(
      {
        secretId: config.secretId,
        secretKey: config.secretKey,
        proxy: config.proxy,
        region: config.region,
        durationSeconds: config.durationSeconds,
        // endpoint: 'sts.internal.tencentcloudapi.com', // 支持设置sts内网域名
        policy: policy,
      },
      function (err, tempKeys) {
        if (tempKeys) tempKeys.startTime = startTime;
        if (err) {
          reject(err);
        } else {
          resolve(tempKeys);
        }
      }
    );
  });
}

// 返回临时密钥和上传信息，客户端自行计算签名
app.get('/getKeyAndCredentials', function (req, res, next) {
  // 业务自行实现 用户登录态校验，比如对 token 校验
  // const userToken = req.query.userToken;
  // const canUpload = checkUserRole(userToken);
  // if (!canUpload) {
  //   res.send({ error: '当前用户没有上传权限' });
  //   return;
  // }

  // 上传文件可控制类型、大小，按需开启
  const permission = {
    limitExt: false, // 限制上传文件后缀
    extWhiteList: ['jpg', 'jpeg', 'png', 'gif', 'bmp'], // 限制的上传后缀
    limitContentType: false, // 限制上传 contentType
    limitContentLength: false, // 限制上传文件大小
  };

  // 客户端传进原始文件名，这里根据文件类型自动分类到对应目录
  const filename = req.query.filename;
  const customPath = req.query.path || ''; // 支持自定义子路径，但必须在根目录下
  if (!filename) {
    res.send({ error: '请传入文件名' });
    return;
  }
  const ext = pathLib.extname(filename);
  const cosKey = generateCosKey(filename, customPath);
  const condition = {};

  // 1. 限制上传文件后缀
  if (permission.limitExt) {
    const extInvalid = !ext || !extWhiteList.includes(ext);
    if (extInvalid) {
      res.send({ error: '非法文件，禁止上传' });
    }
  }

  // 2. 限制上传文件 content-type
  if (permission.limitContentType) {
    Object.assign(condition, {
      'string_like_if_exist': {
        // 只允许上传 content-type 为图片类型
        'cos:content-type': 'image/*'
      }
    });
  }

  // 3. 限制上传文件大小
  if (permission.limitContentLength) {
    Object.assign(condition, {
      'numeric_less_than_equal': {
        // 上传大小限制不能超过 5MB(只对简单上传生效)
        'cos:content-length': 5 * 1024 * 1024
      },
    });
  }

  getSts({ cosKey, condition })
    .then((data) => {
      res.send(
        Object.assign(data, {
          startTime: Math.round(Date.now() / 1000),
          bucket: config.bucket,
          region: config.region,
          key: cosKey,
          // 添加 CDN 访问地址
          cdnUrl: `${config.cdnDomain}/${cosKey}`,
        })
      );
    })
    .catch((err) => {
      res.send(err);
    });
});

app.all('*', function (req, res, next) {
  res.send({ code: -1, message: '404 Not Found' });
});

// 启动签名服务
app.listen(3000);
console.log('app is listening at http://127.0.0.1:3000');