# Raphael 水印去除 - 故障排除指南

## 问题：processedCanvas.toDataURL is not a function

### 原因
`OffscreenCanvas` 对象没有 `toDataURL()` 方法，只有标准的 `HTMLCanvasElement` 才有。

### 解决方案 ✅

已在以下文件中修复：

1. **src/core/raphael/raphaelWatermarkEngine.js**
   - 修改 `createRuntimeCanvas()` 函数
   - 优先使用 `document.createElement('canvas')` 而不是 `OffscreenCanvas`
   - 确保返回的 canvas 支持 `toDataURL()`

2. **public/raphael-test.html**
   - 添加了 canvas 类型检测
   - 支持两种 canvas 类型的回退处理
   - 改进了下载功能以支持不同的 canvas 类型

### 验证修复

运行验证脚本：
```bash
node scripts/test-raphael-module.js
```

应该看到：
```
✅ Built file exists
✅ Test page exists
✅ Export found: RaphaelWatermarkEngine
✅ All checks passed!
```

### 重新构建

如果问题仍然存在，请重新构建：

```bash
# 清理旧的构建
rm -rf dist

# 重新构建
pnpm build

# 验证
node scripts/test-raphael-module.js

# 启动服务器
pnpm serve
```

### 测试步骤

1. 打开浏览器开发者工具（F12）
2. 访问 `http://localhost:4173/raphael-test.html`
3. 查看控制台输出：
   ```
   ✅ Raphael module loaded successfully
   ```
4. 上传图片
5. 查看控制台输出：
   ```
   📸 Loading image: [filename]
   ✅ Image loaded: [width] x [height]
   🔧 Creating engine...
   ✅ Engine created
   🎨 Processing image...
   📦 Canvas type: HTMLCanvasElement
   📦 Has toDataURL: function
   ✅ Processing complete in [time] ms
   ```

### 预期行为

- Canvas 类型应该是 `HTMLCanvasElement`
- `toDataURL` 应该是 `function`
- 图片应该正常显示
- 下载按钮应该正常工作

### 如果问题仍然存在

1. **检查浏览器兼容性**
   - 使用现代浏览器（Chrome 90+, Firefox 88+, Safari 14+）
   - 确保 JavaScript 已启用

2. **清除浏览器缓存**
   ```
   Ctrl + Shift + Delete (Windows)
   Cmd + Shift + Delete (Mac)
   ```
   或者使用硬刷新：
   ```
   Ctrl + F5 (Windows)
   Cmd + Shift + R (Mac)
   ```

3. **检查控制台错误**
   - 打开开发者工具（F12）
   - 切换到 Console 标签
   - 查看是否有其他错误信息

4. **验证服务器状态**
   ```bash
   # 检查服务器是否运行
   curl -I http://localhost:4173/raphael-test.html
   
   # 应该返回 200 OK
   
   # 检查模块是否可访问
   curl -I http://localhost:4173/raphael-watermark-remover.js
   
   # 应该返回 200 OK
   ```

5. **重新安装依赖**
   ```bash
   rm -rf node_modules dist
   pnpm install
   pnpm build
   pnpm serve
   ```

## 其他常见问题

### 问题：模块加载失败

**症状：**
```
❌ Failed to load Raphael module: Error: ...
```

**解决方案：**
1. 确保已运行 `pnpm build`
2. 检查 `dist/raphael-watermark-remover.js` 是否存在
3. 重启开发服务器

### 问题：水印检测失败

**症状：**
```
Detection Confidence: N/A
Auto-detected: No
```

**解决方案：**
1. 确保图片包含 Raphael 水印
2. 尝试手动指定位置（取消勾选 "Auto-detect"）
3. 检查图片格式是否支持

### 问题：处理速度慢

**症状：**
处理时间超过 5 秒

**解决方案：**
1. 取消勾选 "Multi-pass removal"
2. 使用较小的图片测试
3. 检查浏览器性能

## 调试技巧

### 启用详细日志

测试页面已包含详细的控制台日志：

```javascript
console.log('📸 Loading image:', file.name);
console.log('✅ Image loaded:', img.width, 'x', img.height);
console.log('🔧 Creating engine...');
console.log('✅ Engine created');
console.log('🎨 Processing image...');
console.log('📦 Canvas type:', processedCanvas.constructor.name);
console.log('📦 Has toDataURL:', typeof processedCanvas.toDataURL);
console.log('✅ Processing complete in', processingTime, 'ms');
console.log('📊 Processing metadata:', meta);
```

### 手动测试模块

在浏览器控制台中：

```javascript
// 导入模块
const module = await import('./raphael-watermark-remover.js');
const { RaphaelWatermarkEngine } = module;

// 创建引擎
const engine = await RaphaelWatermarkEngine.create();
console.log('Engine created:', engine);

// 测试处理（需要先上传图片）
const img = document.querySelector('img');
const result = await engine.removeWatermarkFromImage(img);
console.log('Result:', result);
console.log('Canvas type:', result.constructor.name);
console.log('Has toDataURL:', typeof result.toDataURL);
```

## 联系支持

如果问题仍未解决，请提供以下信息：

1. 浏览器版本和操作系统
2. 完整的控制台错误信息
3. 构建日志输出
4. 测试图片的尺寸和格式
5. 重现步骤

## 相关文档

- API 文档: `src/core/raphael/README.md`
- 集成指南: `docs/RAPHAEL_INTEGRATION.md`
- 快速开始: `docs/RAPHAEL_QUICKSTART.md`
- 项目总结: `docs/RAPHAEL_MODULE_SUMMARY.md`
