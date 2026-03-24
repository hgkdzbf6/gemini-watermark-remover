# Raphael Watermark Remover

独立的 Raphael 水印去除模块，不影响原有的 Gemini 水印处理功能。

## 功能特性

- ✅ 自动检测 Raphael 水印位置
- ✅ 基于反向 Alpha 混合算法
- ✅ 支持多次迭代去除
- ✅ 自动提取 Alpha Map
- ✅ 独立模块，不影响原有功能

## 文件结构

```
src/core/raphael/
├── index.js                      # 主入口文件
├── raphaelWatermarkEngine.js     # 处理引擎
├── raphaelWatermarkDetector.js   # 水印检测
├── raphaelAlphaExtractor.js      # Alpha Map 提取
├── raphaelBlendModes.js          # 混合模式处理
└── README.md                     # 本文档
```

## 使用方法

### 1. 基本使用

```javascript
import { RaphaelWatermarkEngine } from './src/core/raphael/raphaelWatermarkEngine.js';

// 创建引擎实例
const engine = await RaphaelWatermarkEngine.create();

// 处理图片
const processedCanvas = await engine.removeWatermarkFromImage(image, {
  autoDetect: true,      // 自动检测水印位置
  multiPass: true,       // 多次迭代去除
  maxPasses: 3          // 最大迭代次数
});

// 获取处理后的图片
const dataUrl = processedCanvas.toDataURL();
```

### 2. 快速 API

```javascript
import { removeRaphaelWatermark } from './src/core/raphael/index.js';

// 一行代码去除水印
const processedCanvas = await removeRaphaelWatermark(image);
```

### 3. 手动指定位置

```javascript
const processedCanvas = await engine.removeWatermarkFromImage(image, {
  autoDetect: false,
  position: {
    x: 1800,
    y: 1050,
    width: 100,
    height: 25
  }
});
```

### 4. 提取和使用 Alpha Map

```javascript
import { extractAlphaMap, alphaMapToBase64 } from './src/core/raphael/index.js';

// 从带水印的图片提取 Alpha Map
const alphaMap = extractAlphaMap(imageData, position, {
  backgroundColor: 0,    // 背景颜色（黑色）
  watermarkColor: 255   // 水印颜色（白色）
});

// 转换为 Base64 以便嵌入代码
const base64 = alphaMapToBase64(alphaMap);

// 使用预计算的 Alpha Map
engine.setAlphaMap(100, 25, alphaMap);
```

## 测试页面

访问 `/public/raphael-test.html` 测试水印去除功能：

```bash
# 启动开发服务器
pnpm dev

# 访问测试页面
# http://localhost:5173/raphael-test.html
```

## 工作原理

### 1. 水印检测

- 分析图片右下角区域
- 检测亮色文字模式（白色或浅色）
- 计算水印边界框
- 验证尺寸和宽高比

### 2. Alpha Map 提取

使用反向混合公式：
```
brightness = α × watermark + (1 - α) × background
α = (brightness - background) / (watermark - background)
```

### 3. 水印去除

使用反向 Alpha 混合：
```
original = (watermarked - α × watermark) / (1 - α)
```

### 4. 多次迭代

对于顽固的水印，进行多次迭代：
- 第一次：alphaGain = 1.0
- 第二次：alphaGain = 1.2
- 第三次：alphaGain = 1.4

## API 参考

### RaphaelWatermarkEngine

#### `removeWatermarkFromImage(image, options)`

处理图片并去除水印。

**参数：**
- `image`: HTMLImageElement | HTMLCanvasElement - 输入图片
- `options`: Object - 处理选项
  - `autoDetect`: boolean - 自动检测位置（默认：true）
  - `position`: Object - 手动指定位置
  - `watermarkColor`: number - 水印颜色（默认：自动检测）
  - `multiPass`: boolean - 多次迭代（默认：true）
  - `maxPasses`: number - 最大迭代次数（默认：3）
  - `alphaMap`: Float32Array - 预计算的 Alpha Map

**返回：**
- Promise<HTMLCanvasElement> - 处理后的 canvas

### detectRaphaelWatermark(imageData)

检测图片中的 Raphael 水印。

**返回：**
```javascript
{
  type: 'raphael',
  position: { x, y, width, height },
  confidence: 0.85,
  detected: true
}
```

### extractAlphaMap(imageData, position, options)

从图片中提取 Alpha Map。

**参数：**
- `imageData`: ImageData - 图片数据
- `position`: Object - 水印位置
- `options`: Object
  - `backgroundColor`: number - 背景颜色（0-255）
  - `watermarkColor`: number - 水印颜色（0-255）

**返回：**
- Float32Array - Alpha Map 数据

## 与 Gemini 模块的区别

| 特性 | Gemini 模块 | Raphael 模块 |
|------|------------|--------------|
| 水印类型 | Gemini AI logo | raphael.app 文字 |
| 水印尺寸 | 48×48 或 96×96 | 约 100×25 |
| 水印形状 | 正方形 | 矩形 |
| Alpha Map | 预嵌入 | 动态提取 |
| 检测方式 | 基于图片尺寸 | 基于内容分析 |
| 位置 | 固定边距 | 自动检测 |

## 注意事项

1. **背景要求**：水印去除效果取决于背景的复杂度。纯色或简单背景效果最佳。

2. **Alpha Map 质量**：首次处理时会自动提取 Alpha Map，质量取决于输入图片。建议使用纯色背景的样本图片提取高质量 Alpha Map。

3. **性能**：多次迭代会增加处理时间，但能获得更好的去除效果。

4. **兼容性**：需要支持 Canvas API 的现代浏览器。

## 示例代码

完整示例请参考 `/public/raphael-test.html`。

## 许可证

与主项目相同的许可证。
