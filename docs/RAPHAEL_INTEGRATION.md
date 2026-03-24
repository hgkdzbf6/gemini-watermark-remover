# Raphael 水印去除模块 - 集成指南

本指南说明如何将 Raphael 水印去除功能集成到现有项目中。

## 快速开始

### 1. 测试功能

```bash
# 启动开发服务器
pnpm dev

# 在浏览器中打开测试页面
# http://localhost:5173/raphael-test.html
```

### 2. 基本集成

```javascript
// 导入模块
import { RaphaelWatermarkEngine } from './src/core/raphael/raphaelWatermarkEngine.js';

// 创建引擎并处理图片
const engine = await RaphaelWatermarkEngine.create();
const processedCanvas = await engine.removeWatermarkFromImage(image);

// 使用处理后的图片
document.body.appendChild(processedCanvas);
```

### 3. 快速 API

```javascript
import { removeRaphaelWatermark } from './src/core/raphael/index.js';

// 一行代码去除水印
const result = await removeRaphaelWatermark(image);
```

## 与现有 Gemini 模块共存

Raphael 模块完全独立，不会影响现有的 Gemini 水印处理功能。

### 统一接口示例

```javascript
import { WatermarkEngine } from './src/core/watermarkEngine.js';
import { RaphaelWatermarkEngine } from './src/core/raphael/raphaelWatermarkEngine.js';

async function removeWatermark(image, type = 'auto') {
  if (type === 'raphael') {
    const engine = await RaphaelWatermarkEngine.create();
    return engine.removeWatermarkFromImage(image);
  }
  
  if (type === 'gemini') {
    const engine = await WatermarkEngine.create();
    return engine.removeWatermarkFromImage(image);
  }
  
  // Auto-detect
  // 可以根据图片特征自动选择引擎
  const hasRaphaelWatermark = await detectRaphaelWatermark(image);
  if (hasRaphaelWatermark) {
    const engine = await RaphaelWatermarkEngine.create();
    return engine.removeWatermarkFromImage(image);
  } else {
    const engine = await WatermarkEngine.create();
    return engine.removeWatermarkFromImage(image);
  }
}
```

## 提取高质量 Alpha Map

为了获得最佳去除效果，建议从纯色背景的样本图片中提取 Alpha Map：

### 步骤 1: 准备样本图片

1. 在 Raphael 上生成一张纯黑色背景的图片
2. 确保图片包含 "raphael.app" 水印
3. 保存为 PNG 格式

### 步骤 2: 提取 Alpha Map

```javascript
import { extractAlphaMap, alphaMapToBase64 } from './src/core/raphael/raphaelAlphaExtractor.js';
import { detectRaphaelWatermark } from './src/core/raphael/raphaelWatermarkDetector.js';

// 加载样本图片
const sampleImage = await loadImage('raphael-sample-black-bg.png');
const canvas = document.createElement('canvas');
canvas.width = sampleImage.width;
canvas.height = sampleImage.height;
const ctx = canvas.getContext('2d');
ctx.drawImage(sampleImage, 0, 0);
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

// 检测水印位置
const detection = detectRaphaelWatermark(imageData);

// 提取 Alpha Map
const alphaMap = extractAlphaMap(imageData, detection.position, {
  backgroundColor: 0,    // 黑色背景
  watermarkColor: 255   // 白色水印
});

// 转换为 Base64
const base64 = alphaMapToBase64(alphaMap);
console.log('Alpha Map Base64:', base64);

// 保存到文件或嵌入代码
```

### 步骤 3: 嵌入 Alpha Map

创建 `raphaelEmbeddedAlphaMaps.js`：

```javascript
const RAPHAEL_ALPHA_MAPS = {
  '100x25': 'YOUR_BASE64_STRING_HERE'
};

function decodeBase64(base64) {
  // ... 解码逻辑 ...
}

export function getRaphaelAlphaMap(width, height) {
  const key = `${width}x${height}`;
  if (!(key in RAPHAEL_ALPHA_MAPS)) {
    return null;
  }
  
  const bytes = decodeBase64(RAPHAEL_ALPHA_MAPS[key]);
  return new Float32Array(bytes.buffer);
}
```

### 步骤 4: 使用嵌入的 Alpha Map

```javascript
import { getRaphaelAlphaMap } from './raphaelEmbeddedAlphaMaps.js';

const engine = await RaphaelWatermarkEngine.create();
const alphaMap = getRaphaelAlphaMap(100, 25);

if (alphaMap) {
  engine.setAlphaMap(100, 25, alphaMap);
}

const result = await engine.removeWatermarkFromImage(image);
```

## 性能优化

### 1. 缓存 Alpha Map

```javascript
const engine = await RaphaelWatermarkEngine.create();

// 第一次处理时会提取并缓存 Alpha Map
await engine.removeWatermarkFromImage(image1);

// 后续处理会使用缓存的 Alpha Map，速度更快
await engine.removeWatermarkFromImage(image2);
await engine.removeWatermarkFromImage(image3);
```

### 2. 批量处理

```javascript
const engine = await RaphaelWatermarkEngine.create();
const images = [...]; // 图片数组

const results = await Promise.all(
  images.map(img => engine.removeWatermarkFromImage(img))
);
```

### 3. Web Worker 支持

```javascript
// worker.js
import { RaphaelWatermarkEngine } from './src/core/raphael/raphaelWatermarkEngine.js';

self.onmessage = async (e) => {
  const { imageData, options } = e.data;
  const engine = await RaphaelWatermarkEngine.create();
  
  // 处理图片
  const result = await engine.removeWatermarkFromImage(imageData, options);
  
  self.postMessage({ result });
};
```

## 故障排除

### 问题 1: 水印未被检测到

**解决方案：**
- 手动指定水印位置
- 检查图片是否包含 Raphael 水印
- 调整检测阈值

```javascript
const result = await engine.removeWatermarkFromImage(image, {
  autoDetect: false,
  position: { x: 1800, y: 1050, width: 100, height: 25 }
});
```

### 问题 2: 去除效果不理想

**解决方案：**
- 启用多次迭代
- 增加迭代次数
- 提取更高质量的 Alpha Map

```javascript
const result = await engine.removeWatermarkFromImage(image, {
  multiPass: true,
  maxPasses: 5  // 增加迭代次数
});
```

### 问题 3: 处理速度慢

**解决方案：**
- 使用预计算的 Alpha Map
- 减少迭代次数
- 使用 Web Worker

```javascript
const result = await engine.removeWatermarkFromImage(image, {
  multiPass: false,  // 禁用多次迭代
  alphaMap: precomputedAlphaMap  // 使用预计算的 Alpha Map
});
```

## 完整示例

参考以下文件获取完整示例：

- `/public/raphael-test.html` - 测试页面
- `/examples/raphael-usage-examples.js` - 使用示例
- `/src/core/raphael/README.md` - API 文档

## 技术支持

如有问题，请查看：
- API 文档：`/src/core/raphael/README.md`
- 示例代码：`/examples/raphael-usage-examples.js`
- 测试页面：`/public/raphael-test.html`
